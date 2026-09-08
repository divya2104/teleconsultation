import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/db/queries";
import { ProfileForm } from "@/components/patient/profile-form";

export const metadata = { title: "Profile & consent" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const profile = await getMyProfile();
  if (!profile) redirect("/login");
  return <ProfileForm profile={profile} />;
}
