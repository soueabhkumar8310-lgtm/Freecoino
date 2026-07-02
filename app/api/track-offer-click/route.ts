import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, offerId, offerName, provider, payout, clickUrl, events } = await req.json();

    if (!userId || !offerId || !provider) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from("offer_completions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("offer_id", offerId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const eventsArray = Array.isArray(events) ? events : [];
    const maxPayout = eventsArray.length > 0
      ? Math.max(...eventsArray.map((e: any) => parseInt(e.payout) || 0), payout || 0)
      : (payout || 0);

    // Insert with pending status
    const { data, error } = await supabaseAdmin
      .from("offer_completions")
      .insert({
        user_id: userId,
        offer_id: offerId,
        offer_name: offerName || "Unknown Offer",
        offer_provider: provider,
        amount_earned: 0,
        payout_potential: maxPayout,
        coins_awarded: 0,
        click_url: clickUrl || null,
        events_json: eventsArray,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Track offer click error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to track click" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Track offer click catch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
