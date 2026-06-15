import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Accept standard offerwall postback parameters
    const userId = searchParams.get("subId") || searchParams.get("subid") || searchParams.get("user_id");
    const transactionId = searchParams.get("transId") || searchParams.get("transaction") || searchParams.get("tx_id");
    const amountStr = searchParams.get("reward") || searchParams.get("amount");
    
    if (!userId || !transactionId || !amountStr) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prevent duplicate transactions
    const { data: existingOffer } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "revtoo")
      .single();

    if (existingOffer) {
      return new NextResponse("OK", { status: 200 }); // Already processed
    }

    // Insert completion
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "Revtoo Offer",
        offer_provider: "revtoo",
        amount_earned: amount,
        status: "completed"
      });

    if (insertError) {
      console.error("Revtoo DB Insert Error:", insertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Add coins to user balance
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: amount,
      p_type: "earn",
      p_description: `Revtoo Offer: ${transactionId}`
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
