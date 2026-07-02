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

    const placementId = process.env.VORTEX_PLACEMENT_ID || '69dfafd0a982f180b5caa54c';

    console.log('ℹ️ Vortex is iframe-only (no REST API available)');
    
    // Vortex does NOT provide a REST API for fetching offers
    // According to official documentation: https://vortexwall.com/documentation
    // Only iframe integration is supported
    
    return NextResponse.json({
      success: true,
      offers: [],
      message: 'Vortex is iframe-based only. No REST API available. Use embedded offerwall instead.',
      iframeUrl: `https://vortexwall.com/ow/${placementId}/${userId}`,
      documentation: 'Vortex only supports iframe integration. See: https://vortexwall.com/documentation',
    });

  } catch (error) {
    console.error('❌ Vortex API error:', error);
    return NextResponse.json(
      {
        success: true, // Return success to avoid breaking the app
        offers: [],
        message: 'Vortex is iframe-only',
      },
      { status: 200 }
    );
  }
}
