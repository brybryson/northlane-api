-- ============================================================
-- Northlane Saved Addresses Table Setup & Seed Script
-- Run this in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  recipient_name text NOT NULL,
  phone_number text NOT NULL,
  street_address text NOT NULL,
  apt_suite text DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  delivery_instructions text DEFAULT '',
  google_place_id text DEFAULT '',
  formatted_address text DEFAULT '',
  latitude numeric DEFAULT 37.7749,
  longitude numeric DEFAULT -122.4194,
  is_default boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Security Policies
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved addresses"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own saved addresses"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own saved addresses"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own saved addresses"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Seed Initial Saved Addresses
INSERT INTO public.user_addresses (
  label,
  recipient_name,
  phone_number,
  street_address,
  apt_suite,
  city,
  state,
  zip_code,
  country,
  delivery_instructions,
  google_place_id,
  formatted_address,
  latitude,
  longitude,
  is_default,
  is_verified
)
VALUES
  (
    'Design Studio',
    'Vrsnmllz03',
    '+1 (415) 890-2104',
    '124 Copenhagen Way',
    'Studio #4B',
    'San Francisco',
    'CA',
    '94107',
    'United States',
    'Leave at front desk with receptionist.',
    'ChIJ3S-g4nxu5kcR9SSd56msDHU',
    '124 Copenhagen Way, Studio #4B, San Francisco, CA 94107',
    37.7749,
    -122.4194,
    true,
    true
  ),
  (
    'Headquarters',
    'Vrsnmllz03',
    '+1 (415) 500-1200',
    '500 Howard Street',
    'Suite 1200',
    'San Francisco',
    'CA',
    '94105',
    'United States',
    'Loading dock entrance on 1st Street.',
    'ChIJu9_z4Lp_j4ARWzP5_3msEFU',
    '500 Howard Street, Suite 1200, San Francisco, CA 94105',
    37.7887,
    -122.3989,
    false,
    true
  )
ON CONFLICT DO NOTHING;
