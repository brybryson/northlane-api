import { CATALOG_PRODUCTS } from '../northlane-ui/src/lib/products.data';
import * as fs from 'fs';

function generate() {
  let sql = `-- ============================================================
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
`;

  for (const p of CATALOG_PRODUCTS) {
    const galleryArr = p.gallery.map(g => `'${g.replace(/'/g, "''")}'`).join(',');
    const attributes = JSON.stringify(p.attributes).replace(/'/g, "''");
    const specs = JSON.stringify(p.specs).replace(/'/g, "''");
    const desc = p.description.replace(/'/g, "''");
    const name = p.name.replace(/'/g, "''");
    const subtitle = p.subtitle.replace(/'/g, "''");
    const brand = p.brand.replace(/'/g, "''");

    sql += `INSERT INTO public.products (
  id, name, subtitle, category, brand, price, original_price, rating, reviews_count,
  image_url, gallery, description, in_stock, stock_count, featured, is_new, is_bestseller, attributes, specs
) VALUES (
  '${p.id}', '${name}', '${subtitle}', '${p.category}', '${brand}',
  ${p.price}, ${p.originalPrice ?? 'NULL'}, ${p.rating}, ${p.reviewsCount},
  '${p.img}', ARRAY[${galleryArr || "''"}]::text[],
  '${desc}', ${p.inStock}, ${p.stockCount},
  ${p.featured ?? false}, ${p.isNew ?? false}, ${p.isBestSeller ?? false},
  '${attributes}'::jsonb, '${specs}'::jsonb
) ON CONFLICT (id) DO NOTHING;
`;
  }

  sql += `
-- Done! All products have been seeded.
-- You can now view them in the Northlane Console at /admin/products
`;

  fs.writeFileSync('seed-products.sql', sql);
  console.log(`SQL file generated with ${CATALOG_PRODUCTS.length} products. Run seed-products.sql in your Supabase SQL Editor.`);
}

generate();
