import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}

async function handlePostback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract Notik postback parameters
    const user_id = searchParams.get("user_id");
    const amount = searchParams.get("amount"); // Virtual currency amount (coins)
    const payout = searchParams.get("payout"); // USD payout
    const offer_id = searchParams.get("offer_id");
    const offer_name = searchParams.get("offer_name");
    const txn_id = searchParams.get("txn_id"); // Unique transaction ID
    const event_id = searchParams.get("event_id");
    const event_name = searchParams.get("event_name");
    const hash = searchParams.get("hash");
    const conversion_ip = searchParams.get("conversion_ip");
    const timestamp = searchParams.get("timestamp");

    console.log("📥 Notik Postback received:", {
      user_id,
      amount,
      payout,
      offer_id,
      offer_name,
      txn_id,
      event_name,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // Validate required parameters
    if (!user_id || !txn_id || !amount) {
      console.error("❌ Missing required parameters:", { user_id, txn_id, amount });
      return NextResponse.json(
        { success: false, error: "Missing required parameters: user_id, txn_id, amount" },
        { status: 400 }
      );
    }

    // Verify hash signature
    const secretKey = process.env.NOTIK_API_SECRET;
    if (hash && secretKey) {
      const fullUrl = request.url;
      const hashStr = `&hash=${hash}`;
      const idx = fullUrl.lastIndexOf(hashStr);
      const urlWithoutHash = idx >= 0 ? fullUrl.substring(0, idx) : fullUrl;

      const expectedHash = crypto
        .createHmac("sha1", secretKey)
        .update(urlWithoutHash)
        .digest("hex");

      if (hash !== expectedHash) {
        console.error("❌ Invalid hash signature!");
        return NextResponse.json(
          { success: false, error: "Invalid signature" },
          { status: 403 }
        );
      }
      console.log("✅ Hash verification passed");
    }

    const coinAmount = parseFloat(amount);
    if (isNaN(coinAmount)) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 200 });
    }

    const awardAmount = Math.max(1, Math.round(coinAmount));

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for duplicate transaction
    const { data: existingOffer } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", user_id)
      .eq("offer_id", txn_id)
      .eq("offer_provider", "notik")
      .maybeSingle();

    if (existingOffer) {
      console.log("⚠️ Duplicate transaction detected:", txn_id);
      return NextResponse.json({ success: true, message: "Transaction already processed" }, { status: 200 });
    }

    const isChargeback = coinAmount < 0;
    const displayName = event_name
      ? `Notik - ${event_name}`
      : offer_name || "Notik Offer";

    // Insert into offer_completions for tracking + My Offers page
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: user_id,
        offer_id: txn_id,
        offer_name: displayName,
        offer_provider: "notik",
        coins_awarded: awardAmount,
        amount_earned: payout ? parseFloat(payout) : awardAmount,
        status: isChargeback ? "rejected" : "completed",
      });

    if (insertError) {
      console.error("❌ Error inserting offer_completion:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record offer completion" },
        { status: 200 }
      );
    }

    const addAmount = isChargeback ? -awardAmount : awardAmount;

    // Add coins using the database RPC (atomic)
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: user_id,
      p_amount: addAmount,
      p_type: isChargeback ? "chargeback" : "earn",
      p_description: `Notik: ${displayName} (txn: ${txn_id})`,
    });

    if (rpcError) {
      console.error("❌ RPC add_coins error:", rpcError);
      // Fallback: update profiles directly
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("coins_balance, total_earned")
        .eq("id", user_id)
        .maybeSingle();

      if (profile) {
        const newBalance = Math.max(0, (profile.coins_balance || 0) + addAmount);
        const newTotalEarned = !isChargeback ? (profile.total_earned || 0) + addAmount : profile.total_earned;
        await supabaseAdmin
          .from("profiles")
          .update({ coins_balance: newBalance, total_earned: newTotalEarned })
          .eq("id", user_id);
        console.log(`⚠️ Notik fallback: balance ${newBalance}, total ${newTotalEarned} for user ${user_id}`);
      } else {
        console.error("❌ User not found in profiles:", user_id);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 200 }
        );
      }
    }

    // Also write to notik_transactions for history page
    try {
      await supabaseAdmin.from("notik_transactions").insert({
        user_id: user_id,
        txn_id: txn_id,
        amount: awardAmount,
        offer_name: displayName,
        event_name: event_name || null,
        created_at: timestamp || new Date().toISOString(),
      });
    } catch (e) {
      console.warn("⚠️ notik_transactions insert failed (table may not exist):", e);
    }

    // Create notification for user
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: user_id,
        title: isChargeback ? "Offer Reversed ⚠️" : "Offer Completed! 🎉",
        message: isChargeback
          ? `${awardAmount} coins reversed from ${displayName}`
          : `You earned ${awardAmount} coins from ${displayName}!`,
        type: isChargeback ? "warning" : "success",
        is_read: false,
      });
    } catch (notifError) {
      console.warn("⚠️ Notification insert failed:", notifError);
    }

    console.log("✅ Notik postback processed successfully:", {
      user_id,
      txn_id,
      amount: awardAmount,
      displayName,
      isChargeback,
    });

    return NextResponse.json({ success: true, message: "Postback processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Notik postback error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 200 } // Return 200 to prevent Notik retry loop
    );
  }
}
