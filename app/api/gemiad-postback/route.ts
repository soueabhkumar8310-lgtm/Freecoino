import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const WHITELISTED_IPS = ['64.226.92.208'];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function ok(message: string) {
  return new NextResponse(message, { status: 200 });
}

function getRealIP(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

async function handleGemiAdPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[gemiad-postback]', msg); };

  try {
    const clientIp = getRealIP(request);
    log(`Method: ${request.method}, IP: ${clientIp}`);
    log(`URL: ${request.url}`);

    if (!WHITELISTED_IPS.includes(clientIp)) {
      log(`IP not whitelisted: ${clientIp}`);
      return ok('Unauthorized');
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '';
    const offerId = url.searchParams.get('offerId') || '';
    const offerName = url.searchParams.get('offerName') || '';
    const eventId = url.searchParams.get('eventId') || '';
    const eventName = url.searchParams.get('eventName') || '';
    const payout = parseFloat(url.searchParams.get('payout') || '0');
    const reward = parseFloat(url.searchParams.get('reward') || '0');
    const txId = url.searchParams.get('txid') || '';
    const status = url.searchParams.get('status') || '';
    const sub1 = url.searchParams.get('sub1') || '';
    const sub2 = url.searchParams.get('sub2') || '';
    const hash = url.searchParams.get('hash') || '';

    log(`Parsed: userId=${userId}, offerId=${offerId}, txId=${txId}, status=${status}, payout=${payout}, reward=${reward}`);

    if (!userId || !offerId || !txId || !hash) {
      log('Missing required params');
      return ok('Unauthorized');
    }

    const secretKey = process.env.GEMIAD_SECRET_KEY || '';
    const generatedHash = crypto.createHash('sha256').update(userId + offerId + txId + secretKey).digest('hex');
    if (hash !== generatedHash) {
      log('Invalid hash - possible unauthorized postback');
      return ok('Unauthorized');
    }

    const supabase = getSupabase();

    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('tx_id', txId)
      .eq('source', 'gemiad')
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      log(`DUPLICATE IGNORED: txId=${txId} already processed`);
      return ok('Approved');
    }

    const isReversal = status === 'rejected';
    const coins = Math.round(Math.abs(reward));

    if (coins > 0) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, coins_balance, total_earned')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        log(`User not found: ${userId}`);
        return ok('Approved');
      }

      if (isReversal) {
        log(`Deducting ${coins} coins from user ${userId}`);
        const { error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: userId,
          p_amount: coins
        });
        if (deductError) log(`Deduct RPC failed: ${deductError.message}`);
        else log(`SUCCESS: Deducted ${coins} from user ${userId} (reversal)`);
      } else {
        log(`Crediting ${coins} coins to user ${userId}`);
        const { error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: userId,
          p_amount: coins
        });
        if (creditError) log(`Credit RPC failed: ${creditError.message}`);
        else log(`SUCCESS: Credited ${coins} to user ${userId}`);

        if (offerId) {
          const { data: interaction } = await supabase
            .from('user_offer_interactions')
            .select('id')
            .eq('user_id', userId)
            .eq('offer_id', offerId)
            .eq('provider', 'gemiad')
            .single();

          if (interaction) {
            await supabase
              .from('user_offer_interactions')
              .update({ status: 'completed' })
              .eq('id', interaction.id);
          }
        }

        try {
          await supabase.rpc('enqueue_commissions', { p_earner_id: userId, p_amount: coins, p_source: 'gemiad' });
          log('Referral commissions enqueued');
        } catch (e: unknown) {
          log(`Enqueue commissions error: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
      }
    }

    try {
      await supabase.from('completions').insert({
        player_id: userId,
        program_id: offerName || 'GemiAd Offer',
        offer_name: offerName,
        payout_decimal: Math.abs(payout),
        coins_awarded: isReversal ? -coins : coins,
        source: 'gemiad',
        status: isReversal ? 'reversed' : 'completed',
        tx_id: txId,
      });
      log('Completion recorded in completions table');
    } catch (e: unknown) {
      log(`Completions insert error: ${e instanceof Error ? e.message : 'Unknown'}`);
    }

    return ok('Approved');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    return ok('Approved');
  }
}

export async function GET(request: NextRequest) {
  return handleGemiAdPostback(request);
}

export async function POST(request: NextRequest) {
  return handleGemiAdPostback(request);
}