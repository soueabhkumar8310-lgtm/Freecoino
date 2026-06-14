import { NextRequest, NextResponse } from 'next/server';
import { sendWithdrawalApprovedEmail, sendWithdrawalRejectedEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'approve';
  
  try {
    if (type === 'approve') {
      // Test approval email
      const result = await sendWithdrawalApprovedEmail(
        'soueabhkumar8310@gmail.com',
        'Test User',
        2000,
        2.00,
        'test_tx_hash_abc123xyz'
      );
      
      return NextResponse.json({
        success: true,
        type: 'approval',
        message: 'Approval email sent! Check your inbox: soueabhkumar8310@gmail.com',
        result
      });
    } else if (type === 'reject') {
      // Test rejection email
      const result = await sendWithdrawalRejectedEmail(
        'soueabhkumar8310@gmail.com',
        'Test User',
        2000,
        2.00,
        'This is a test rejection reason'
      );
      
      return NextResponse.json({
        success: true,
        type: 'rejection',
        message: 'Rejection email sent! Check your inbox: soueabhkumar8310@gmail.com',
        result
      });
    } else {
      return NextResponse.json({
        error: 'Invalid type. Use ?type=approve or ?type=reject'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send email',
      details: error
    }, { status: 500 });
  }
}
