import { NextRequest, NextResponse } from 'next/server';
import { getUserCountry } from '@/lib/get-user-country';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const country = await getUserCountry(request, {
      overrideCountry: searchParams.get('country') || searchParams.get('country_code'),
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.VORTEX_API_KEY;
    const placementId = process.env.VORTEX_PLACEMENT_ID || '';

    if (!apiKey) {
      console.error('❌ Vortex API key not configured');
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Vortex API key not configured. Add VORTEX_API_KEY to environment variables.',
      });
    }

    console.log('✅ Vortex API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    // Vortex REST API endpoint (per official documentation)
    // https://api.vortexwall.com/api/v1/offers/static?placementId={placementId}&apiKey={apiKey}
    const apiUrl = `https://api.vortexwall.com/api/v1/offers/static?placementId=${placementId}&apiKey=${apiKey}&country=${country}`;

    console.log('🔄 Fetching from Vortex API...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Freecoino/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Vortex API error: ${response.status} - ${errorText.substring(0, 200)}`);
      return NextResponse.json({
        success: true,
        offers: [],
        message: `Vortex API error: ${response.status}`,
      });
    }

    const data = await response.json();
    
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.error('❌ Invalid Vortex API response format');
      return NextResponse.json({
        success: true,
        offers: [],
        message: 'Invalid API response',
      });
    }
    
    // Transform Vortex offers to our standard format
    const offers = data.data.map((offer: any) => {
      // Calculate total payout from events (use highest payout event or total)
      const totalPayout = offer.payout || 0;
      
      return {
        offer_id: offer.id,
        name: offer.name,
        description1: typeof offer.description === 'object' ? offer.description.en || '' : offer.description || '',
        description2: '',
        description3: '',
        image_url: offer.icon || 'https://via.placeholder.com/150',
        payout: totalPayout,
        click_url: offer.url ? offer.url.replace('[USER_ID]', userId) : '',
        categories: [offer.category || 'app'],
        events: (offer.events || []).map((event: any) => ({
          id: event.eventId,
          name: typeof event.action === 'object' ? event.action.en || 'Complete' : event.action || 'Complete',
          payout: event.payout || 0,
        })).filter((e: any) => e.payout > 0), // Only include paid events
        provider: 'Vortex',
        trackingType: offer.multiEvent ? 'CPE' : 'CPI',
        device: offer.device || ['android'],
      };
    });

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
        success: true, // Return success to avoid breaking the app
        offers: [],
        message: error instanceof Error ? error.message : 'Failed to fetch offers',
      },
      { status: 200 }
    );
  }
}
