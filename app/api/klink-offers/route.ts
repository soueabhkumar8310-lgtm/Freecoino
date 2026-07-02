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

    const apiKey = process.env.KLINK_API_KEY;
    const apiSecret = process.env.KLINK_API_SECRET;

    if (!apiKey) {
      console.error('❌ Klink API key not configured');
      return NextResponse.json({
        success: false,
        error: 'Klink API key not configured',
        offers: [],
      });
    }

    console.log('✅ Klink API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    const baseUrl = 'https://klink-quest.klink.finance/api';
    const possibleEndpoints = [
      `${baseUrl}/v1/publisher/offers?limit=50`,
      `${baseUrl}/v1/publisher/offers?page=1&limit=50`,
    ];

    console.log('🔄 Trying Klink API endpoints...');

    let response;
    let lastError;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying: ${endpoint.substring(0, 80)}...`);
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Freecoino/1.0',
          'Authorization': `Bearer ${apiKey}`,
        };
        if (apiSecret) {
          headers['X-API-Secret'] = apiSecret;
        }

        response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          console.log(`✅ Success with endpoint: ${endpoint.substring(0, 80)}...`);
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed: ${endpoint.substring(0, 80)}...`);
      }
    }

    if (!response || !response.ok) {
      console.error(`❌ All Klink API endpoints failed`);
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Klink is iframe-based. Use embedded offerwall instead.',
        iframeUrl: `https://klink-quest.klink.finance/offerwall?apiKey=${apiKey}&userId=${userId}`,
      });
    }

    const data = await response.json();

    // Transform Klink offers to our standard format
    const offers = (data.offers || data.data || []).map((offer: any) => ({
      offer_id: offer.id || offer.offerId || offer.offer_id,
      name: offer.name || offer.title || offer.offer_name,
      description1: offer.description || offer.instructions || offer.offer_desc,
      description2: offer.requirements || offer.objective || '',
      description3: offer.terms || offer.terms_and_conditions || '',
      image_url: offer.image || offer.icon || offer.image_url || 'https://via.placeholder.com/150',
      payout: parseFloat(offer.payout || offer.reward || offer.amount || 0),
      click_url: offer.link || offer.tracking_link || offer.click_url || offer.url,
      categories: offer.categories || offer.category ? (Array.isArray(offer.category) ? offer.category : [offer.category]) : [],
      events: offer.conversions || offer.events || [],
      provider: 'Klink',
      trackingType: offer.conversion_type || offer.type || offer.tracking_type || 'CPA',
      device: offer.devices || offer.platforms || [],
    }));

    console.log(`✅ Klink offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });

  } catch (error) {
    console.error('❌ Klink API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Klink offers',
        offers: [],
      },
      { status: 500 }
    );
  }
}
