import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const deviceType = searchParams.get('device_type') || 'mobile';
    const deviceOs = searchParams.get('device_os') || 'android';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOTIK_API_KEY;

    if (!apiKey) {
      console.error('❌ Notik API key not configured');
      return NextResponse.json({
        success: false,
        error: 'Notik API key not configured',
        offers: [],
      });
    }

    console.log('✅ Notik API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    // Notik API endpoint - Try multiple possible endpoints
    const possibleEndpoints = [
      `https://api.notik.me/api/v1/offers?api_key=${apiKey}&user_id=${userId}&device=${deviceOs}`,
      `https://notik.me/api/offers?apiKey=${apiKey}&userId=${userId}&platform=${deviceOs}`,
      `https://offers.notik.me/v1/offers?key=${apiKey}&uid=${userId}&device_type=${deviceType}`,
    ];

    console.log('🔄 Trying Notik API endpoints...');
    
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
      console.error(`❌ All Notik API endpoints failed`);
      // Return empty offers instead of error - offerwall might be iframe-only
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Notik is iframe-based. Use embedded offerwall instead.',
        iframeUrl: `https://notik.me/offerwall?apiKey=${apiKey}&userId=${userId}`,
      });
    }

    const data = await response.json();
    
    // Transform Notik offers to our standard format
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
      provider: 'Notik',
      trackingType: offer.conversion_type || offer.type || offer.tracking_type || 'CPA',
      device: offer.devices || offer.platforms || [],
    }));

    console.log(`✅ Notik offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });

  } catch (error) {
    console.error('❌ Notik API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Notik offers',
        offers: [],
      },
      { status: 500 }
    );
  }
}
