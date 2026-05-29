import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const MIN_COINS = 2000
const COINS_PER_USD = 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount_coins, address } = body

    // Get user from session
    const authHeader = request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create client with user's session
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: authHeader,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    if (!amount_coins || amount_coins < MIN_COINS) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${MIN_COINS.toLocaleString()} coins` },
        { status: 400 }
      )
    }

    if (!address || address.trim().length < 10) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Get user profile and check balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins_balance, email_verified')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if email is verified
    if (!profile.email_verified) {
      return NextResponse.json(
        { error: 'Email verification required before withdrawal' },
        { status: 403 }
      )
    }

    // Check balance
    if (profile.coins_balance < amount_coins) {
      return NextResponse.json(
        { error: `Insufficient balance. You have ${profile.coins_balance.toLocaleString()} coins` },
        { status: 400 }
      )
    }

    const amount_usd = amount_coins / COINS_PER_USD

    // Deduct coins from user balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins_balance: profile.coins_balance - amount_coins })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating balance:', updateError)
      return NextResponse.json(
        { error: 'Failed to process withdrawal' },
        { status: 500 }
      )
    }

    // Create withdrawal request with 'pending' status (manual approval)
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount: amount_coins,
        method: 'litecoin', // Changed from 'bitcoin' to 'litecoin'
        wallet_address: address.trim(),
        status: 'pending', // Admin will manually approve
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error('Error creating withdrawal:', withdrawalError)
      
      // Rollback: Add coins back
      await supabase
        .from('profiles')
        .update({ coins_balance: profile.coins_balance })
        .eq('id', user.id)

      return NextResponse.json(
        { error: 'Failed to create withdrawal request' },
        { status: 500 }
      )
    }

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdraw',
      amount: -amount_coins,
      description: `Withdrawal request: $${amount_usd.toFixed(2)} to LTC`,
      status: 'pending',
      metadata: {
        withdrawal_id: withdrawal.id,
        wallet_address: address.trim(),
        amount_usd,
      },
    })

    return NextResponse.json({
      success: true,
      withdrawal_id: withdrawal.id,
      coins: amount_coins,
      amount_usd,
      status: 'pending',
      message: 'Withdrawal request submitted successfully. It will be processed manually by admin.',
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
