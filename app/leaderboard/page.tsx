import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import LeaderboardClient from "@/components/leaderboard-client";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("coins_balance, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  return (
    <AppShell
      coins={profile.coins_balance}
      userId={user.id}
      userName={profile.display_name}
      userAvatar={profile.avatar_url}
    >
      <LeaderboardClient userId={user.id} />
    </AppShell>
  );
}
