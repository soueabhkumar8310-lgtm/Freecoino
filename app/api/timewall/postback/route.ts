import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const transactionId = searchParams.get("tx_id");
    const amountStr = searchParams.get("amount");

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

    // Check if duplicate transaction
    const { data: existingOffer, error: existingError } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "timewall")
      .single();

    if (existingOffer) {
      // Duplicate transaction, return 200 OK to stop retries from the offerwall
      return new NextResponse("OK", { status: 200 });
    }

    // Insert into offer_completions to track and prevent future duplicates
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "Timewall Task",
        offer_provider: "timewall",
        amount_earned: amount,
        status: "completed"
      });

    if (insertError) {
      console.error("Error inserting offer completion:", insertError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    // Add coins using the database RPC
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: amount,
      p_type: "earn",
      p_description: `Timewall Offer: ${transactionId}`
    });

    if (rpcError) {
      console.error("Error adding coins:", rpcError);
      return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Timewall postback error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
