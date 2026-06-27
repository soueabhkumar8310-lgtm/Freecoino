import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("user_id") || searchParams.get("userid") || searchParams.get("uid");
    const transactionId = searchParams.get("txn_id") || searchParams.get("transaction_id") || searchParams.get("offer_id");
    const amountStr = searchParams.get("amount") || searchParams.get("user_amount") || searchParams.get("payout");
    const offerName = searchParams.get("offer_name") || "Taskwall Offer";

    console.log("📥 Taskwall Postback:", { userId, transactionId, amountStr, offerName });

    if (!userId || !transactionId || !amountStr) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const coinsToAward = parseInt(amountStr, 10);
    if (isNaN(coinsToAward) || coinsToAward <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existing } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "taskwall")
      .maybeSingle();

    if (existing) {
      return new NextResponse("OK", { status: 200 });
    }

    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: offerName,
        offer_provider: "taskwall",
        coins_awarded: coinsToAward,
        amount_earned: coinsToAward,
        status: "completed",
      });

    if (insertError) {
      console.error("Taskwall insert error:", insertError);
      return new NextResponse("Error", { status: 200 });
    }

    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: coinsToAward,
      p_type: "earn",
      p_description: `Taskwall Offer: ${offerName}`,
    });

    if (rpcError) {
      console.error("Taskwall add_coins error:", rpcError);
      // Fallback: update profiles directly
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("coins_balance, total_earned")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        const newBalance = Math.max(0, (profile.coins_balance || 0) + coinsToAward);
        const newTotalEarned = (profile.total_earned || 0) + coinsToAward;
        await supabaseAdmin
          .from("profiles")
          .update({ coins_balance: newBalance, total_earned: newTotalEarned })
          .eq("id", userId);
        console.log(`⚠️ Taskwall fallback: balance ${newBalance}, total ${newTotalEarned} for user ${userId}`);
      } else {
        console.error("❌ Taskwall fallback: user not found in profiles:", userId);
        return new NextResponse("User not found", { status: 200 });
      }
    }

    try {
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Offer Completed! 🎉",
          message: `You earned ${coinsToAward} coins from Taskwall!`,
          type: "success",
          is_read: false,
        });
    } catch (notifError) {
      console.error("Taskwall notification error:", notifError);
    }

    console.log(`✅ Taskwall postback processed: ${coinsToAward} coins to ${userId}`);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Taskwall postback error:", error);
    return new NextResponse("Error", { status: 200 });
  }
}
