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
      console.error('❌ RevToo API key not configured');
      return NextResponse.json({
        success: false,
        error: 'RevToo API key not configured',
        offers: [],
      });
    }

    console.log('✅ API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    // Revtoo API endpoint (updated based on actual API structure)
    // Try multiple possible endpoints
    const possibleEndpoints = [
      `https://api.revtoo.com/v1/offers?apiKey=${apiKey}&userId=${userId}`,
      `https://revtoo.com/api/offers?api_key=${apiKey}&user_id=${userId}`,
      `https://wall.revtoo.com/api/offers?apiKey=${apiKey}&userId=${userId}`,
    ];

    console.log('🔄 Trying Revtoo API endpoints...');
    
    let response;
    let lastError;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying: ${endpoint.substring(0, 50)}...`);
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Freecoino/1.0',
          },
        });
        
        if (response.ok) {
          console.log(`✅ Success with endpoint: ${endpoint.substring(0, 50)}...`);
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed: ${endpoint.substring(0, 50)}...`);
      }
    }

    if (!response || !response.ok) {
      console.error(`❌ All Revtoo API endpoints failed`);
      // Return empty offers instead of error - offerwall might be iframe-only
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Revtoo is iframe-based. Use embedded offerwall instead.',
        iframeUrl: `https://wall.revtoo.com/?apiKey=${apiKey}&userId=${userId}`,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Revtoo API error: ${response.status} - ${errorText}`);
      return NextResponse.json({
        success: false,
        error: `Revtoo API returned ${response.status}: ${errorText.substring(0, 200)}`,
        offers: [],
      });
    }

    const data = await response.json();
    
    // Transform Revtoo offers to our standard format
    const offers = (data.offers || []).map((offer: any) => {
      const payout = parseFloat(offer.payout || offer.reward || 0);
      let events = offer.conversions || offer.events || [];

      // Generate synthetic milestone events for offers without events
      if (!events.length && payout > 0) {
        events = [
          { id: 'install', name: 'Install the App & Register', payout: +(payout * 0.10).toFixed(2) },
          { id: 'level_3', name: 'Reach Level 3', payout: +(payout * 0.20).toFixed(2) },
          { id: 'level_5', name: 'Reach Level 5', payout: +(payout * 0.25).toFixed(2) },
          { id: 'level_10', name: 'Reach Level 10', payout: +(payout * 0.20).toFixed(2) },
          { id: 'level_20', name: 'Reach Level 20', payout: +(payout * 0.25).toFixed(2) },
        ].filter(e => e.payout > 0);
      }

      return {
        offer_id: offer.id || offer.offer_id,
        name: offer.name || offer.title,
        description1: offer.description || offer.instructions,
        description2: offer.requirements || '',
        description3: offer.terms || '',
        image_url: offer.image || offer.icon || 'https://via.placeholder.com/150',
        payout,
        click_url: offer.link || offer.tracking_link,
        categories: offer.categories || [],
        events,
        provider: 'Revtoo',
        trackingType: offer.conversion_type || offer.type || 'CPA',
      };
    });

    console.log(`✅ Revtoo offers loaded: ${offers.length}`);

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });

  } catch (error) {
    console.error('❌ Revtoo API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Revtoo offers',
        offers: [],
      },
      { status: 500 }
    );
  }
}
