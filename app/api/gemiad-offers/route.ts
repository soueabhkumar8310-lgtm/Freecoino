import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const country_code = searchParams.get('country_code') || '';

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMIAD_API_KEY;
    const placementId = process.env.GEMIAD_API_PLACEMENT_ID;

    if (!apiKey || !placementId) {
      return NextResponse.json({ success: false, error: 'GemiAd API not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://api.gemiwall.com/api/offers/static?placementId=${encodeURIComponent(placementId)}&apiKey=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `GemiAd API returned ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.offers)) {
      return NextResponse.json({ success: true, offers: [], total: 0 });
    }

    // Filter to the user's country (offers API returns all countries; clicking others would 403)
    const countryFilter = country_code.toUpperCase();
    const validOffers = countryFilter
      ? data.offers.filter((offer: any) => {
          const c = Array.isArray(offer.country) ? offer.country : offer.country ? [offer.country] : [];
          return c.length === 0 || c.some((x: string) => x.toUpperCase() === countryFilter);
        })
      : data.offers;

    const offers = validOffers.map((offer: any) => ({
      offer_id: offer.id,
      id: offer.id,
      name: offer.name,
      description1: offer.description?.en || '',
      description2: '',
      image_url: offer.icon || '',
      payout: typeof offer.payout === 'number' ? offer.payout : (parseFloat(offer.payout) || 0),
      click_url: (offer.url || '').replace(/\[USER_ID\]/g, user_id),
      categories: Array.isArray(offer.category) ? offer.category : offer.category ? [offer.category] : [],
      provider: 'GemiAd',
      device: offer.device || [],
      trackingType: offer.trackingType || '',
      events: Array.isArray(offer.events) && offer.events.length > 0
        ? offer.events.map((e: any) => ({
            id: String(e.eventId),
            name: e.action?.en || `Step ${e.eventId}`,
            payout: e.payout || 0,
          }))
        : undefined,
    }));

    return NextResponse.json({ success: true, offers, total: offers.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}