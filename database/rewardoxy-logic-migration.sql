-- =============================================
-- REWARDOXY-LOGIC MIGRATION
-- Migrates freecoino to the production schema used by rewardoxy:
--   users (replaces profiles usage), completions (replaces offer_completions),
--   new withdrawals shape, notifications extras, and supporting tables + RPCs.
-- Run this in the Supabase SQL Editor.
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
  fraud_status TEXT NOT NULL DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'flagged', 'suspended')),
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

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON public.users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_signup_source ON public.users(signup_source);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user row" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own user row" ON public.users FOR UPDATE USING (auth.uid() = id);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completions_player_id ON public.completions(player_id);
CREATE INDEX IF NOT EXISTS idx_completions_created_at ON public.completions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_source_tx ON public.completions(source, tx_id);

ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON public.completions FOR SELECT USING (auth.uid() = player_id);

-- =============================================
-- 3. WITHDRAWALS (new shape: coins, amount_usd, crypto_address, status, tx_hash, requested_at)
-- =============================================
ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill coins from legacy amount and requested_at from created_at
UPDATE public.withdrawals SET coins = amount WHERE coins = 0 AND amount IS NOT NULL;
UPDATE public.withdrawals SET requested_at = created_at WHERE requested_at IS NULL;

-- Migrate legacy statuses to the new set
UPDATE public.withdrawals SET status = 'paid' WHERE status IN ('completed', 'approved');
UPDATE public.withdrawals SET status = 'failed' WHERE status = 'rejected';

-- Replace status constraint
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_status_check;
ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_status_check
  CHECK (status IN ('pending', 'processing', 'paid', 'failed'));

CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON public.withdrawals(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- =============================================
-- 4. NOTIFICATIONS (extras: admin_sent, is_broadcast, is_dismissed, read)
-- =============================================
-- user_id must be nullable for broadcasts
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill new read column from legacy is_read
UPDATE public.notifications SET read = is_read WHERE is_read IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_admin_sent ON public.notifications(admin_sent, created_at DESC);

-- =============================================
-- 5. DAILY BONUS CLAIMS (new table; daily_bonuses stays as legacy)
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

CREATE POLICY "Users can view own bonus claims" ON public.daily_bonus_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim own bonus" ON public.daily_bonus_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

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
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'reversed')),
  events_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_interactions_user ON public.user_offer_interactions(user_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_interactions_offer ON public.user_offer_interactions(user_id, offer_id, provider);

ALTER TABLE public.user_offer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offer interactions" ON public.user_offer_interactions FOR SELECT USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view own milestone progress" ON public.milestone_progress FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- 8. REFERRALS (new shape: referrer_uid / referee_uid / lifetime_coins_earned)
-- =============================================
DROP TABLE IF EXISTS public.referrals;

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

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_uid OR auth.uid() = referee_uid);

-- Referral ancestors (populated by populate_referral_ancestors)
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

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_cache FOR SELECT USING (true);

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

-- Increment coins by an amount (admin refunds). Amount may be negative.
CREATE OR REPLACE FUNCTION public.increment_coins(uid UUID, amount INTEGER)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
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
      SELECT email_verified INTO commission FROM public.users WHERE id = rec.earner_id;
      IF commission THEN
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
