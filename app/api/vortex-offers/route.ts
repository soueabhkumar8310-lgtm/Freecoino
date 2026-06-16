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

    const apiKey = process.env.VORTEX_API_KEY;
    const placementId = process.env.VORTEX_PLACEMENT_ID;

    if (!apiKey || !placementId) {
      console.error('❌ Vortex API key or Placement ID not configured');
      return NextResponse.json({
        success: false,
        error: 'Vortex API key or Placement ID not configured',
        offers: [],
      });
    }

    console.log('✅ Vortex API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    // Vortex API endpoint - Try multiple possible endpoints
    const possibleEndpoints = [
      `https://api.vortexwall.com/v1/offers?apiKey=${apiKey}&placementId=${placementId}&userId=${userId}`,
      `https://publisher.vortexwall.com/api/offers?api_key=${apiKey}&placement_id=${placementId}&user_id=${userId}`,
      `https://vortexwall.com/api/v1/offers?apiKey=${apiKey}&placementId=${placementId}&userId=${userId}`,
    ];

    console.log('🔄 Trying Vortex API endpoints...');
    
    let response;
    let lastError;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying: ${endpoint.substring(0, 60)}...`);
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Freecoino/1.0',
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        if (response.ok) {
          console.log(`✅ Success with endpoint: ${endpoint.substring(0, 60)}...`);
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed: ${endpoint.substring(0, 60)}...`);
      }
    }

    if (!response || !response.ok) {
      console.error(`❌ All Vortex API endpoints failed`);
      // Return empty offers instead of error - offerwall might be iframe-only
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Vortex is iframe-based. Use embedded offerwall instead.',
        iframeUrl: `https://vortexwall.com/offers?placementId=${placementId}&userId=${userId}`,
      });
    }

    const data = await response.json();
    
    // Transform Vortex offers to our standard format
    const offers = (data.offers || data.data || []).map((offer: any) => ({
      offer_id: offer.id || offer.offerId || offer.offer_id,
      name: offer.name || offer.title || offer.offer_name,
      description1: offer.description || offer.instructions || offer.offer_desc,
      description2: offer.requirements || offer.objective || '',
      description3: offer.terms || offer.terms_and_conditions || '',
      image_url: offer.image || offer.icon || offer.image_url || 'https://via.placeholder.com/150',
      payout: parseFloat(offer.payout || offer.reward || offer.amount || 0),
      click_url: offer.link || offer.tracking_link || offer.click_url,
      categories: offer.categories || offer.category ? [offer.category] : [],
      events: offer.conversions || offer.events || [],
      provider: 'Vortex',
      trackingType: offer.conversion_type || offer.type || offer.tracking_type || 'CPA',
      device: offer.devices || offer.platforms || [],
    }));

    console.log(`✅ Vortex offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });

  } catch (error) {
    console.error('❌ Vortex API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Vortex offers',
        offers: [],
      },
      { status: 500 }
    );
  }
}
