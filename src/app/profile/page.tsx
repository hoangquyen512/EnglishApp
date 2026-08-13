import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileView } from "@/components/profile-view";
import { getProfile } from "@/lib/companion/service";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = getProfile(session.user.id);
  return (
    <ProfileView
      displayName={profile.displayName}
      level={profile.level}
      mood={profile.mood}
      moodNote={profile.moodNote}
    />
  );
}
