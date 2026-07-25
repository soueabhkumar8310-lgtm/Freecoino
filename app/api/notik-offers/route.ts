import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const deviceOs = searchParams.get('device_os') || 'android';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOTIK_API_KEY;
    const appId = process.env.NOTIK_APP_ID || 'WI24gd7OaJ';
    const pubId = process.env.NOTIK_PUBLISHER_ID || 'uuGH0N';

    if (!apiKey) {
      console.error('Notik API key not configured');
      return NextResponse.json({
        success: false,
        error: 'Notik API key not configured',
        offers: [],
      });
    }

    // Notik is behind Cloudflare protection - direct server-side API calls are blocked.
    // Notik offers are only accessible via their iframe offerwall.
    // We attempt the API call but gracefully return empty if blocked.
    const params = new URLSearchParams({
      api_key: apiKey,
      app_id: appId,
      user_id: userId,
      pub_id: pubId,
      device_type: 'all',
      device_os: deviceOs,
      sort: 'star',
      category: 'mpo',
    });

    const endpoint = `https://notik.me/api/allOfferwallOffers?${params.toString()}`;

    let response: Response | null = null;
    try {
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'API-KEY': 'base64:NHdrdzV4OXNsaGdjOWM1NGhjcjltOWY2b2xvd2kweDc=',
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (fetchError) {
      console.log('Notik API blocked by Cloudflare or network error:', fetchError instanceof Error ? fetchError.message : 'Unknown');
    }

    if (!response || !response.ok) {
      console.log(`Notik API unavailable (Cloudflare protection). Status: ${response?.status ?? 'no response'}`);
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Notik is behind Cloudflare protection. Use the embedded offerwall in Offer Walls section.',
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    // Check if response is HTML (Cloudflare challenge page)
    if (responseText.includes('cf-challenge') || responseText.includes('Just a moment') || !contentType.includes('json')) {
      console.log('Notik API returned Cloudflare challenge page instead of JSON');
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Notik is behind Cloudflare protection. Use the embedded offerwall in Offer Walls section.',
      });
    }

    const data = JSON.parse(responseText);

    if (!data.success || !data.data?.offers) {
      console.log('Notik API returned no offers:', data.message || 'unknown');
      return NextResponse.json({
        success: true,
        offers: [],
        message: data.message || 'No offers available from Notik',
      });
    }

    const offers = data.data.offers.map((offer: any) => ({
      offer_id: String(offer.id || offer.offer_id || ''),
      name: offer.name || offer.title || offer.anchor || '',
      description1: offer.description || offer.requirements || '',
      description2: offer.things_to_know?.join('. ') || '',
      description3: offer.disclaimer || '',
      image_url: offer.image || offer.icon || offer.creatives?.images?.main || offer.image_url || 'https://via.placeholder.com/150',
      payout: parseFloat(offer.payout || offer.reward || offer.amount || offer.flat_payout || 0),
      click_url: offer.click_url || offer.tracking_link || offer.link || '',
      categories: offer.categories || offer.category ? (Array.isArray(offer.categories) ? offer.categories : [offer.category]) : [],
      events: (offer.conversions || offer.events || offer.goal_events || []).map((e: any) => ({
        id: String(e.id || e.uuid || ''),
        name: e.name || e.description || '',
        payout: e.payout || e.flat_payout || e.flat_points || 0,
      })),
      provider: 'Notik',
      trackingType: offer.tracking_type || offer.type || offer.conversion_type || 'CPI',
      device: offer.devices || offer.platforms || [],
    }));

    console.log(`Notik offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });

  } catch (error) {
    console.error('Notik API error:', error);
    return NextResponse.json(
      {
        success: true,
        error: 'Failed to fetch Notik offers',
        offers: [],
      },
      { status: 200 }
    );
  }
}
