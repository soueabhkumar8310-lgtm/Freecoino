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

    // Revtoo API endpoint
    const revtooUrl = `https://api.revtoo.com/offers?api_key=${apiKey}&user_id=${userId}&format=json`;

    console.log('🔄 Fetching Revtoo offers...');
    
    const response = await fetch(revtooUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Revtoo API error: ${response.status}`);
      return NextResponse.json({
        success: false,
        error: `Revtoo API returned ${response.status}`,
        offers: [],
      });
    }

    const data = await response.json();
    
    // Transform Revtoo offers to our standard format
    const offers = (data.offers || []).map((offer: any) => ({
      offer_id: offer.id || offer.offer_id,
      name: offer.name || offer.title,
      description1: offer.description || offer.instructions,
      description2: offer.requirements || '',
      description3: offer.terms || '',
      image_url: offer.image || offer.icon || 'https://via.placeholder.com/150',
      payout: parseFloat(offer.payout || offer.reward || 0),
      click_url: offer.link || offer.tracking_link,
      categories: offer.categories || [],
      events: offer.conversions || [],
      provider: 'Revtoo',
      trackingType: offer.conversion_type || offer.type || 'CPA',
    }));

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
