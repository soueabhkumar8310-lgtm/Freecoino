import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id") || searchParams.get("uid") || searchParams.get("subid");
    const transactionId = searchParams.get("tx_id") || searchParams.get("transaction_id") || searchParams.get("trans_id");
    const amountStr = searchParams.get("amount") || searchParams.get("reward_usd");

    console.log('🔔 CPX Research Postback received:', { userId, transactionId, amountStr });

    if (!userId || !transactionId || !amountStr) {
      console.error('❌ Missing required parameters');
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // CPX sends amount in USD, convert to coins (1 USD = 1000 coins)
    const amountUsd = parseFloat(amountStr);
    if (isNaN(amountUsd) || amountUsd <= 0) {
      console.error('❌ Invalid amount:', amountStr);
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const coinsToAward = Math.round(amountUsd * 1000);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if duplicate transaction
    const { data: existingOffer, error: existingError } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "cpx_research")
      .single();

    if (existingOffer) {
      console.log('⚠️ Duplicate transaction detected, returning OK');
      return new NextResponse("OK", { status: 200 });
    }

    // Insert into offer_completions to track and prevent future duplicates
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "CPX Survey",
        offer_provider: "cpx_research",
        coins_awarded: coinsToAward,
        status: "completed"
      });

    if (insertError) {
      console.error("❌ Error inserting offer completion:", insertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Add coins using the database RPC
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: coinsToAward,
      p_type: "earn",
      p_description: `CPX Survey: ${transactionId} ($${amountUsd.toFixed(2)})`
    });

    if (rpcError) {
      console.error("❌ Error adding coins:", rpcError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Create notification for user
    try {
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Survey Completed! 🎉",
          message: `You earned ${coinsToAward} coins from a CPX Survey!`,
          type: "success",
          is_read: false,
        });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ CPX postback processed: ${coinsToAward} coins (${amountUsd} USD) awarded to ${userId}`);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ CPX postback error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
