import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const country = searchParams.get('country') || 'IN';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.KLINK_API_KEY;
    const publisherId = process.env.KLINK_PUBLISHER_ID || '489cbf22-91da-4cea-9b75-06488105d4e7';

    if (!apiKey || !publisherId) {
      console.error('❌ Klink API key or Publisher ID not configured');
      return NextResponse.json({
        success: false,
        error: 'Klink API key not configured',
        offers: [],
      });
    }

    // Klink requires "pubId:apiKey" format for authorization
    const authToken = `${publisherId}:${apiKey}`;
    console.log('✅ Klink Auth Token format: pubId:apiKey');

    const endpoint = 'https://klink-quest.klink.finance/api/v1/publisher/offers';
    const params = new URLSearchParams({
      limit: '100',
      country: country,
    });

    console.log('🔄 Fetching Klink offers...');

    let response;
    try {
      response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchError) {
      console.error('❌ Klink API fetch error:', fetchError);
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Klink API timeout or network error',
      });
    }

    if (!response || !response.ok) {
      const errorText = await response?.text();
      console.error(`❌ Klink API failed: ${response?.status} - ${errorText?.substring(0, 200)}`);
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Klink API error. Use embedded offerwall instead.',
        iframeUrl: `https://offerwall.klinkfinance.com/wall?pub_id=${publisherId}&user_id=${userId}`,
      });
    }

    const data = await response.json();

    // Klink API returns data.data array
    const rawOffers = data.data || data.offers || [];
    
    if (!Array.isArray(rawOffers)) {
      console.error('❌ Klink API response format unexpected:', typeof rawOffers);
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Unexpected Klink API response format',
      });
    }

    // Transform Klink offers to our standard format
    const offers = rawOffers.map((offer: any) => {
      // Klink uses locale-based strings (e.g., name.en, description.en)
      const getName = (obj: any) => {
        if (typeof obj === 'string') return obj;
        return obj?.en || obj?.default || Object.values(obj || {})[0] || '';
      };

      return {
        offer_id: String(offer.offerId || offer.id || ''),
        name: getName(offer.name) || 'Klink Offer',
        description1: getName(offer.description) || getName(offer.instructions) || '',
        description2: getName(offer.requirements) || getName(offer.objective) || '',
        description3: getName(offer.terms) || '',
        image_url: offer.images?.logo || offer.previewUrl || offer.icon || offer.image || 'https://via.placeholder.com/150',
        payout: Math.round((parseFloat(offer.totalPayout || offer.payout || 0) * 1000)), // Convert USD to coins (×1000)
        click_url: offer.trackingUrl || offer.link || offer.url || '#',
        categories: offer.categories || offer.category ? (Array.isArray(offer.category) ? offer.category : [offer.category]) : [],
        events: (offer.activities || offer.conversions || offer.events || []).map((e: any) => ({
          id: String(e.eventId || e.id || e.uuid || ''),
          name: getName(e.name) || getName(e.description) || getName(e.eventName) || 'Event',
          payout: Math.round((parseFloat(e.payout || e.reward || 0) * 1000)), // Convert USD to coins
        })),
        provider: 'Klink',
        trackingType: offer.conversionType || offer.type || 'CPA',
        device: offer.deviceName || offer.platform || 'all',
      };
    });

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
