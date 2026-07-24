import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Taskwall postback parameters
    const userId = searchParams.get("userid") || searchParams.get("user_id");
    const offerId = searchParams.get("offer_id") || searchParams.get("oid");
    const offerName = searchParams.get("offer_name") || searchParams.get("title");
    const status = searchParams.get("status") || "completed";
    const payout = searchParams.get("payout") || searchParams.get("reward") || "0";
    const transactionId = searchParams.get("transaction_id") || searchParams.get("tid");

    console.log("🔔 Taskwall Postback Received:");
    console.log("User ID:", userId);
    console.log("Offer ID:", offerId);
    console.log("Offer Name:", offerName);
    console.log("Status:", status);
    console.log("Payout (USD):", payout);
    console.log("Transaction ID:", transactionId);

    if (!userId) {
      console.error("❌ Missing user_id");
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    if (!offerId) {
      console.error("❌ Missing offer_id");
      return NextResponse.json(
        { success: false, error: "Missing offer_id" },
        { status: 400 }
      );
    }

    // Convert payout from USD to coins (1 USD = 1000 coins)
    const payoutUSD = parseFloat(payout);
    const coinsToAdd = Math.round(payoutUSD * 1000);

    console.log(`💰 Converting ${payoutUSD} USD to ${coinsToAdd} coins`);

    if (coinsToAdd <= 0) {
      console.error("❌ Invalid payout amount");
      return NextResponse.json(
        { success: false, error: "Invalid payout" },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user's current balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("❌ Error fetching user:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const currentBalance = userData.balance || 0;
    const newBalance = currentBalance + coinsToAdd;

    console.log(`💳 Current balance: ${currentBalance} coins`);
    console.log(`➕ Adding: ${coinsToAdd} coins`);
    console.log(`💳 New balance: ${newBalance} coins`);

    // Update user's balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Error updating balance:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update balance" },
        { status: 500 }
      );
    }

    // Record transaction in completions table
    const { error: completionError } = await supabase
      .from("completions")
      .insert({
        user_id: userId,
        offer_id: offerId,
        offer_name: offerName || `Taskwall Offer ${offerId}`,
        provider: "Taskwall",
        coins_earned: coinsToAdd,
        status: "completed",
        transaction_id: transactionId,
        payout_usd: payoutUSD,
        completed_at: new Date().toISOString(),
      });

    if (completionError) {
      console.error("⚠️ Error recording completion:", completionError);
      // Don't fail the postback if we can't record the completion
    }

    console.log("✅ Taskwall postback processed successfully!");
    console.log(`✅ ${coinsToAdd} coins credited to user ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Coins credited successfully",
      coins_added: coinsToAdd,
      new_balance: newBalance,
    });
  } catch (error) {
    console.error("❌ Taskwall postback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Also handle POST requests (some offerwalls send POST)
export async function POST(request: NextRequest) {
  return GET(request);
}
