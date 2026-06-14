import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendWithdrawalRejectedEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'soueabhkumar8310@gmail.com';

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Bug #2 Fix: Verify caller is admin via session cookies
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { withdrawalId, reason } = body;

    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID' },
        { status: 400 }
      );
    }

    const rejectionReason = reason?.trim() || 'No reason provided';

    // Get withdrawal details
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('*, profiles!inner(display_name)')
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

    // Bug #8 Fix: Use atomic add_coins RPC instead of cached balance
    // This prevents overwriting coins earned between request & refund
    const { error: refundError } = await supabaseAdmin.rpc('add_coins', {
      p_user_id: withdrawal.user_id,
      p_amount: withdrawal.amount,
      p_type: 'bonus',
      p_description: `Refund: withdrawal ${withdrawalId} rejected`,
    });

    if (refundError) {
      console.error('Error refunding coins:', refundError);
      return NextResponse.json(
        { error: 'Failed to refund coins' },
        { status: 500 }
      );
    }

    // Update withdrawal to rejected status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting withdrawal:', updateError);
      // Rollback: deduct the refunded coins back
      await supabaseAdmin.rpc('add_coins', {
        p_user_id: withdrawal.user_id,
        p_amount: -withdrawal.amount,
        p_type: 'withdraw',
        p_description: `Rollback: refund failed for withdrawal ${withdrawalId}`,
      });

      return NextResponse.json(
        { error: 'Failed to reject withdrawal' },
        { status: 500 }
      );
    }

    // Bug #5 Fix: Fetch user email from auth.users via Admin SDK
    const { data: authUser, error: userFetchError } = await supabaseAdmin.auth.admin.getUserById(
      withdrawal.user_id
    );

    if (!userFetchError && authUser?.user?.email) {
      const amountUsd = withdrawal.amount / 1000;
      try {
        await sendWithdrawalRejectedEmail(
          authUser.user.email,
          withdrawal.profiles.display_name,
          withdrawal.amount,
          amountUsd,
          rejectionReason
        );
      } catch (emailErr) {
        // Email failure should not block the rejection response
        console.error('Failed to send rejection email:', emailErr);
      }
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
