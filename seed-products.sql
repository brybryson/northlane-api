-- ============================================================
-- Northlane Products Table — Safe Setup & Seed Script
-- Run this in Supabase SQL Editor.
-- It is safe to run more than once (uses IF NOT EXISTS and ON CONFLICT DO NOTHING).
-- ============================================================

-- 1. Create products table if not yet created
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  rating numeric NOT NULL DEFAULT 5.0,
  reviews_count integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  stock_count integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  attributes jsonb NOT NULL DEFAULT '{}',
  specs jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (safe even if already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (only if they don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow admin write access'
  ) THEN
    CREATE POLICY "Allow admin write access" ON public.products FOR ALL TO authenticated 
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

-- 4. Create updated_at trigger (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated_at'
  ) THEN
    CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- 5. Insert all catalog products (skip any that already exist)
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'kb-01', 'Aster 65 Mechanical Keyboard', 'Silent tactile · Solid Walnut Base', 'Keyboards', 'Northlane Studio',
  4850, 5950, 4.9, 128,
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80']::text[],
  'Crafted with double-damped hot-swappable tactile switches, CNC solid walnut base, and gasket-mount architecture for whisper-quiet typing.', true, 18,
  true, false, true,
  '{"bestFor":["Developers","Office Workers","Designers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist","badge":"Best Seller"}'::jsonb, '{"Layout":"65% Compact (68 Keys)","Switches":"Custom Northlane Quiet Tactile","Connectivity":"Bluetooth 5.3 + 2.4GHz + USB-C","Materials":"Solid Walnut & Anodized Plate","Warranty":"3-Year Studio Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'kb-02', 'Northlane Flow 75 Pro Keyboard', 'Low-profile Linear · CNC Aluminum', 'Keyboards', 'Northlane Studio',
  5450, 6250, 4.8, 94,
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80']::text[],
  'Ultra-slim 75% layout with per-key RGB backlight, hot-swappable low-profile switches, and QMK/VIA key mapping support.', true, 12,
  true, true, false,
  '{"bestFor":["Developers","Gamers","Students"],"budgetTier":"Premium","workspaceStyle":"Professional","badge":"New Arrival"}'::jsonb, '{"Layout":"75% Exploded Layout","Switches":"Low-Profile Red Linear","Connectivity":"Wireless 2.4Ghz & Type-C","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'kb-03', 'Northlane Ergo Split Keyboard', 'Ortholinear split · Palm Rests Included', 'Keyboards', 'Northlane Studio',
  6950, NULL, 4.9, 62,
  'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80']::text[],
  'Fully split ergonomic keyboard designed to relieve wrist strain and shoulder tightness during long coding sessions.', true, 7,
  false, false, false,
  '{"bestFor":["Developers","Office Workers"],"budgetTier":"Premium","workspaceStyle":"Minimalist","badge":"Staff Pick"}'::jsonb, '{"Layout":"Split Ortholinear 60%","Switches":"Silent Linear Dampened","Warranty":"3-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'm-01', 'Nordic Wireless Precision Mouse', 'Ergonomic · Matte Graphite', 'Mouse', 'Northlane Studio',
  2950, 3450, 4.9, 156,
  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80']::text[],
  'Designed for precise natural hand orientation. 8,000 DPI glass tracking sensor with whisper-silent magnetic scroll wheel.', true, 25,
  true, false, true,
  '{"bestFor":["Designers","Developers","Office Workers"],"budgetTier":"Mid-Range","workspaceStyle":"Professional","badge":"Best Seller"}'::jsonb, '{"Sensor":"Darkfield 8000 DPI Optical","Clicks":"Silent Tactile Microswitches","Warranty":"2-Year Studio Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'm-02', 'Northlane Vertical Ergo Mouse', '57-Degree Natural Grip Angle', 'Mouse', 'Northlane Studio',
  2450, NULL, 4.7, 48,
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80']::text[],
  'Medical-grade vertical angle mouse promoting neutral forearm position for repetitive strain prevention.', true, 15,
  false, false, false,
  '{"bestFor":["Office Workers","Developers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Angle":"57 Degrees","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'm-03', 'Northlane Studio Stealth Mouse', 'Ultra-Lightweight · PTFE Glide Skates', 'Mouse', 'Northlane Studio',
  1850, NULL, 4.8, 72,
  'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80']::text[],
  'Featherlight 55-gram wireless mouse built with flawless optical tracking and zero-latency wireless connectivity.', true, 20,
  false, false, false,
  '{"bestFor":["Gamers","Designers"],"budgetTier":"Budget","workspaceStyle":"Gaming","badge":"On Sale"}'::jsonb, '{"Weight":"55 grams","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'au-01', 'Halo Studio ANC Headphones', 'Active Noise Cancelling · Memory Foam', 'Audio', 'Bang & Olufsen',
  5950, 6950, 4.9, 210,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']::text[],
  'Acoustic spatial audio drivers with adaptive noise isolation. Ultra-soft lambskin memory foam ear cushions for 30 hours of quiet focus.', true, 14,
  true, false, true,
  '{"bestFor":["Developers","Content Creators","Office Workers","Students"],"budgetTier":"Premium","workspaceStyle":"Minimalist","badge":"Best Seller"}'::jsonb, '{"Drivers":"40mm Custom Titanium","ANC":"Hybrid 4-Mic Active Noise Cancellation","Warranty":"3-Year International Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'au-02', 'Northlane Studio Reference Speakers', 'Scandinavian Birch · 100W RMS', 'Audio', 'Sonos',
  6850, NULL, 4.8, 52,
  'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80']::text[],
  'Compact near-field studio monitors with woven kevlar woofers and silk dome tweeters for pristine acoustic clarity.', true, 9,
  true, false, false,
  '{"bestFor":["Content Creators","Designers"],"budgetTier":"Premium","workspaceStyle":"Architectural","badge":"Staff Pick"}'::jsonb, '{"Power":"100W Peak RMS","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'au-03', 'Northlane Studio Reference Earbuds', 'Active ANC · Wireless Charging Case', 'Audio', 'Northlane Studio',
  3450, NULL, 4.7, 84,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80']::text[],
  'Compact in-ear wireless monitors with personalized sound profile tuning and IPX4 sweat resistance.', true, 22,
  false, false, false,
  '{"bestFor":["Office Workers","Students","Developers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Battery":"8 Hours + 24 Hours in Case","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'mon-01', 'Northlane UltraView 34 Ultrawide', '34-inch Curved 4K OLED · 144Hz', 'Monitors', 'Northlane Studio',
  7450, NULL, 4.9, 45,
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80']::text[],
  'Immersive 21:9 ultrawide OLED panel delivering infinite contrast ratio, 99% DCI-P3 color accuracy, and 90W USB-C power delivery.', true, 5,
  true, true, false,
  '{"bestFor":["Developers","Designers","Gamers"],"budgetTier":"Premium","workspaceStyle":"Professional","badge":"New Arrival"}'::jsonb, '{"Resolution":"3440 x 1440 UWQHD OLED","Warranty":"3-Year Burn-In Protection"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'mon-02', 'Northlane Studio Clarity 27 Monitor', '27-inch 4K IPS · 100% sRGB', 'Monitors', 'Northlane Studio',
  6450, NULL, 4.8, 64,
  'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80']::text[],
  'Ultra-sharp 4K IPS display engineered for color-accurate photo editing, code editing, and graphic design.', true, 11,
  false, false, false,
  '{"bestFor":["Designers","Developers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Resolution":"3840 x 2160 UHD","Warranty":"3-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'mon-03', 'Northlane Dual Monitor Mount Arm', 'Gas-Spring Suspension · Solid Aluminum', 'Monitors', 'Northlane Studio',
  2850, NULL, 4.9, 92,
  'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80']::text[],
  'Heavy-duty dual monitor arm allowing smooth fluid motion, cable routing channels, and 360-degree rotation.', true, 19,
  false, false, false,
  '{"bestFor":["Developers","Office Workers"],"budgetTier":"Budget","workspaceStyle":"Professional"}'::jsonb, '{"Capacity":"Up to 32-inch monitors","Warranty":"5-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'desk-01', 'Northlane Lift Standing Desk', 'Solid American Walnut · Dual Motor', 'Desks', 'Northlane Studio',
  7450, 8250, 5, 75,
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80']::text[],
  'Handcrafted solid walnut desktop paired with whisper-quiet dual electric motors and 4 memory height presets.', true, 6,
  true, false, true,
  '{"bestFor":["Developers","Designers","Office Workers"],"budgetTier":"Premium","workspaceStyle":"Architectural","badge":"Best Seller"}'::jsonb, '{"Top":"Solid American Walnut","Motors":"Dual Silent Electric","Warranty":"10-Year Frame Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'desk-02', 'Northlane Studio Compact Oak Desk', 'Scandi Solid Oak · Cable Drawer', 'Desks', 'Northlane Studio',
  5850, NULL, 4.8, 38,
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80']::text[],
  'Minimalist compact desk designed for smaller home offices with integrated felt-lined stationery drawer.', true, 8,
  false, false, false,
  '{"bestFor":["Students","Office Workers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Dimensions":"120cm x 60cm","Warranty":"5-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'desk-03', 'Under-Desk Steel Storage Drawers', 'Modular Locking Cabinet · Soft-Close', 'Desks', 'Northlane Studio',
  2950, NULL, 4.7, 29,
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80']::text[],
  'Sleek powder-coated steel mobile file cabinet matching solid walnut and oak desk finishes.', true, 15,
  false, false, false,
  '{"bestFor":["Office Workers","Developers"],"budgetTier":"Budget","workspaceStyle":"Professional"}'::jsonb, '{"Drawers":"3 Soft-Close Drawers","Warranty":"3-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'chair-01', 'Northlane Ergo Executive Chair', 'Breathable Mesh · 4D Armrests', 'Seating', 'Herman Miller',
  6850, NULL, 4.9, 112,
  'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80']::text[],
  'Advanced lumbar suspension chair engineered for posture alignment and 12-hour comfortable seating.', true, 8,
  true, false, false,
  '{"bestFor":["Developers","Office Workers"],"budgetTier":"Premium","workspaceStyle":"Professional","badge":"Best Seller"}'::jsonb, '{"Lumbar":"Dynamic PostureFit","Warranty":"12-Year Studio Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'chair-02', 'Northlane Studio Task Mesh Chair', 'Ergonomic Lumbar Support · Tilt Lock', 'Seating', 'Northlane Studio',
  4450, NULL, 4.7, 54,
  'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80']::text[],
  'Streamlined ergonomic desk chair featuring responsive lumbar support and high-density foam seat cushion.', true, 12,
  false, false, false,
  '{"bestFor":["Students","Office Workers"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Material":"High-Tension Mesh Backing","Warranty":"5-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'chair-03', 'Northlane Active Ergonomic Stool', '360-Degree Motion Base · Height Adjustable', 'Seating', 'Northlane Studio',
  2450, NULL, 4.8, 41,
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80']::text[],
  'Dynamic wobble stool encouraging active sitting, core engagement, and seamless height changes with standing desks.', true, 16,
  false, false, false,
  '{"bestFor":["Developers","Designers"],"budgetTier":"Budget","workspaceStyle":"Creative"}'::jsonb, '{"Base":"Weighted Non-Slip Rubber","Warranty":"3-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'acc-01', 'Meridian Warm Brass Desk Lamp', 'Warm Dimmable · Brushed Brass', 'Desk Accessories', 'Grovemade',
  2950, NULL, 4.9, 86,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80']::text[],
  'Solid brushed brass arch lamp featuring flicker-free 2700K warm LED light with smooth touch-dimming for evening editing.', true, 11,
  true, false, false,
  '{"bestFor":["Designers","Content Creators","Office Workers"],"budgetTier":"Mid-Range","workspaceStyle":"Architectural","badge":"Staff Pick"}'::jsonb, '{"Temperature":"2700K Warm Amber","Warranty":"5-Year Guarantee"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'acc-02', 'Premium Felt & Walnut Desk Mat', 'Merino Wool Felt · Anti-slip Backing', 'Desk Accessories', 'Grovemade',
  890, NULL, 4.9, 310,
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80']::text[],
  'Genuine German merino wool felt mat adding warmth, acoustic dampening, and mouse precision to your workspace.', true, 40,
  false, false, true,
  '{"bestFor":["Developers","Designers","Students","Office Workers"],"budgetTier":"Budget","workspaceStyle":"Minimalist","badge":"Best Seller"}'::jsonb, '{"Dimensions":"900mm x 400mm","Warranty":"Lifetime Guarantee"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'acc-03', 'Solid Walnut Desk Shelf Riser', 'Dual Aluminum Legs · Ergonomic Eye Level', 'Desk Accessories', 'Northlane Studio',
  2450, NULL, 4.9, 118,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80']::text[],
  'Hand-crafted solid walnut desk shelf elevating your monitor while creating clean storage space underneath.', true, 14,
  false, false, false,
  '{"bestFor":["Developers","Designers"],"budgetTier":"Mid-Range","workspaceStyle":"Architectural"}'::jsonb, '{"Top":"Solid American Walnut","Warranty":"5-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'cg-01', 'Creator 4K Pro Studio Webcam', 'Sony STARVIS Sensor · Dual Studio Mics', 'Creator Gear', 'Logitech MX',
  3450, NULL, 4.8, 88,
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80']::text[],
  'Ultra HD 4K 60fps webcam with low-light auto-framing and magnetic privacy shutter.', true, 16,
  false, false, false,
  '{"bestFor":["Content Creators","Office Workers"],"budgetTier":"Mid-Range","workspaceStyle":"Professional","badge":"Best Seller"}'::jsonb, '{"Resolution":"4K UHD at 60fps","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'cg-02', 'Northlane Studio Condenser Mic & Boom', 'Cardioid Capsule · Internal Shockmount', 'Creator Gear', 'Northlane Studio',
  4250, NULL, 4.9, 67,
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80']::text[],
  'Broadcast-grade XLR & USB studio condenser microphone with silent low-profile desk arm.', true, 10,
  false, false, false,
  '{"bestFor":["Content Creators","Developers"],"budgetTier":"Mid-Range","workspaceStyle":"Creative"}'::jsonb, '{"Capsule":"25mm Large Diaphragm","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'cg-03', 'Northlane LED Studio Key Light Panel', 'Variable Color Temp (2700K - 6500K)', 'Creator Gear', 'Northlane Studio',
  2450, NULL, 4.8, 43,
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80']::text[],
  'Edge-lit ultra-soft LED panel light providing shadow-free lighting for video calls and streaming.', true, 18,
  false, false, false,
  '{"bestFor":["Content Creators","Office Workers"],"budgetTier":"Budget","workspaceStyle":"Professional"}'::jsonb, '{"Brightness":"2800 Lumens Dimmable","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'so-01', 'Northlane Air Quality Monitor', 'CO2, PM2.5, Humidity · OLED Display', 'Smart Office', 'Northlane Studio',
  1950, NULL, 4.8, 39,
  'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80']::text[],
  'Compact desk sensor measuring air purity, CO2 levels, temperature, and ventilation prompts.', true, 21,
  false, false, false,
  '{"bestFor":["Developers","Office Workers","Students"],"budgetTier":"Mid-Range","workspaceStyle":"Minimalist"}'::jsonb, '{"Sensors":"NDIR CO2 Sensor","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'so-02', 'Northlane E-Ink Desk Clock', 'Paper-like E-Ink · Calendar Sync', 'Smart Office', 'Northlane Studio',
  1450, NULL, 4.9, 81,
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80']::text[],
  'Zero-glare E-Ink desktop display showing real-time calendar agenda, weather, and Pomodoro focus timers.', true, 25,
  false, false, false,
  '{"bestFor":["Developers","Designers","Students"],"budgetTier":"Budget","workspaceStyle":"Minimalist","badge":"Staff Pick"}'::jsonb, '{"Screen":"4.2-inch E-Ink","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'so-03', 'Northlane Smart Under-Desk Cable Tray', 'Powder-Coated Steel · Magnetic Clips', 'Smart Office', 'Northlane Studio',
  1250, NULL, 4.9, 145,
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80']::text[],
  'Heavy-duty clamp-on cable management raceway eliminating wire clutter under your workspace.', true, 35,
  false, false, false,
  '{"bestFor":["Developers","Office Workers","Designers"],"budgetTier":"Budget","workspaceStyle":"Professional"}'::jsonb, '{"Length":"60cm High-Capacity Steel Tray","Warranty":"Lifetime Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'pow-01', 'MagSafe 3-in-1 Charging Stand', 'Solid Aluminum & Walnut Base', 'Power', 'Grovemade',
  1850, NULL, 4.9, 140,
  'https://images.unsplash.com/photo-1622445268465-843d63d06283?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1622445268465-843d63d06283?auto=format&fit=crop&w=800&q=80']::text[],
  'Simultaneous 15W fast wireless charging for iPhone, Apple Watch, and AirPods.', true, 30,
  false, false, true,
  '{"bestFor":["Developers","Designers","Students","Office Workers"],"budgetTier":"Budget","workspaceStyle":"Minimalist","badge":"Best Seller"}'::jsonb, '{"Output":"15W MagSafe + 5W Watch + 5W Pods","Warranty":"2-Year Guarantee"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'pow-02', 'Northlane 100W GaN Studio Charger', '4-Port Fast Charge · Compact GaN III', 'Power', 'Northlane Studio',
  1450, NULL, 4.8, 96,
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80']::text[],
  'High-speed 100W GaN desktop power hub charging laptops, tablets, and phones simultaneously.', true, 24,
  false, false, false,
  '{"bestFor":["Developers","Content Creators","Office Workers"],"budgetTier":"Budget","workspaceStyle":"Professional"}'::jsonb, '{"Ports":"3x USB-C PD (100W Max) + 1x USB-A","Warranty":"2-Year Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  'pow-03', 'Northlane Braided Cable Management Hub', 'Silicone Organizers & Magnetic Dock', 'Power', 'Northlane Studio',
  490, NULL, 4.9, 110,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80']::text[],
  'Desktop magnetic cable anchors keeping charging cables securely positioned at your fingertips.', true, 40,
  false, false, false,
  '{"bestFor":["Developers","Designers","Students"],"budgetTier":"Budget","workspaceStyle":"Minimalist","badge":"On Sale"}'::jsonb, '{"Anchors":"5 Magnetic Cable Collars","Warranty":"Lifetime Warranty"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Done! All products have been seeded.
-- You can now view them in the Northlane Console at /admin/products
