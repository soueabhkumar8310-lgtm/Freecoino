import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Timewall postback parameters (flexible matching)
    const userId =
      searchParams.get("user_id") ||
      searchParams.get("uid") ||
      searchParams.get("userId");
    const transactionId =
      searchParams.get("tx_id") ||
      searchParams.get("transaction_id") ||
      searchParams.get("transactionId") ||
      searchParams.get("txid");
    const amountStr =
      searchParams.get("amount") ||
      searchParams.get("payout") ||
      searchParams.get("reward");

    console.log("📥 Timewall Postback received:", {
      userId,
      transactionId,
      amountStr,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (!userId || !transactionId || !amountStr) {
      console.error("❌ Missing required parameters:", { userId, transactionId, amountStr });
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const coinAmount = parseFloat(amountStr);
    if (isNaN(coinAmount) || coinAmount <= 0) {
      console.error("❌ Invalid amount:", amountStr);
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for duplicate transaction
    const { data: existingOffer } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "timewall")
      .maybeSingle();

    if (existingOffer) {
      console.log("⚠️ Duplicate transaction detected:", transactionId);
      return new NextResponse("OK", { status: 200 });
    }

    // Insert into offer_completions for tracking + My Offers page
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "Timewall Task",
        offer_provider: "timewall",
        coins_awarded: Math.round(coinAmount),
        amount_earned: Math.round(coinAmount),
        status: "completed",
      });

    if (insertError) {
      console.error("❌ Error inserting offer_completion:", insertError);
      return new NextResponse("Internal Server Error", { status: 200 });
    }

    // Add coins using the database RPC (atomic)
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: Math.round(coinAmount),
      p_type: "earn",
      p_description: `Timewall Offer: ${transactionId}`,
    });

    if (rpcError) {
      console.error("❌ RPC add_coins error:", rpcError);
      // Fallback: update profiles directly
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("coins_balance, total_earned")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        const newBalance = Math.max(0, (profile.coins_balance || 0) + Math.round(coinAmount));
        const newTotalEarned = (profile.total_earned || 0) + Math.round(coinAmount);
        await supabaseAdmin
          .from("profiles")
          .update({ coins_balance: newBalance, total_earned: newTotalEarned })
          .eq("id", userId);
        console.log(`⚠️ Timewall fallback: balance ${newBalance}, total ${newTotalEarned} for user ${userId}`);
      } else {
        console.error("❌ User not found in profiles:", userId);
        return new NextResponse("User not found", { status: 200 });
      }
    }

    // Create notification for user
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "Offer Completed! 🎉",
        message: `You earned ${Math.round(coinAmount)} coins from Timewall Task!`,
        type: "success",
        is_read: false,
      });
    } catch (notifError) {
      console.warn("⚠️ Notification insert failed:", notifError);
    }

    console.log("✅ Timewall postback processed successfully:", {
      userId,
      transactionId,
      amount: coinAmount,
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Timewall postback error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
