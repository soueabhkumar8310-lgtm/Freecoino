import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import DailyBonusClient from "@/components/daily-bonus-client";

export default async function DailyBonusPage() {
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

  // Fetch daily bonuses for streak calculation
  const { data: bonuses } = await supabase
    .from("daily_bonuses")
    .select("*")
    .eq("user_id", user.id)
    .order("claimed_at", { ascending: false })
    .limit(1);

  let streakCount = 0;
  let alreadyClaimed = false;
  let todayReward: number | null = null;
  let todayStreak: number | null = null;

  if (bonuses && bonuses.length > 0) {
    const lastClaim = bonuses[0];
    const lastClaimDate = new Date(lastClaim.claimed_at);
    const today = new Date();
    
    // Normalize dates to midnight to compare days
    const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate());
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = Math.abs(currentDay.getTime() - lastClaimDay.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Claimed today
      alreadyClaimed = true;
      streakCount = lastClaim.day_number;
      todayReward = lastClaim.amount;
      todayStreak = lastClaim.day_number;
    } else if (diffDays === 1) {
      // Claimed yesterday, streak is active
      streakCount = lastClaim.day_number === 7 ? 0 : lastClaim.day_number; // Reset if reached 7
    } else {
      // Missed a day, streak is broken
      streakCount = 0;
    }
  }

  // Calculate today's total coins earned to check if they unlocked the bonus (needs 1000)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayCoinsEarned =
    transactions?.reduce((sum, tx) => {
      // Only count positive earnings, not withdrawals
      return tx.amount > 0 ? sum + tx.amount : sum;
    }, 0) || 0;

  return (
    <AppShell
      coins={profile.coins_balance}
      userId={user.id}
      userName={profile.display_name}
      userAvatar={profile.avatar_url}
    >
      <DailyBonusClient
        streakCount={streakCount}
        alreadyClaimed={alreadyClaimed}
        todayReward={todayReward}
        todayStreak={todayStreak}
        todayCoinsEarned={todayCoinsEarned}
      />
    </AppShell>
  );
}
