import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/** Route prefixes that require a signed-in user. */
const APP_PREFIXES = [
  "/dashboard",
  "/appointments",
  "/profile",
  "/doctor",
  "/admin",
  "/book",
  "/intake",
  "/consult",
];

const matches = (path: string, prefix: string) =>
  path === prefix || path.startsWith(prefix + "/");

/**
 * Refreshes the Supabase session cookie on every request, gates the app
 * routes behind auth, and routes signed-in users away from /login by role.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Normalise the trailing slash (next.config has trailingSlash: true) so exact
  // path checks like `=== "/login"` don't silently miss.
  const path = request.nextUrl.pathname.replace(/(.)\/$/, "$1");
  const needsAuth = APP_PREFIXES.some((p) => matches(path, p));

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  // Role-aware redirects only where it matters (login landing, role sections).
  const needsRole =
    !!user &&
    (path === "/login" || matches(path, "/doctor") || matches(path, "/admin"));

  if (needsRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role ?? "patient";
    const home =
      role === "doctor"
        ? "/doctor/dashboard"
        : role === "admin"
          ? "/admin"
          : "/dashboard";

    if (path === "/login") {
      // A signed-in user who lands on /login goes to where they were headed
      // (?next=), otherwise the home page — not straight to the dashboard.
      const nx = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      url.pathname = nx && nx.startsWith("/") ? nx : "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (matches(path, "/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
    if (matches(path, "/doctor") && role !== "doctor" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }
  }

  return response;
}
