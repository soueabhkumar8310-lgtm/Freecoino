import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Notik postback whitelisted IPs
const NOTIK_IPS = ['192.53.121.112', '158.69.116.45'];

export async function GET(request: NextRequest) {
  return handlePostback(request);
}

async function handlePostback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Verify IP address (Notik only sends from specific IPs)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    console.log('📥 Notik Postback from IP:', clientIp);
    
    // Note: IP verification disabled for localhost testing
    // In production, uncomment this:
    // if (!NOTIK_IPS.includes(clientIp)) {
    //   console.error('❌ Unauthorized IP:', clientIp);
    //   return NextResponse.json({ success: false, error: 'Unauthorized IP' }, { status: 403 });
    // }
    
    // Extract Notik postback parameters (per documentation)
    const pub_id = searchParams.get('pub_id');
    const app_id = searchParams.get('app_id');
    const user_id = searchParams.get('user_id');
    const s1 = searchParams.get('s1'); // Optional subID
    const amount = searchParams.get('amount'); // Virtual currency amount
    const payout = searchParams.get('payout'); // USD payout
    const offer_id = searchParams.get('offer_id');
    const offer_name = searchParams.get('offer_name');
    const currency_name = searchParams.get('currency_name');
    const timestamp = searchParams.get('timestamp');
    const hash = searchParams.get('hash'); // Security hash
    const txn_id = searchParams.get('txn_id'); // Unique transaction ID
    const conversion_ip = searchParams.get('conversion_ip');
    const rewarded_txn_id = searchParams.get('rewarded_txn_id'); // For chargebacks
    const event_id = searchParams.get('event_id'); // Event ID (if event-based)
    const event_name = searchParams.get('event_name'); // Event name (if event-based)

    // Log all parameters for debugging
    console.log('📥 Notik Postback Parameters:', {
      pub_id, app_id, user_id, amount, payout, offer_id, offer_name,
      event_id, event_name, txn_id, timestamp, hash_present: !!hash,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Validate required parameters
    if (!user_id || !txn_id || !amount) {
      console.error('❌ Missing required parameters');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: user_id, txn_id, amount',
          received: { user_id, txn_id, amount }
        },
        { status: 400 }
      );
    }

    // Verify hash signature (IMPORTANT for security!)
    const secretKey = process.env.NOTIK_API_SECRET;
    if (hash && secretKey) {
      // Use the exact request URL approach (matching PHP example):
      // PHP: $url = "$protocol://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
      // PHP: $urlWithoutHash = substr($url, 0, -strlen("&hash=$hash"));
      const fullUrl = request.url;
      const hashStr = `&hash=${hash}`;
      const idx = fullUrl.lastIndexOf(hashStr);
      const urlWithoutHash = idx >= 0 ? fullUrl.substring(0, idx) : fullUrl;
      
      // Generate HMAC SHA1 hash
      const expectedHash = crypto
        .createHmac('sha1', secretKey)
        .update(urlWithoutHash)
        .digest('hex');
      
      console.log('🔐 Hash Verification:', {
        received: hash,
        expected: expectedHash,
        match: hash === expectedHash
      });
      
      if (hash !== expectedHash) {
        console.error('❌ Invalid hash signature!');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 403 }
        );
      }
      
      console.log('✅ Hash verification passed');
    } else {
      console.warn('⚠️ Hash verification skipped (no secret key or hash)');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate transaction
    const { data: existingTransaction } = await supabase
      .from('offerwall_transactions')
      .select('id')
      .eq('transaction_id', txn_id)
      .eq('offerwall', 'Notik')
      .single();

    if (existingTransaction) {
      console.log('⚠️ Duplicate transaction detected:', txn_id);
      // Return 200 (success) to Notik even for duplicates
      return NextResponse.json(
        { success: true, message: 'Transaction already processed' },
        { status: 200 }
      );
    }

    // Parse amount (convert to number)
    const coinAmount = parseFloat(amount);
    if (isNaN(coinAmount)) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check for chargeback (negative amount)
    const isChargeback = coinAmount < 0;
    if (isChargeback) {
      console.warn('⚠️ Chargeback detected:', { txn_id, amount: coinAmount, rewarded_txn_id });
    }

    // Get user's current balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', user_id, userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(userData.balance) || 0;
    const newBalance = Math.max(0, currentBalance + coinAmount); // Don't allow negative balance

    // Update user balance via RPC (atomic operation)
    const { error: rpcError } = await supabase.rpc('add_coins', {
      p_user_id: user_id,
      p_amount: coinAmount,
    });

    if (rpcError) {
      console.error('❌ Failed to update balance via RPC:', rpcError);
      
      // Fallback: Direct balance update
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user_id);

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
        user_id: user_id,
        offerwall: 'Notik',
        transaction_id: txn_id,
        amount: coinAmount,
        offer_id: offer_id || '',
        offer_name: offer_name || 'Unknown Offer',
        event_id: event_id || null,
        event_name: event_name || null,
        status: isChargeback ? 'chargeback' : 'completed',
        payout_usd: payout ? parseFloat(payout) : null,
        conversion_ip: conversion_ip || null,
        created_at: timestamp || new Date().toISOString(),
      });

    if (transactionError) {
      console.error('⚠️ Failed to record transaction:', transactionError);
      // Don't fail the postback if transaction recording fails
      // User already got the coins
    }

    console.log('✅ Notik postback processed successfully:', {
      user_id,
      txn_id,
      amount: coinAmount,
      event_name: event_name || 'N/A',
      oldBalance: currentBalance,
      newBalance: newBalance,
      isChargeback,
    });

    // Return 200 status code (Notik requires this)
    return NextResponse.json(
      {
        success: true,
        message: 'Postback processed successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Notik postback error:', error);
    // Still return 200 to avoid Notik retry loop
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 } // Return 200 even on error to prevent retries
    );
  }
}
