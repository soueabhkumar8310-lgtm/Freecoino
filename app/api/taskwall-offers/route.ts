import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const country = searchParams.get("country") || "";
    const os = searchParams.get("os") || "android";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const appId = process.env.TASKWALL_API_KEY || process.env.NEXT_PUBLIC_TASKWALL_API_KEY;

    if (!appId) {
      console.error("❌ Taskwall API key not configured");
      return NextResponse.json({
        success: false,
        error: "Taskwall API key not configured",
        offers: [],
      });
    }

    console.log("✅ Taskwall API Key loaded, first 10 chars:", appId.substring(0, 10));

    // Taskwall API endpoint
    const apiUrl = `https://wall.taskwall.io/api/?app_id=${appId}&userid=${userId}&os=${os}${country ? `&country=${country}` : ""}`;

    console.log("🔄 Fetching from Taskwall API...");

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Freecoino/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Taskwall API error: ${response.status} - ${errorText.substring(0, 200)}`);
      return NextResponse.json({
        success: false,
        error: `Taskwall API error: ${response.status}`,
        offers: [],
      });
    }

    const data = await response.json();

    console.log("📦 Taskwall API Response preview:", JSON.stringify(data).substring(0, 200));

    // Taskwall returns "success: true" not "status: success"
    if (data.success !== true || !Array.isArray(data.offers)) {
      console.error("❌ Invalid Taskwall API response");
      console.error("Success field:", data.success);
      console.error("Offers array?", Array.isArray(data.offers));
      console.error("Offer count:", data.count);
      return NextResponse.json({
        success: false,
        error: "Invalid API response",
        offers: [],
      });
    }

    // Transform Taskwall offers to our standard format
    const offers = data.offers.map((offer: any) => {
      // Taskwall returns payout in dollars, convert to coins (1 USD = 1000 coins)
      const payoutUSD = parseFloat(offer.payout || 0);
      const payout = Math.round(payoutUSD * 1000); // Convert to coins

      return {
        offer_id: offer.offer_id,
        name: offer.title,
        description1: offer.description || "",
        description2: offer.conversion || "",
        description3: "",
        image_url: offer.icon || "https://via.placeholder.com/150",
        payout,
        click_url: offer.link,
        categories: [],
        events: [
          {
            id: "complete",
            name: offer.conversion || "Complete Task",
            payout,
          },
        ],
        provider: "Taskwall",
        trackingType: "CPA",
        device: offer.devices || ["android"],
        countries: offer.countries || [],
        available_in: offer.available_in || "",
      };
    });

    console.log(`✅ Taskwall offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });
  } catch (error) {
    console.error("❌ Taskwall API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Taskwall offers",
        offers: [],
      },
      { status: 500 }
    );
  }
}
