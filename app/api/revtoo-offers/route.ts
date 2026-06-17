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

    const endpoints = [
      `https://api.revtoo.com/v1/offers?apiKey=${apiKey}&userId=${userId}`,
      `https://revtoo.com/api/offers?api_key=${apiKey}&user_id=${userId}`,
      `https://wall.revtoo.com/api/offers?apiKey=${apiKey}&userId=${userId}`,
    ];

    let response;
    let lastError;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Freecoino/1.0",
          },
        });

        if (response.ok) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({
        success: true,
        offers: [],
        iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
      });
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({
        success: true,
        offers: [],
        iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
      });
    }

    const rawOffers = data.offers || [];
    const offers = rawOffers
      .map((offer: any) => {
        const payout = parseFloat(offer.payout || offer.reward || 0);
        const name = offer.name || offer.title;
        if (!payout || !name) return null;

        const events = (offer.conversions || offer.events || [])
          .map((e: any) => ({
            id: e.event_id || e.id || e.name || `event_${Math.random().toString(36).slice(2, 8)}`,
            name: e.event_title || e.name || e.title || "Complete Task",
            payout: parseFloat(e.event_payout || e.payout || e.reward || 0),
          }))
          .filter((e: any) => e.payout > 0);

        return {
          offer_id: offer.id || offer.offer_id,
          name,
          description1: offer.description || offer.instructions || "",
          image_url:
            offer.image ||
            offer.icon ||
            "https://via.placeholder.com/150",
          payout,
          click_url: offer.url || offer.link || offer.tracking_link,
          events: events.length
            ? events
            : [{ id: "install", name: "Complete Offer", payout }],
          provider: "Revtoo",
          trackingType: offer.category || offer.conversion_type || offer.type || "CPA",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error("Revtoo API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Revtoo offers", offers: [] },
      { status: 500 }
    );
  }
}
