-- ============================================================
-- Northlane Studio — Master Supabase Schema & Migration Script
-- Run this entire script in your Supabase SQL Editor.
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- 2. Define Custom Enums & Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Public User Profiles Table (with Avatar URL & Metadata)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  phone_number text DEFAULT '+1 (415) 890-2104',
  preferred_currency text DEFAULT 'USD ($)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. User Roles Table (Admin Access)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- 5. Saved Shipping Addresses Table (Google Places Fulfillment Destinations)
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

-- 6. Saved Payment Methods Table (Stripe Wallet Metadata)
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

-- 7. AI Conversation Logs Table
CREATE TABLE IF NOT EXISTS public.ai_conversation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  topic text NOT NULL,
  user_prompt text NOT NULL,
  ai_summary text NOT NULL,
  recommended_products text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  subtitle text DEFAULT '' NOT NULL,
  category text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  rating numeric DEFAULT 5.0 NOT NULL,
  reviews_count integer DEFAULT 0 NOT NULL,
  image_url text DEFAULT '' NOT NULL,
  gallery text[] DEFAULT '{}' NOT NULL,
  description text DEFAULT '' NOT NULL,
  in_stock boolean DEFAULT true NOT NULL,
  stock_count integer DEFAULT 0 NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  is_new boolean DEFAULT false NOT NULL,
  is_bestseller boolean DEFAULT false NOT NULL,
  attributes jsonb DEFAULT '{}'::jsonb NOT NULL,
  specs jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Customer Stories Table
CREATE TABLE IF NOT EXISTS public.customer_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_role text,
  quote text NOT NULL,
  body text,
  image_url text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Journal Posts Table
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text DEFAULT 'Guide' NOT NULL,
  title text NOT NULL,
  read_time text DEFAULT '5 min' NOT NULL,
  image_url text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security (RLS) & Policies
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS
CREATE POLICY "Public profiles are viewable by owner" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id OR id IS NULL);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR id IS NULL);

-- User Addresses RLS
CREATE POLICY "Users view own addresses" ON public.user_addresses FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own addresses" ON public.user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own addresses" ON public.user_addresses FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own addresses" ON public.user_addresses FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Payment Methods RLS
CREATE POLICY "Users view own payment methods" ON public.user_payment_methods FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own payment methods" ON public.user_payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own payment methods" ON public.user_payment_methods FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users delete own payment methods" ON public.user_payment_methods FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- AI Conversation Logs RLS
CREATE POLICY "Users view own AI logs" ON public.ai_conversation_logs FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own AI logs" ON public.ai_conversation_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Products & Public Content RLS
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read stories" ON public.customer_stories FOR SELECT USING (true);
CREATE POLICY "Public read journal" ON public.journal_posts FOR SELECT USING (true);

-- ============================================================
-- Automated Trigger: Sync Google OAuth Avatar to User Profile
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Default Address & Payment Data
INSERT INTO public.user_addresses (label, recipient_name, phone_number, street_address, apt_suite, city, state, zip_code, country, delivery_instructions, is_default, is_verified)
VALUES
  ('Design Studio', 'Vrsnmllz03', '+1 (415) 890-2104', '124 Copenhagen Way', 'Studio #4B', 'San Francisco', 'CA', '94107', 'United States', 'Leave at front desk with receptionist.', true, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.user_payment_methods (stripe_payment_method_id, card_brand, last_four, exp_month, exp_year, is_default)
VALUES
  ('pm_mock_visa_4242', 'Visa', '4242', 11, 2028, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Order Lifecycle & Review Tables
-- ============================================================

-- Order status enum (Shopee-style lifecycle)
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('Placed','Processing','To Receive','To Rate','Completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 11. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.order_status DEFAULT 'Placed' NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  timeline_step integer DEFAULT 1 NOT NULL,
  carrier text DEFAULT '',
  tracking_number text DEFAULT '',
  estimated_delivery text DEFAULT '',
  shipping_address text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_image text DEFAULT '',
  sku text DEFAULT '',
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Order Reviews Table (Submitted via "To Rate" step)
CREATE TABLE IF NOT EXISTS public.order_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  media_url text DEFAULT '',
  media_caption text DEFAULT '',
  verified boolean DEFAULT true NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- Orders RLS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Order Items RLS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Order Reviews RLS
CREATE POLICY "Users submit own reviews" ON public.order_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.order_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read order reviews" ON public.order_reviews FOR SELECT USING (true);
