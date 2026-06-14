import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'soueabhkumar8310@gmail.com';

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Verify caller is admin via session cookies
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

    // Get withdrawal details (without profiles join)
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

    // Refund coins to user's balance directly
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('coins_balance')
      .eq('id', withdrawal.user_id)
      .single();

    if (profile) {
      const newBalance = (profile.coins_balance || 0) + withdrawal.amount;
      const { error: refundError } = await supabaseAdmin
        .from('profiles')
        .update({ coins_balance: newBalance })
        .eq('id', withdrawal.user_id);

      if (refundError) {
        console.error('Error refunding coins:', refundError);
        return NextResponse.json(
          { error: 'Failed to refund coins' },
          { status: 500 }
        );
      }
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
      return NextResponse.json(
        { error: 'Failed to reject withdrawal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
    });
  } catch (error) {
    console.error('Admin withdrawal rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
