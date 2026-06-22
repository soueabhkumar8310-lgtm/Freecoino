-- =====================================================
-- Freecoino Database Schema
-- Run this in Supabase SQL Editor before deployment
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  coins_balance INTEGER DEFAULT 0 CHECK (coins_balance >= 0),
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES auth.users(id),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- =====================================================
-- 2. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'withdraw', 'referral', 'bonus', 'daily_bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- =====================================================
-- 3. WITHDRAWALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('paypal', 'bitcoin', 'ethereum', 'litecoin', 'bank_transfer')),
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  tx_hash TEXT,                                          -- Bug #3 Fix: Added tx_hash column
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can read own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
CREATE POLICY "Users can create withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

-- =====================================================
-- 4. DAILY BONUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  amount INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for one bonus per day per user (using date_trunc which is IMMUTABLE)
CREATE UNIQUE INDEX idx_daily_bonuses_user_date ON public.daily_bonuses(user_id, date_trunc('day', claimed_at));

-- Enable RLS
ALTER TABLE public.daily_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own daily bonuses" ON public.daily_bonuses;
CREATE POLICY "Users can read own daily bonuses"
  ON public.daily_bonuses FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_daily_bonuses_user_id ON public.daily_bonuses(user_id);
CREATE INDEX idx_daily_bonuses_claimed_at ON public.daily_bonuses(claimed_at DESC);

-- =====================================================
-- 5. OFFERS TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.offer_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  offer_id TEXT NOT NULL,
  offer_name TEXT NOT NULL,
  offer_provider TEXT NOT NULL,
  amount_earned INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, offer_id)
);

-- Enable RLS
ALTER TABLE public.offer_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own offer completions" ON public.offer_completions;
CREATE POLICY "Users can read own offer completions"
  ON public.offer_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_offer_completions_user_id ON public.offer_completions(user_id);
CREATE INDEX idx_offer_completions_status ON public.offer_completions(status);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error'))
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- 7. FUNCTIONS
-- =====================================================

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, referral_code, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    substring(md5(random()::text || NEW.id::text) from 1 for 8),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update profile timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update timestamp on profile update
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function: Add coins to user balance
CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update balance
  UPDATE public.profiles
  SET coins_balance = coins_balance + p_amount
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, description, status)
  VALUES (p_user_id, p_type, p_amount, p_description, 'completed');
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_user_id UUID,
  p_amount INTEGER,
  p_method TEXT,
  p_wallet_address TEXT
)
RETURNS UUID AS $$
DECLARE
  v_withdrawal_id UUID;
  v_current_balance INTEGER;
BEGIN
  -- Check balance
  SELECT coins_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct coins
  UPDATE public.profiles
  SET coins_balance = coins_balance - p_amount
  WHERE id = p_user_id;
  
  -- Create withdrawal request
  INSERT INTO public.withdrawals (user_id, amount, method, wallet_address, status)
  VALUES (p_user_id, p_amount, p_method, p_wallet_address, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Record transaction
  INSERT INTO public.transactions (user_id, type, amount, description, status)
  VALUES (p_user_id, 'withdraw', -p_amount, 'Withdrawal request', 'pending');
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VIEWS
-- =====================================================

-- View: User stats
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id,
  p.display_name,
  p.coins_balance,
  COUNT(DISTINCT t.id) as total_transactions,
  COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.amount ELSE 0 END), 0) as total_earned,
  COALESCE(SUM(CASE WHEN t.type = 'withdraw' THEN ABS(t.amount) ELSE 0 END), 0) as total_withdrawn,
  COUNT(DISTINCT CASE WHEN t.type = 'referral' THEN t.id END) as referral_earnings,
  p.created_at
FROM public.profiles p
LEFT JOIN public.transactions t ON p.id = t.user_id
GROUP BY p.id, p.display_name, p.coins_balance, p.created_at;

-- =====================================================
-- 8. INITIAL DATA (Optional)
-- =====================================================

-- You can add initial data here if needed
-- For example, admin users, default settings, etc.

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test RLS policies
-- 4. Deploy your application
-- =====================================================
