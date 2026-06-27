import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getParams(req: NextRequest) {
  const url = new URL(req.url);
  const params = new Map(url.searchParams);

  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body = await req.json();
        for (const [key, value] of Object.entries(body)) {
          if (typeof value === "string") params.set(key, value);
        }
      } catch { }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const text = await req.text();
        new URLSearchParams(text).forEach((v, k) => params.set(k, v));
      } catch { }
    }
  }

  const get = (keys: string[]) => {
    for (const key of keys) {
      if (params.has(key)) return params.get(key)!;
    }
    return null;
  };

  return {
    userId: get(["subId", "subid", "user_id", "uid", "userId", "external_user_id"]),
    transactionId: get(["transId", "transaction", "tx_id", "transaction_id", "offer_id", "txn_id"]),
    amountStr: get(["reward", "amount", "payout", "coins_awarded"]),
    offerName: get(["offer_name", "offerName", "offer_title", "program_id"]),
  };
}

function convertToCoins(amountStr: string): number {
  const cleaned = amountStr.replace(/[^0-9.\-]/g, "");
  const amountFloat = parseFloat(cleaned);

  if (isNaN(amountFloat) || amountFloat <= 0) {
    return 0;
  }

  const hasDecimal = cleaned.includes(".");
  if (hasDecimal || amountFloat < 1) {
    return Math.round(amountFloat * 1000);
  }

  if (amountFloat >= 1000) {
    return Math.round(amountFloat);
  }

  return Math.round(amountFloat * 1000);
}

async function handlePostback(req: NextRequest) {
  try {
    const { userId, transactionId, amountStr, offerName } = await getParams(req);

    if (!userId || !transactionId) {
      console.error("❌ Revtoo postback missing required params:", { userId, transactionId, amountStr });
      return new NextResponse("Missing required parameters", { status: 200 });
    }

    const coinsToAward = amountStr ? convertToCoins(amountStr) : 1;

    if (coinsToAward <= 0) {
      console.warn("⚠️ Revtoo postback: amount is zero or invalid, awarding minimum 1 coin", { userId, transactionId, amountStr });
    }

    const awardAmount = Math.max(1, coinsToAward);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingOffer } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "revtoo")
      .maybeSingle();

    if (existingOffer) {
      return new NextResponse("OK", { status: 200 });
    }

    const displayName = offerName || "Revtoo Offer";

    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: displayName,
        offer_provider: "revtoo",
        coins_awarded: awardAmount,
        amount_earned: awardAmount,
        status: "completed",
      });

    if (insertError) {
      console.error("❌ Revtoo DB Insert Error:", insertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: awardAmount,
      p_type: "earn",
      p_description: `Revtoo: ${displayName} (txn: ${transactionId})`,
    });

    if (rpcError) {
      console.error("❌ Revtoo RPC add_coins error:", rpcError);
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("coins_balance, total_earned")
        .eq("id", userId)
        .single();

      if (profile) {
        const newBalance = Math.max(0, (profile.coins_balance || 0) + awardAmount);
        const newTotalEarned = (profile.total_earned || 0) + awardAmount;
        await supabaseAdmin
          .from("profiles")
          .update({ coins_balance: newBalance, total_earned: newTotalEarned })
          .eq("id", userId);
        console.log(`⚠️ Revtoo fallback: balance ${newBalance}, total ${newTotalEarned} for user ${userId}`);
      } else {
        console.error("❌ Revtoo fallback: user not found:", userId);
        return new NextResponse("User not found", { status: 404 });
      }
    }

    try {
      await supabaseAdmin.from("revtoo_transactions").insert({
        user_id: userId,
        trans_id: transactionId,
        reward: awardAmount,
        offer_name: displayName,
        status: 1,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("⚠️ revtoo_transactions insert failed:", e);
    }

    try {
      await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Offer Completed! 🎉",
          message: `You earned ${awardAmount} coins from ${displayName}!`,
          type: "success",
          is_read: false,
        });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Revtoo postback: ${awardAmount} coins awarded to ${userId} for ${displayName}`);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Revtoo postback error:", error);
    return new NextResponse("Internal Server Error", { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}
