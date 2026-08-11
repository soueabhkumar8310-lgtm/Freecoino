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

    const timewallApiKey = process.env.TIMEWALL_API_KEY;
    const timewallAppId = process.env.TIMEWALL_APP_ID;

    if (!timewallApiKey || !timewallAppId) {
      console.warn("⚠️ Timewall API credentials not configured");
      return NextResponse.json({
        success: false,
        error: "Timewall not configured",
        offers: [],
      });
    }

    // Construct Timewall iframe URL
    // Note: Timewall typically provides an iframe embed, not a REST API for offers
    // The postback URL should be: https://freecoino.com/api/timewall/postback
    const timewallUrl = `https://timewall.io/offer-wall/${timewallAppId}?user_id=${userId}`;

    // Return the iframe URL and configuration
    return NextResponse.json({
      success: true,
      iframeUrl: timewallUrl,
      provider: "Timewall",
      postbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://freecoino.com'}/api/timewall/postback`,
      instructions: "Embed this iframe to show Timewall offers",
    });
  } catch (error) {
    console.error("❌ Timewall API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load Timewall offers",
        offers: [],
      },
      { status: 500 }
    );
  }
}
