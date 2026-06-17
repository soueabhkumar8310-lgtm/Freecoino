import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.REVTOO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'RevToo API key not configured',
        offers: [],
      });
    }

    // Revtoo is iframe-only — no public offers API that returns real data.
    // Offers are shown inside the iframe at revtoo.com/offerwall/{apiKey}/{userId}
    return NextResponse.json({
      success: true,
      offers: [],
      iframeUrl: `https://revtoo.com/offerwall/${apiKey}/${userId}`,
    });

  } catch (error) {
    console.error('Revtoo API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Revtoo offers', offers: [] },
      { status: 500 }
    );
  }
}
