import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')

    // Get user from session
    const authHeader = request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: authHeader,
        },
      },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting withdrawals:', countError)
      return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
    }

    // Get paginated withdrawals
    const from = page * pageSize
    const to = from + pageSize - 1

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('id, created_at, amount, method, wallet_address, status, processed_at, rejection_reason')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError)
      return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedWithdrawals = withdrawals.map((w) => ({
      id: w.id,
      requested_at: w.created_at,
      coins: w.amount,
      amount_usd: w.amount / 1000,
      status: w.status,
      method: w.method,
      wallet_address: w.wallet_address,
      processed_at: w.processed_at,
      rejection_reason: w.rejection_reason,
      tx_hash: null, // Will be added by admin when marking as completed
    }))

    return NextResponse.json({
      withdrawals: transformedWithdrawals,
      total: count || 0,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Withdrawals fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
