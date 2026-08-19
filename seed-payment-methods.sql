-- ============================================================
-- Northlane Saved Payment Methods Table Setup & Seed Script
-- Run this in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_payment_method_id text NOT NULL,
  card_brand text NOT NULL DEFAULT 'Visa',
  last_four text NOT NULL,
  exp_month integer NOT NULL,
  exp_year integer NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Security Policies
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods"
  ON public.user_payment_methods FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own payment methods"
  ON public.user_payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own payment methods"
  ON public.user_payment_methods FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own payment methods"
  ON public.user_payment_methods FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Seed Initial Payment Methods
INSERT INTO public.user_payment_methods (stripe_payment_method_id, card_brand, last_four, exp_month, exp_year, is_default)
VALUES
  ('pm_mock_visa_4242', 'Visa', '4242', 11, 2028, true),
  ('pm_mock_mc_8899', 'Mastercard', '8899', 8, 2027, false)
ON CONFLICT DO NOTHING;
