import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/nav-config";
import { AppChrome } from "@/components/layout/app-chrome";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "patient") as Role;

  return (
    <AppChrome role={role} who={profile?.full_name ?? "You"}>
      {children}
    </AppChrome>
  );
}
