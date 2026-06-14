import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const STREAK_REWARDS = [0, 10, 20, 30, 40, 50, 75, 100];

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS for inserts/updates
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check if user has earned 1000 coins today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: transactions } = await supabaseAdmin
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString());

    const todayCoinsEarned =
      transactions?.reduce((sum, tx) => (tx.amount > 0 ? sum + tx.amount : sum), 0) || 0;

    if (todayCoinsEarned < 1000) {
      return NextResponse.json(
        { error: "You need to earn 1000 coins today to unlock the daily bonus!" },
        { status: 400 }
      );
    }

    // 2. Fetch last bonus to check streak and if already claimed
    const { data: bonuses } = await supabaseAdmin
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", user.id)
      .order("claimed_at", { ascending: false })
      .limit(1);

    let nextDay = 1;

    if (bonuses && bonuses.length > 0) {
      const lastClaim = bonuses[0];
      const lastClaimDate = new Date(lastClaim.claimed_at);
      const today = new Date();
      
      const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate());
      const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = Math.abs(currentDay.getTime() - lastClaimDay.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return NextResponse.json(
          { error: "You have already claimed your daily bonus today!" },
          { status: 400 }
        );
      } else if (diffDays === 1) {
        // Continue streak, or reset if completed 7 days
        nextDay = lastClaim.day_number === 7 ? 1 : lastClaim.day_number + 1;
      } else {
        // Streak broken
        nextDay = 1;
      }
    }

    const rewardAmount = STREAK_REWARDS[nextDay] || 10;

    // 3. Insert into daily_bonuses
    const { error: bonusError } = await supabaseAdmin
      .from("daily_bonuses")
      .insert({
        user_id: user.id,
        day_number: nextDay,
        amount: rewardAmount,
      });

    if (bonusError) {
      console.error("Daily bonus insert error:", bonusError);
      return NextResponse.json({ error: "Failed to claim bonus" }, { status: 500 });
    }

    // 4. Insert transaction
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "daily_bonus",
        amount: rewardAmount,
        description: `Daily Bonus Day ${nextDay}`,
      });

    if (txError) {
      console.error("Transaction insert error:", txError);
      return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
    }

    // 5. Fetch current balance
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("coins_balance")
      .eq("id", user.id)
      .single();

    const currentBalance = profile?.coins_balance || 0;

    // 6. Update profile balance
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ coins_balance: currentBalance + rewardAmount })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reward: rewardAmount,
      streakDay: nextDay,
    });
  } catch (error) {
    console.error("Daily bonus catch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
