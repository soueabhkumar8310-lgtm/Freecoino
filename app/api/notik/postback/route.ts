import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  return handlePostback(request);
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

async function handlePostback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Notik postback parameters (check Notik documentation for exact parameter names)
    const userId = searchParams.get('user_id') || searchParams.get('userId') || searchParams.get('external_user_id');
    const transactionId = searchParams.get('transaction_id') || searchParams.get('transactionId') || searchParams.get('tx_id');
    const amount = searchParams.get('amount') || searchParams.get('payout') || searchParams.get('reward');
    const offerName = searchParams.get('offer_name') || searchParams.get('offerName') || searchParams.get('offer_title');
    const status = searchParams.get('status') || 'completed';
    const signature = searchParams.get('signature') || searchParams.get('hash');

    // Log all parameters for debugging
    console.log('📥 Notik Postback Received:', {
      userId,
      transactionId,
      amount,
      offerName,
      status,
      signature,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Validate required parameters
    if (!userId || !transactionId || !amount) {
      console.error('❌ Missing required parameters');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: user_id, transaction_id, amount',
          received: Object.fromEntries(searchParams.entries())
        },
        { status: 400 }
      );
    }

    // Verify signature if provided (check Notik docs for signature verification)
    const apiSecret = process.env.NOTIK_API_SECRET;
    if (signature && apiSecret) {
      // TODO: Implement signature verification based on Notik documentation
      // Example: const expectedSignature = crypto.createHmac('sha256', apiSecret).update(userId + transactionId + amount).digest('hex');
      // if (signature !== expectedSignature) { return error }
      console.log('🔐 Signature verification: TODO (implement based on Notik docs)');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate transaction
    const { data: existingTransaction } = await supabase
      .from('offerwall_transactions')
      .select('id')
      .eq('transaction_id', transactionId)
      .eq('offerwall', 'Notik')
      .single();

    if (existingTransaction) {
      console.log('⚠️ Duplicate transaction detected:', transactionId);
      return NextResponse.json(
        { success: true, message: 'Transaction already processed' },
        { status: 200 }
      );
    }

    // Parse amount (convert to number)
    const coinAmount = parseFloat(amount);
    if (isNaN(coinAmount) || coinAmount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get user's current balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', userId, userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(userData.balance) || 0;
    const newBalance = currentBalance + coinAmount;

    // Update user balance via RPC (atomic operation)
    const { error: rpcError } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: coinAmount,
    });

    if (rpcError) {
      console.error('❌ Failed to update balance via RPC:', rpcError);
      
      // Fallback: Direct balance update
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Failed to update balance (fallback):', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update balance' },
          { status: 500 }
        );
      }
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('offerwall_transactions')
      .insert({
        user_id: userId,
        offerwall: 'Notik',
        transaction_id: transactionId,
        amount: coinAmount,
        offer_name: offerName || 'Unknown Offer',
        status: status,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('⚠️ Failed to record transaction:', transactionError);
      // Don't fail the postback if transaction recording fails
      // User already got the coins
    }

    console.log('✅ Notik postback processed successfully:', {
      userId,
      transactionId,
      amount: coinAmount,
      oldBalance: currentBalance,
      newBalance: newBalance,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Postback processed successfully',
        userId,
        transactionId,
        amount: coinAmount,
        newBalance,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Notik postback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
