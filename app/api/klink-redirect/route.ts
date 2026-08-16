import { NextRequest, NextResponse } from 'next/server';

const KLINK_PUB_ID = 'd317e5b6-8977-4e79-9df3-66ff86e77645';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offer_id = searchParams.get('offer_id');
    const user_id = searchParams.get('user_id');

    if (!offer_id || !user_id) {
      return NextResponse.json({ success: false, error: 'offer_id and user_id are required' }, { status: 400 });
    }

    const redirectRes = await fetch(
      `https://offerwall.klinkfinance.com/api/redirect?offer_id=${encodeURIComponent(offer_id)}&user_id=${encodeURIComponent(user_id)}&pub_id=${KLINK_PUB_ID}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!redirectRes.ok) {
      return NextResponse.json({ success: false, error: `Redirect API returned ${redirectRes.status}` }, { status: 502 });
    }

    const redirectData = await redirectRes.json();

    if (!redirectData.success || !redirectData.data?.trackUrl) {
      return NextResponse.json({ success: false, error: redirectData.message || 'No track URL' }, { status: 502 });
    }

    const trackRes = await fetch(redirectData.data.trackUrl, {
      headers: redirectData.data.headers || {},
      signal: AbortSignal.timeout(15000),
    });

    if (!trackRes.ok) {
      return NextResponse.json({ success: false, error: `Track API returned ${trackRes.status}` }, { status: 502 });
    }

    const trackData = await trackRes.json();

    if (!trackData.success || !trackData.data?.offerRedirectUrl) {
      return NextResponse.json({ success: false, error: trackData.message || 'No redirect URL' }, { status: 502 });
    }

    return NextResponse.json({ success: true, redirectUrl: trackData.data.offerRedirectUrl });
  } catch (error) {
    console.error('[klink-redirect] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}