-- Fix Withdrawals Table Schema
-- =====================================================
-- This script fixes the withdrawal statuses and methods to match the application code

-- Step 1: Drop the old CHECK constraints
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_method_check;
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_status_check;

-- Step 2: Add new CHECK constraints with correct values
ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_method_check 
  CHECK (method IN ('paypal', 'bitcoin', 'ethereum', 'litecoin', 'bank_transfer'));

ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'rejected'));

-- Step 3: Update any existing 'paid' status to 'completed'
UPDATE public.withdrawals SET status = 'completed' WHERE status = 'paid';

-- Step 4: Update any existing 'failed' status to 'rejected'
UPDATE public.withdrawals SET status = 'rejected' WHERE status = 'failed';

-- Step 5: Verify the changes
SELECT DISTINCT status FROM public.withdrawals;
SELECT DISTINCT method FROM public.withdrawals;
