import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations (balance deduction)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Bug #1 Fix: Verify user session from cookies — never trust body user_id
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized — please login again' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount_coins, address } = body;
    // Bug #1 Fix: Use session user.id — ignore any user_id from body
    const user_id = user.id;

    // Validate input
    if (!amount_coins || !address) {
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

    // Bug #4 Fix: Use DB-level atomic transaction via process_withdrawal RPC
    // This prevents race conditions — balance check + deduction happen atomically
    const { data: withdrawalId, error: rpcError } = await supabaseAdmin
      .rpc('process_withdrawal', {
        p_user_id: user_id,
        p_amount: amount_coins,
        p_method: 'litecoin',
        p_wallet_address: address.trim(),
      });

    if (rpcError) {
      console.error('process_withdrawal RPC error:', rpcError);
      if (rpcError.message?.includes('Insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient coins' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create withdrawal request' },
        { status: 500 }
      );
    }

    const amount_usd = amount_coins / 1000;

    return NextResponse.json({
      success: true,
      withdrawal_id: withdrawalId,
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
