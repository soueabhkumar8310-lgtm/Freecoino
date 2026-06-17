import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REVTOO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "RevToo API key not configured",
        offers: [],
      });
    }

    // Try endpoints from simplest to most complex
    const endpoints = [
      `https://revtoo.com/api/offers/?api_key=${apiKey}`,
      `https://revtoo.com/api/offers/?api_key=${apiKey}&user_id=${userId}`,
      `https://revtoo.com/api/offers/?api_key=${apiKey}&user_id=${userId}&device=android`,
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36",
        },
      });

      if (!response.ok) continue;

      let data: any;
      try {
        data = await response.json();
      } catch {
        continue;
      }

      if (data.success === false || !data.offers) continue;

      const offers = data.offers
        .map((offer: any) => {
          const payout = parseFloat(offer.payout || offer.reward || 0);
          if (!payout || !offer.name) return null;

          const events = (offer.conversions || offer.events || [])
            .map((e: any) => ({
              id: e.id || e.name || `event_${Math.random().toString(36).slice(2, 8)}`,
              name: e.name || e.title || "Complete Task",
              payout: parseFloat(e.payout || e.reward || 0),
            }))
            .filter((e: any) => e.payout > 0);

          return {
            offer_id: offer.id || offer.offer_id,
            name: offer.name || offer.title,
            description1: offer.description || offer.instructions || "",
            image_url:
              offer.image ||
              offer.icon ||
              "https://via.placeholder.com/150",
            payout,
            click_url:
              offer.link ||
              offer.tracking_link ||
              offer.offer_link ||
              offer.url ||
              `https://revtoo.com/offerwall/${apiKey}/${userId}`,
            events: events.length
              ? events
              : [{ id: "install", name: "Complete Offer", payout }],
            provider: "Revtoo",
            trackingType: offer.conversion_type || offer.type || "CPA",
          };
        })
        .filter(Boolean);

      if (offers.length) {
        return NextResponse.json({ success: true, offers });
      }
    }

    // All endpoints failed
    return NextResponse.json({
      success: true,
      offers: [],
      iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
    });
  } catch (error) {
    console.error("Revtoo API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Revtoo offers", offers: [] },
      { status: 500 }
    );
  }
}
