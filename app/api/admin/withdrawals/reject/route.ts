import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { withdrawalId } = body;

    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID' },
        { status: 400 }
      );
    }

    // Get withdrawal details
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Withdrawal is not pending' },
        { status: 400 }
      );
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('coins_balance')
      .eq('id', withdrawal.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Refund coins to user
    const { error: refundError } = await supabaseAdmin
      .from('profiles')
      .update({
        coins_balance: profile.coins_balance + withdrawal.amount,
      })
      .eq('id', withdrawal.user_id);

    if (refundError) {
      console.error('Error refunding coins:', refundError);
      return NextResponse.json(
        { error: 'Failed to refund coins' },
        { status: 500 }
      );
    }

    // Update withdrawal to failed status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'failed',
        rejection_reason: 'Rejected by admin',
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting withdrawal:', updateError);
      // Try to rollback the refund
      await supabaseAdmin
        .from('profiles')
        .update({
          coins_balance: profile.coins_balance,
        })
        .eq('id', withdrawal.user_id);
      
      return NextResponse.json(
        { error: 'Failed to reject withdrawal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
      refunded_coins: withdrawal.amount,
    });
  } catch (error) {
    console.error('Admin withdrawal rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
