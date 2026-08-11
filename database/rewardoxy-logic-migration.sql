-- =============================================
-- REWARDOXY-LOGIC MIGRATION (data-preserving)
-- Migrates freecoino to the production schema used by rewardoxy:
--   users (backfilled from profiles), completions (backfilled from offer_completions),
--   new withdrawals shape, notifications, and supporting tables + RPCs.
-- NO existing table, row, or policy is deleted. Legacy tables stay intact.
-- =============================================

-- =============================================
-- 1. USERS TABLE (replaces profiles in app code)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  coins_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  this_month_earnings INTEGER NOT NULL DEFAULT 0,
  pending_referral_earnings INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  crypto_address TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.users(id),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  fraud_status TEXT NOT NULL DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'flagged', 'suspended', 'cashout_blocked')),
  fraud_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  vpn_detected_count INTEGER NOT NULL DEFAULT 0,
  mismatch_count INTEGER NOT NULL DEFAULT 0,
  signup_country TEXT,
  last_seen_country TEXT,
  signup_ip TEXT,
  country TEXT,
  signup_source TEXT,
  accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON public.users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_signup_source ON public.users(signup_source);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user row or their referrals" ON public.users;
CREATE POLICY "Users can view own user row or their referrals" ON public.users
  FOR SELECT USING (auth.uid() = id OR referred_by = auth.uid() OR this_month_earnings > 0);

DROP POLICY IF EXISTS "Users can update own user row" ON public.users;
CREATE POLICY "Users can update own user row" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Backfill: one users row per auth.users (profiles fields mapped; email falls back to auth email)
INSERT INTO public.users (id, email, display_name, avatar_url, coins_balance, total_earned,
  this_month_earnings, pending_referral_earnings, streak_count, crypto_address, referral_code,
  email_verified, is_banned, ban_reason, signup_source, created_at, updated_at)
SELECT
  au.id,
  COALESCE(p.email, au.email),
  COALESCE(p.display_name, ''),
  p.avatar_url,
  COALESCE(p.coins_balance, 0),
  COALESCE(p.total_earned, 0),
  0,
  0,
  COALESCE(p.streak_count, 0),
  p.crypto_address,
  p.referral_code,
  COALESCE(p.email_verified, FALSE),
  COALESCE(p.is_banned, FALSE),
  p.ban_reason,
  'web',
  COALESCE(p.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ON CONFLICT (id) DO NOTHING;

-- Two-step: link referred_by after all rows exist (self-referencing FK)
UPDATE public.users u
SET referred_by = p.referred_by
FROM public.profiles p
WHERE p.id = u.id AND p.referred_by IS NOT NULL AND u.referred_by IS NULL;

-- =============================================
-- 2. COMPLETIONS TABLE (replaces offer_completions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  offer_name TEXT,
  payout_decimal NUMERIC(12,2),
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  tx_id TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completions_player_id ON public.completions(player_id);
CREATE INDEX IF NOT EXISTS idx_completions_created_at ON public.completions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_source_tx ON public.completions(source, tx_id);

ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own completions" ON public.completions;
CREATE POLICY "Users can view own completions" ON public.completions
  FOR SELECT USING (auth.uid() = player_id);

-- Backfill from legacy offer_completions (payout_potential was stored in coin-scale; /1000 = USD)
INSERT INTO public.completions (id, player_id, program_id, offer_name, payout_decimal,
  coins_awarded, source, status, created_at)
SELECT
  oc.id,
  oc.user_id,
  oc.offer_id,
  oc.offer_name,
  CASE WHEN oc.payout_potential > 0 THEN ROUND(oc.payout_potential::numeric / 1000, 2) ELSE NULL END,
  COALESCE(oc.coins_awarded, 0),
  oc.offer_provider,
  oc.status,
  COALESCE(oc.completed_at, NOW())
FROM public.offer_completions oc
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. WITHDRAWALS (new shape; legacy rows preserved)
-- =============================================
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS coins INTEGER,
  ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;

UPDATE public.withdrawals
SET coins = amount,
    amount_usd = ROUND(amount::numeric / 1000, 2),
    requested_at = created_at
WHERE requested_at IS NULL AND amount IS NOT NULL;

-- Drop old status CHECK first, map legacy statuses, then add the new CHECK
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_status_check;

UPDATE public.withdrawals SET status = 'paid' WHERE status IN ('completed', 'approved');
UPDATE public.withdrawals SET status = 'failed' WHERE status = 'rejected';

ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_status_check
  CHECK (status IN ('pending', 'processing', 'paid', 'failed'));

-- New inserts no longer write method/amount
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_method_check;
ALTER TABLE public.withdrawals ALTER COLUMN method DROP NOT NULL;
ALTER TABLE public.withdrawals ALTER COLUMN amount DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON public.withdrawals(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- =============================================
-- 4. NOTIFICATIONS (did not exist; user_id nullable for broadcasts)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  is_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
  admin_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON public.notifications(is_broadcast, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own or broadcast notifications" ON public.notifications;
CREATE POLICY "Users can view own or broadcast notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR is_broadcast = TRUE);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 5. DAILY BONUS CLAIMS (backfilled from daily_bonuses)
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  streak_day INTEGER NOT NULL DEFAULT 1,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_bonus_claims_user ON public.daily_bonus_claims(user_id, claimed_at DESC);

ALTER TABLE public.daily_bonus_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bonus claims" ON public.daily_bonus_claims;
CREATE POLICY "Users can view own bonus claims" ON public.daily_bonus_claims
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can claim own bonus" ON public.daily_bonus_claims;
CREATE POLICY "Users can claim own bonus" ON public.daily_bonus_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

INSERT INTO public.daily_bonus_claims (user_id, coins_awarded, streak_day, claimed_at)
SELECT user_id, COALESCE(amount, 0), day_number, COALESCE(claimed_at, NOW())
FROM public.daily_bonuses;

-- =============================================
-- 6. USER OFFER INTERACTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_offer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  offer_name TEXT,
  provider TEXT NOT NULL,
  click_url TEXT,
  image_url TEXT,
  payout NUMERIC(12,2),
  tracking_type TEXT,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'reversed')),
  events_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_interactions_user ON public.user_offer_interactions(user_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_interactions_offer ON public.user_offer_interactions(user_id, offer_id, provider);

ALTER TABLE public.user_offer_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own offer interactions" ON public.user_offer_interactions;
CREATE POLICY "Users can view own offer interactions" ON public.user_offer_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 7. MILESTONE PROGRESS (CPE multi-event offers)
-- =============================================
CREATE TABLE IF NOT EXISTS public.milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_name TEXT,
  payout NUMERIC(12,2),
  is_reversed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_progress_user ON public.milestone_progress(user_id, offer_id, provider);

ALTER TABLE public.milestone_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestone progress" ON public.milestone_progress;
CREATE POLICY "Users can view own milestone progress" ON public.milestone_progress
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 8. REFERRALS + ANCESTORS (backfilled from users.referred_by)
-- =============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_uid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referee_uid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lifetime_coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_uid, referee_uid)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_uid);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_uid OR auth.uid() = referee_uid);

INSERT INTO public.referrals (referrer_uid, referee_uid, lifetime_coins_earned, created_at)
SELECT u.referred_by, u.id, 0, u.created_at
FROM public.users u
WHERE u.referred_by IS NOT NULL
ON CONFLICT (referrer_uid, referee_uid) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.referral_ancestors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ancestor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  descendant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  UNIQUE(ancestor_id, descendant_id)
);

-- =============================================
-- 9. LEADERBOARD CACHE
-- =============================================
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  monthly_earnings INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user ON public.leaderboard_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard_cache(rank);

ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard_cache;
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_cache
  FOR SELECT USING (true);

-- =============================================
-- 10. FRAUD LOG
-- =============================================
CREATE TABLE IF NOT EXISTS public.fraud_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  signup_country TEXT,
  detected_country TEXT,
  ip_address TEXT,
  vpn_data JSONB,
  action_taken TEXT,
  resolved_by_admin_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_log_user ON public.fraud_log(user_id, created_at DESC);

-- =============================================
-- 11. NOTIFICATION READS (broadcast read tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notification reads" ON public.notification_reads;
CREATE POLICY "Users can read own notification reads" ON public.notification_reads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification reads" ON public.notification_reads;
CREATE POLICY "Users can insert own notification reads" ON public.notification_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification reads" ON public.notification_reads;
CREATE POLICY "Users can update own notification reads" ON public.notification_reads
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 12. COMMISSION QUEUE (referral commissions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.commission_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_queue_status ON public.commission_queue(status, created_at);

-- =============================================
-- 13. APP SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 14. AUTH TOKEN TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.account_deletion_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 15. RPCs
-- =============================================

-- Credit coins to a user's balance + totals. Returns new balances.
CREATE OR REPLACE FUNCTION public.credit_postback(p_user_id UUID, p_amount INTEGER)
RETURNS TABLE(new_balance INTEGER, new_total INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.users
  SET coins_balance = coins_balance + p_amount,
      total_earned = total_earned + p_amount,
      this_month_earnings = this_month_earnings + p_amount
  WHERE id = p_user_id
  RETURNING coins_balance, total_earned;
END;
$$;

-- Deduct coins (chargebacks), never below 0.
CREATE OR REPLACE FUNCTION public.deduct_user_points(p_userid UUID, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET coins_balance = GREATEST(coins_balance - p_amount, 0)
  WHERE id = p_userid;
END;
$$;

-- Increment coins by an amount (daily bonus). Amount may be negative.
-- Bound to the calling user: only the signed-in user may increment their own balance.
CREATE OR REPLACE FUNCTION public.increment_coins(uid UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF uid <> auth.uid() THEN
    RETURN;
  END IF;
  UPDATE public.users
  SET coins_balance = coins_balance + amount
  WHERE id = uid;
END;
$$;

-- Queue referral commission for an earning event.
CREATE OR REPLACE FUNCTION public.enqueue_commissions(p_earner_id UUID, p_amount INTEGER, p_source TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.commission_queue (earner_id, amount, source)
  VALUES (p_earner_id, p_amount, p_source);
END;
$$;

-- Process queued commissions: credit 5% of verified referrals' earnings to the referrer.
CREATE OR REPLACE FUNCTION public.process_commission_queue(p_batch_size INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  rec record;
  referrer_id UUID;
  commission INTEGER;
  processed INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT * FROM public.commission_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT u.referred_by INTO referrer_id
    FROM public.users u WHERE u.id = rec.earner_id;

    IF referrer_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.users WHERE id = rec.earner_id AND email_verified) THEN
        commission := FLOOR(rec.amount * 0.05);
        IF commission > 0 THEN
          UPDATE public.users
          SET pending_referral_earnings = pending_referral_earnings + commission
          WHERE id = referrer_id;

          UPDATE public.referrals
          SET lifetime_coins_earned = lifetime_coins_earned + commission
          WHERE referrer_uid = referrer_id AND referee_uid = rec.earner_id;

          INSERT INTO public.notifications (user_id, title, message, read)
          VALUES (referrer_id, 'New Referral Commission',
                  'You earned ' || commission || ' coins from a referral!', FALSE);
        END IF;
      END IF;
    END IF;

    DELETE FROM public.commission_queue WHERE id = rec.id;
    processed := processed + 1;
  END LOOP;

  RETURN processed;
END;
$$;

-- Populate referral ancestors for a user (max depth 6).
CREATE OR REPLACE FUNCTION public.populate_referral_ancestors(p_user_id UUID, p_referrer_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_ancestor UUID := p_referrer_id;
  level INTEGER := 1;
BEGIN
  WHILE current_ancestor IS NOT NULL AND level <= 6 LOOP
    INSERT INTO public.referral_ancestors (ancestor_id, descendant_id, level)
    VALUES (current_ancestor, p_user_id, level)
    ON CONFLICT (ancestor_id, descendant_id) DO NOTHING;

    SELECT referred_by INTO current_ancestor
    FROM public.users WHERE id = current_ancestor;

    level := level + 1;
  END LOOP;
END;
$$;

-- Refresh the leaderboard cache from this_month_earnings.
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_cache()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.leaderboard_cache;

  INSERT INTO public.leaderboard_cache (rank, user_id, display_name, monthly_earnings, updated_at)
  SELECT
    ROW_NUMBER() OVER (ORDER BY this_month_earnings DESC, coins_balance DESC),
    id,
    display_name,
    this_month_earnings,
    NOW()
  FROM public.users
  WHERE is_banned = FALSE AND this_month_earnings > 0
  ORDER BY this_month_earnings DESC, coins_balance DESC
  LIMIT 50;
END;
$$;

-- Delete a user account (cascades to all related rows).
CREATE OR REPLACE FUNCTION public.delete_user_account(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.users WHERE id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Update login streak (called on OAuth login).
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  uid UUID := auth.uid();
  last_claim TIMESTAMPTZ;
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  SELECT claimed_at INTO last_claim
  FROM public.daily_bonus_claims
  WHERE user_id = uid
  ORDER BY claimed_at DESC
  LIMIT 1;

  IF last_claim IS NULL OR last_claim::date < CURRENT_DATE - 1 THEN
    UPDATE public.users SET streak_count = 1 WHERE id = uid;
  ELSIF last_claim::date = CURRENT_DATE - 1 THEN
    UPDATE public.users SET streak_count = streak_count + 1 WHERE id = uid;
  END IF;
END;
$$;

-- =============================================
-- 16. MISC FIXES
-- =============================================

-- Point legacy reviews FK at users (ids are the same auth.users ids).
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Backfill referral ancestors for all existing referral links
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id, referred_by FROM public.users WHERE referred_by IS NOT NULL LOOP
    PERFORM public.populate_referral_ancestors(r.id, r.referred_by);
  END LOOP;
END;
$$;

-- =============================================
-- 17. HARDENING
-- =============================================

-- Server-only RPCs: remove PUBLIC and anon/authenticated EXECUTE, keep service_role.
-- increment_coins and update_streak stay client-callable (daily bonus / streak flows
-- run under the signed-in user's session).
REVOKE EXECUTE ON FUNCTION public.credit_postback(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_user_points(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_commissions(UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_commission_queue(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.populate_referral_ancestors(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_leaderboard_cache() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_account(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_coins(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal(UUID, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coins(UUID, INTEGER) FROM anon;

GRANT EXECUTE ON FUNCTION public.credit_postback(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_user_points(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_commissions(UUID, INTEGER, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_commission_queue(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.populate_referral_ancestors(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_leaderboard_cache() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_coins(UUID, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_withdrawal(UUID, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Internal tables: no client access needed; ENABLE RLS with no policies = deny all
-- for anon/authenticated. service_role and SECURITY DEFINER functions bypass RLS.
ALTER TABLE public.referral_ancestors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_tokens ENABLE ROW LEVEL SECURITY;
