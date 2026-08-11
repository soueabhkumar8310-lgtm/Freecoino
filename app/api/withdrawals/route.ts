import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '5')

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized - Please login again' }, { status: 401 })
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
      .select('id, requested_at, coins, amount_usd, crypto_address, status, tx_hash')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
      .range(from, to)

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError)
      return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
    }

    return NextResponse.json({
      withdrawals: withdrawals ?? [],
      total: count || 0,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Withdrawals fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
