-- ==========================================
-- FREECOINO SCHEMA MIGRATION
-- Fix schema inconsistencies for offer tracking
-- Run this in Supabase SQL Editor
-- ==========================================

-- STEP 1: Fix offer_completions table - ensure both columns exist
-- schema.sql / schema-v2.sql have coins_awarded but NOT amount_earned
-- supabase-schema.sql has amount_earned but NOT coins_awarded
-- All postback handlers insert BOTH columns, so both must exist

ALTER TABLE public.offer_completions
  ADD COLUMN IF NOT EXISTS amount_earned INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.offer_completions
  ADD COLUMN IF NOT EXISTS coins_awarded INTEGER NOT NULL DEFAULT 0;

-- Drop the NOT NULL constraint from whichever one was added as NOT NULL
-- (since the original column might already have been NOT NULL)
-- This is safe because we set defaults above

-- STEP 2: Fix profiles table - ensure all columns needed by add_coins function exist

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_earned INTEGER DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ban_reason TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS crypto_address TEXT;

-- STEP 3: Create revtoo_transactions table for history page

CREATE TABLE IF NOT EXISTS public.revtoo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  trans_id TEXT NOT NULL,
  reward INTEGER NOT NULL,
  offer_name TEXT,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.revtoo_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own revtoo transactions" ON public.revtoo_transactions;
CREATE POLICY "Users can read own revtoo transactions"
  ON public.revtoo_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_revtoo_transactions_user_id ON public.revtoo_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_revtoo_transactions_created_at ON public.revtoo_transactions(created_at DESC);

-- STEP 4: Recreate add_coins function to handle missing total_earned gracefully

CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_has_total_col BOOLEAN;
BEGIN
  -- Check if total_earned column exists
  SELECT COUNT(*) > 0 INTO v_has_total_col
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'total_earned';

  -- Update balance
  IF v_has_total_col THEN
    UPDATE public.profiles
    SET coins_balance = coins_balance + p_amount,
        total_earned = CASE WHEN p_type = 'earn' THEN total_earned + p_amount ELSE total_earned END
    WHERE id = p_user_id
    RETURNING coins_balance INTO v_current_balance;
  ELSE
    UPDATE public.profiles
    SET coins_balance = coins_balance + p_amount
    WHERE id = p_user_id
    RETURNING coins_balance INTO v_current_balance;
  END IF;

  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, p_type, p_amount, v_current_balance, COALESCE(p_description, ''));

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'add_coins failed for user %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Create completions view for history page if it doesn't exist

CREATE OR REPLACE VIEW public.completions AS
SELECT
  oc.id,
  oc.user_id AS player_id,
  oc.offer_name AS program_id,
  COALESCE(oc.amount_earned, oc.coins_awarded, 0) / 1000.0 AS payout_decimal,
  COALESCE(oc.amount_earned, oc.coins_awarded, 0) AS coins_awarded,
  oc.offer_provider AS source,
  oc.completed_at AS created_at
FROM public.offer_completions oc
WHERE oc.status = 'completed';

-- STEP 6: Add click tracking columns to offer_completions

ALTER TABLE public.offer_completions
  ADD COLUMN IF NOT EXISTS click_url TEXT;

ALTER TABLE public.offer_completions
  ADD COLUMN IF NOT EXISTS events_json JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.offer_completions
  ADD COLUMN IF NOT EXISTS payout_potential INTEGER DEFAULT 0;

-- ==========================================
-- VERIFICATION QUERIES (run separately)
-- ==========================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'offer_completions';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'revtoo_transactions';
