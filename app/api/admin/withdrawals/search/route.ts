import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const status = searchParams.get('status');

    // Build query
    let query = supabaseAdmin
      .from('withdrawals')
      .select(`
        id,
        user_id,
        amount,
        method,
        wallet_address,
        status,
        created_at,
        profiles!inner(display_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    // Apply status filter if provided and not "all"
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const withdrawals = data?.map((w: any) => ({
      id: w.id,
      user_id: w.user_id,
      coins: w.amount,
      amount_usd: w.amount / 1000, // 1000 coins = $1
      crypto_address: w.wallet_address,
      status: w.status,
      tx_hash: w.tx_hash,
      user_email: w.profiles?.display_name || 'Unknown User',
    })) || [];

    return NextResponse.json({
      withdrawals,
      total: count || 0,
    });
  } catch (error) {
    console.error('Admin withdrawal search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
