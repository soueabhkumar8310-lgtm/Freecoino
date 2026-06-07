import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalId } = await context.params
    const body = await request.json()
    const { status, tx_hash, rejection_reason, admin_notes } = body

    // TODO: Add admin authentication check here
    // For now, this is a placeholder for future admin panel

    if (!['pending', 'processing', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get withdrawal details
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('*, profiles!inner(coins_balance)')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    // If rejecting, refund coins to user
    if (status === 'rejected' && withdrawal.status !== 'rejected') {
      const { error: refundError } = await supabaseAdmin
        .from('profiles')
        .update({
          coins_balance: withdrawal.profiles.coins_balance + withdrawal.amount,
        })
        .eq('id', withdrawal.user_id)

      if (refundError) {
        console.error('Error refunding coins:', refundError)
        return NextResponse.json(
          { error: 'Failed to refund coins' },
          { status: 500 }
        )
      }

      // Update transaction status
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('metadata->>withdrawal_id', withdrawalId)
    }

    // If completing, mark transaction as completed
    if (status === 'completed') {
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'completed' })
        .eq('metadata->>withdrawal_id', withdrawalId)
    }

    // Update withdrawal
    const updateData: any = {
      status,
      processed_at: new Date().toISOString(),
    }

    if (tx_hash) updateData.tx_hash = tx_hash
    if (rejection_reason) updateData.rejection_reason = rejection_reason
    if (admin_notes) updateData.admin_notes = admin_notes

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update(updateData)
      .eq('id', withdrawalId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating withdrawal:', updateError)
      return NextResponse.json(
        { error: 'Failed to update withdrawal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
    })
  } catch (error) {
    console.error('Admin withdrawal update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
