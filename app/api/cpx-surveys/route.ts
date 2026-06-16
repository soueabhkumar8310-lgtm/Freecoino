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

    const publisherId = process.env.CPX_PUBLISHER_ID;
    const apiKey = process.env.CPX_API_KEY;

    if (!publisherId || !apiKey) {
      console.error('❌ CPX Research Publisher ID or API key not configured');
      return NextResponse.json({
        success: false,
        error: 'CPX Research not configured',
        surveys: [],
      });
    }

    console.log('✅ CPX API Key loaded, first 10 chars:', apiKey.substring(0, 10));

    // CPX Research API endpoint
    const apiUrl = `https://offers.cpx-research.com/api/get-surveys.php?app_id=${publisherId}&ext_user_id=${userId}&secure_hash=${apiKey}`;

    console.log('🔄 Fetching CPX Research surveys...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Freecoino/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ CPX Research API error: ${response.status} - ${errorText}`);
      return NextResponse.json({
        success: false,
        error: `CPX Research API returned ${response.status}`,
        surveys: [],
      });
    }

    const data = await response.json();
    
    // Transform CPX surveys to our standard format
    const surveys = (data.surveys || []).map((survey: any) => ({
      id: survey.id || survey.survey_id,
      loi: parseInt(survey.loi || survey.length_of_interview || 0),
      payout_usd: parseFloat(survey.payout || survey.reward_usd || 0),
      conversion_rate: parseInt(survey.conversion_rate || 50),
      link: survey.link || survey.survey_link,
      score: survey.score || 0,
      type: survey.type || 'survey',
      rating_count: survey.rating_count || 0,
      rating_avg: survey.rating_avg || 0,
    }));

    console.log(`✅ CPX Research surveys loaded: ${surveys.length}`);

    return NextResponse.json({
      success: true,
      surveys,
      count: surveys.length,
    });

  } catch (error) {
    console.error('❌ CPX Research API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CPX Research surveys',
        surveys: [],
      },
      { status: 500 }
    );
  }
}
