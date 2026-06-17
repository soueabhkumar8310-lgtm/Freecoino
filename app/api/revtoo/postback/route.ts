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
    userId: get(["subId", "subid", "user_id", "uid", "userId"]),
    transactionId: get(["transId", "transaction", "tx_id", "transaction_id", "offer_id"]),
    amountStr: get(["reward", "amount", "payout"]),
  };
}

async function handlePostback(req: NextRequest) {
  try {
    const { userId, transactionId, amountStr } = await getParams(req);

    if (!userId || !transactionId || !amountStr) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const amountFloat = parseFloat(amountStr);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const coinsToAward = amountStr.includes(".") || amountFloat < 1
      ? Math.round(amountFloat * 1000)
      : Math.round(amountFloat * 10);

    if (isNaN(coinsToAward) || coinsToAward <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

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
      .single();

    if (existingOffer) {
      return new NextResponse("OK", { status: 200 });
    }

    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "Revtoo Offer",
        offer_provider: "revtoo",
        amount_earned: coinsToAward,
        status: "completed",
      });

    if (insertError) {
      console.error("Revtoo DB Insert Error:", insertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: coinsToAward,
      p_type: "earn",
      p_description: `Revtoo Offer: ${transactionId}`,
    });

    if (rpcError) {
      console.error("Revtoo Add Coins Error:", rpcError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Revtoo postback error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handlePostback(req);
}

export async function POST(req: NextRequest) {
  return handlePostback(req);
}
