-- ==========================================
-- ADD TEST COINS TO YOUR ACCOUNT
-- ==========================================

-- Step 1: Check your current balance
SELECT id, email, display_name, coins_balance 
FROM profiles 
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

-- Step 2: Add 2000 coins to your account
UPDATE profiles 
SET coins_balance = coins_balance + 2000,
    total_earned = total_earned + 2000,
    updated_at = NOW()
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';

-- Step 3: Record the transaction (optional - for history)
INSERT INTO transactions (user_id, type, amount, description, status)
VALUES (
  '338939c3-a7ba-45ce-ad02-6af8126b78fd',
  'earn',
  2000,
  'Test coins for withdrawal testing',
  'completed'
);

-- Step 4: Verify the update
SELECT id, email, display_name, coins_balance, total_earned
FROM profiles 
WHERE id = '338939c3-a7ba-45ce-ad02-6af8126b78fd';
