import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendWithdrawalApprovedEmail } from '@/lib/email';

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
    const { withdrawalId, txHash } = body;

    if (!withdrawalId || !txHash?.trim()) {
      return NextResponse.json(
        { error: 'Missing withdrawal ID or transaction hash' },
        { status: 400 }
      );
    }

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

    // Update withdrawal to completed status with transaction hash
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'completed',
        tx_hash: txHash.trim(),
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving withdrawal:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve withdrawal' },
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
        await sendWithdrawalApprovedEmail(
          authUser.user.email,
          withdrawal.profiles.display_name,
          withdrawal.amount,
          amountUsd,
          txHash.trim()
        );
      } catch (emailErr) {
        // Email failure should not block the approval response
        console.error('Failed to send approval email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      withdrawal: updated,
    });
  } catch (error) {
    console.error('Admin withdrawal approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
