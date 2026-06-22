import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  return handlePostback(request);
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

async function handlePostback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // GemiAd postback parameters
    const userId =
      searchParams.get("user_id") ||
      searchParams.get("userId") ||
      searchParams.get("external_user_id");
    const transactionId =
      searchParams.get("transaction_id") ||
      searchParams.get("transactionId") ||
      searchParams.get("tx_id") ||
      searchParams.get("txid");
    const amount =
      searchParams.get("amount") ||
      searchParams.get("payout") ||
      searchParams.get("reward");
    const offerName =
      searchParams.get("offer_name") ||
      searchParams.get("offerName") ||
      searchParams.get("offer_title");
    const status = searchParams.get("status") || "completed";

    console.log("📥 GemiAd Postback received:", {
      userId,
      transactionId,
      amount,
      offerName,
      status,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (!userId || !transactionId || !amount) {
      console.error("❌ Missing required parameters:", { userId, transactionId, amount });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: user_id, transaction_id, amount",
          received: Object.fromEntries(searchParams.entries()),
        },
        { status: 400 }
      );
    }

    const coinAmount = parseFloat(amount);
    if (isNaN(coinAmount) || coinAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
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
      .eq("offer_provider", "gemiad")
      .single();

    if (existingOffer) {
      console.log("⚠️ Duplicate transaction detected:", transactionId);
      return NextResponse.json(
        { success: true, message: "Transaction already processed" },
        { status: 200 }
      );
    }

    const displayName = offerName || "GemiAd Offer";

    // Insert into offer_completions for tracking + My Offers page
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: displayName,
        offer_provider: "gemiad",
        coins_awarded: Math.round(coinAmount),
        amount_earned: Math.round(coinAmount),
        status: "completed",
      });

    if (insertError) {
      console.error("❌ Error inserting offer_completion:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record offer completion" },
        { status: 500 }
      );
    }

    // Add coins using the database RPC (atomic)
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: Math.round(coinAmount),
      p_type: "earn",
      p_description: `GemiAd: ${displayName} (txn: ${transactionId})`,
    });

    if (rpcError) {
      console.error("❌ RPC add_coins error:", rpcError);
      // Fallback: update profiles directly
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("coins_balance")
        .eq("id", userId)
        .single();

      if (profile) {
        const newBalance = Math.max(0, (profile.coins_balance || 0) + Math.round(coinAmount));
        await supabaseAdmin
          .from("profiles")
          .update({ coins_balance: newBalance })
          .eq("id", userId);
        console.log(`⚠️ Fallback balance update: ${newBalance} for user ${userId}`);
      } else {
        console.error("❌ User not found in profiles:", userId);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
    }

    // Also write to gemiad_transactions for history page
    try {
      await supabaseAdmin.from("gemiad_transactions").insert({
        user_id: userId,
        txid: transactionId,
        reward: Math.round(coinAmount),
        offer_name: displayName,
        status: status,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("⚠️ gemiad_transactions insert failed (table may not exist):", e);
    }

    // Create notification for user
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "Offer Completed! 🎉",
        message: `You earned ${Math.round(coinAmount)} coins from ${displayName}!`,
        type: "success",
        is_read: false,
      });
    } catch (notifError) {
      console.warn("⚠️ Notification insert failed:", notifError);
    }

    console.log("✅ GemiAd postback processed successfully:", {
      userId,
      transactionId,
      amount: coinAmount,
      displayName,
    });

    return NextResponse.json(
      { success: true, message: "Postback processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ GemiAd postback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
