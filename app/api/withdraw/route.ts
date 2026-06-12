import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount_coins, address, user_id } = body;

    // Validate input
    if (!amount_coins || !address || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount_coins < 2000) {
      return NextResponse.json(
        { error: 'Minimum withdrawal is 2,000 coins' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins_balance')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user has enough coins
    if (profile.coins_balance < amount_coins) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      );
    }

    // Calculate USD amount
    const amount_usd = amount_coins / 1000;

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        user_id,
        amount: amount_coins,
        crypto_address: address,
        crypto_type: 'LTC',
        status: 'pending',
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('Withdrawal creation error:', withdrawalError);
      return NextResponse.json(
        { error: 'Failed to create withdrawal request' },
        { status: 500 }
      );
    }

    // Deduct coins from user's balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        coins_balance: profile.coins_balance - amount_coins,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Balance update error:', updateError);
      // Rollback: delete the withdrawal
      await supabase.from('withdrawals').delete().eq('id', withdrawal.id);
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawal_id: withdrawal.id,
      coins: amount_coins,
      amount_usd,
      message: 'Withdrawal request submitted successfully',
    });

  } catch (error) {
    console.error('Withdrawal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
