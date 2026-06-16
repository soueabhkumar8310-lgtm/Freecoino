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

    // Notik API endpoint - Try multiple possible endpoints with different parameter formats
    const appId = 'WI24gd7OaJ';
    const publisherId = 'uuGH0N';
    
    const possibleEndpoints = [
      // Format 1: Standard API with app_id
      `https://api.notik.me/api/v1/offers?app_id=${appId}&api_key=${apiKey}&user_id=${userId}&device=${deviceOs}`,
      // Format 2: Publisher dashboard API
      `https://publisher.notik.me/api/offers?app_id=${appId}&api_key=${apiKey}&user_id=${userId}`,
      // Format 3: Using publisher ID
      `https://api.notik.me/offers?pub_id=${publisherId}&app_id=${appId}&api_key=${apiKey}&uid=${userId}`,
      // Format 4: Offers endpoint with key
      `https://offers.notik.me/v1/offers?app=${appId}&key=${apiKey}&user=${userId}&device_type=${deviceType}`,
      // Format 5: Direct publisher API
      `https://publisher.notik.me/api/v1/apps/${appId}/offers?api_key=${apiKey}&user_id=${userId}`,
    ];

    console.log('🔄 Trying Notik API endpoints...');
    console.log('App ID:', appId);
    console.log('Publisher ID:', publisherId);
    
    let response;
    let lastError;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying: ${endpoint.substring(0, 80)}...`);
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Freecoino/1.0',
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
          },
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          const responseText = await response.text();
          console.log(`✅ Success! Response preview: ${responseText.substring(0, 200)}...`);
          
          // Try to parse as JSON
          try {
            const data = JSON.parse(responseText);
            response = new Response(responseText, { status: 200, headers: { 'Content-Type': 'application/json' } });
            console.log(`✅ Success with endpoint: ${endpoint.substring(0, 80)}...`);
            break;
          } catch (parseError) {
            console.log(`❌ Response not valid JSON`);
            continue;
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ Failed with status ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
