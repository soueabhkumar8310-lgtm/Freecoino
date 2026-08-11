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
  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, display_name")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      coins={userData?.coins_balance ?? 0}
      userId={user.id}
      userName={userData?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <LeaderboardClient userId={user.id} />
    </AppShell>
  );
}
