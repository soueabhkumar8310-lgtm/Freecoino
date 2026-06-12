import { NextRequest, NextResponse } from 'next/server';

// Simple fraud check endpoint - just returns success for now
// Can be enhanced later with actual fraud detection logic
export async function POST(request: NextRequest) {
  try {
    // For now, just return success
    // In the future, you can add:
    // - IP tracking
    // - Rate limiting
    // - Suspicious pattern detection
    
    return NextResponse.json({
      success: true,
      status: 'clean',
    });
  } catch (error) {
    console.error('Fraud check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
