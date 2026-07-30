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
    // IP Whitelist validation (Klink Labs official IPs - updated August 2024)
    const KLINK_IPS = [
      '74.220.53.15',   // New IP (added Aug 2024)
      '74.220.53.234',  // New IP (added Aug 2024)
      '74.220.53.235',  // New IP (added Aug 2024)
      // Add old IPs here if you know them
    ];

    const clientIP = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    console.log("🔔 Klink Postback received from IP:", clientIP);

    // Validate IP (allow in development, strict in production)
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         request.url.includes('localhost') ||
                         request.url.includes('127.0.0.1');
    
    if (!isDevelopment && !KLINK_IPS.includes(clientIP)) {
      console.error("❌ Unauthorized IP:", clientIP);
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get("user_id") ||
      searchParams.get("uid") ||
      searchParams.get("subid") ||
      searchParams.get("sub1");
    const transactionId =
      searchParams.get("tx_id") ||
      searchParams.get("transaction_id") ||
      searchParams.get("offer_id");
    const amountStr =
      searchParams.get("amount") ||
      searchParams.get("payout") ||
      searchParams.get("reward");

    console.log("🔔 Klink Postback params:", { userId, transactionId, amountStr });

    if (!userId || !transactionId || !amountStr) {
      console.error("❌ Missing required parameters");
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

    // Check if duplicate transaction
    const { data: existingOffer } = await supabaseAdmin
      .from("offer_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("offer_id", transactionId)
      .eq("offer_provider", "klink")
      .maybeSingle();

    if (existingOffer) {
      console.log("⚠️ Duplicate transaction detected, returning OK");
      return new NextResponse("OK", { status: 200 });
    }

    // Insert into offer_completions for tracking + My Offers page
    const { error: insertError } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: transactionId,
        offer_name: "Klink Offer",
        offer_provider: "klink",
        coins_awarded: Math.round(coinAmount),
        amount_earned: Math.round(coinAmount),
        status: "completed",
      });

    if (insertError) {
      console.error("❌ Error inserting offer completion:", insertError);
      return new NextResponse("Internal Server Error", { status: 200 });
    }

    // Add coins using the database RPC (atomic)
    const { error: rpcError } = await supabaseAdmin.rpc("add_coins", {
      p_user_id: userId,
      p_amount: Math.round(coinAmount),
      p_type: "earn",
      p_description: `Klink Offer: ${transactionId}`,
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
        console.log(`⚠️ Klink fallback: balance ${newBalance}, total ${newTotalEarned} for user ${userId}`);
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
        message: `You earned ${Math.round(coinAmount)} coins from Klink Offer!`,
        type: "success",
        is_read: false,
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Klink postback processed: ${coinAmount} coins awarded to ${userId}`);
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Klink postback error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
