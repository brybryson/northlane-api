import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "northlane-api/.env") });

export interface CatalogProduct {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  img: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
  specs: Record<string, string>;
}

// Replica of key products for the backend concierge search fallback
export const BACKEND_PRODUCTS: CatalogProduct[] = [
  {
    id: "kb-01",
    name: "Aster 65 Mechanical Keyboard",
    subtitle: "Silent tactile · Solid Walnut Base",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 4850,
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    description: "Crafted with double-damped hot-swappable tactile switches, CNC solid walnut base, and gasket-mount architecture for whisper-quiet typing.",
    inStock: true,
    featured: true,
    specs: {
      Layout: "65% Compact (68 Keys)",
      Switches: "Custom Northlane Quiet Tactile",
      Connectivity: "Bluetooth 5.3 + 2.4GHz + USB-C",
      Materials: "Solid Walnut & Anodized Plate"
    }
  },
  {
    id: "kb-02",
    name: "Northlane Flow 75 Pro Keyboard",
    subtitle: "Low-profile Linear · CNC Aluminum",
    category: "Keyboards",
    brand: "Northlane Studio",
    price: 5450,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-slim 75% layout with per-key RGB backlight, hot-swappable low-profile switches, and QMK/VIA key mapping support.",
    inStock: true,
    featured: true,
    specs: {
      Layout: "75% Exploded Layout",
      Switches: "Low-Profile Red Linear",
      Connectivity: "Wireless 2.4Ghz & Type-C"
    }
  },
  {
    id: "m-01",
    name: "Nordic Wireless Precision Mouse",
    subtitle: "Ergonomic · Matte Graphite",
    category: "Mouse",
    brand: "Northlane Studio",
    price: 2950,
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    description: "Designed for precise natural hand orientation. 8,000 DPI glass tracking sensor with whisper-silent magnetic scroll wheel.",
    inStock: true,
    specs: {
      Sensor: "Darkfield 8000 DPI Optical",
      Clicks: "Silent Tactile Microswitches"
    }
  },
  {
    id: "au-01",
    name: "Halo Studio ANC Headphones",
    subtitle: "Active Noise Cancelling · Memory Foam",
    category: "Audio",
    brand: "Bang & Olufsen",
    price: 5950,
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description: "Acoustic spatial audio drivers with adaptive noise isolation. Ultra-soft lambskin memory foam ear cushions.",
    inStock: true,
    featured: true,
    specs: {
      Drivers: "40mm Custom Titanium",
      ANC: "Hybrid 4-Mic Active Noise Cancellation"
    }
  },
  {
    id: "au-02",
    name: "Northlane Studio Reference Speakers",
    subtitle: "Scandinavian Birch · 100W RMS",
    category: "Audio",
    brand: "Sonos",
    price: 6850,
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    description: "Compact near-field studio monitors with woven kevlar woofers and silk dome tweeters for pristine acoustic clarity.",
    inStock: true,
    featured: true,
    specs: {
      Power: "100W Peak RMS",
      Warranty: "2-Year Warranty"
    }
  },
  {
    id: "desk-01",
    name: "Northlane Lift Standing Desk",
    subtitle: "Solid American Walnut · Dual Motor",
    category: "Desks",
    brand: "Northlane Studio",
    price: 7450,
    rating: 5.0,
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted solid walnut desktop paired with whisper-quiet dual electric motors and 4 memory height presets.",
    inStock: true,
    featured: true,
    specs: {
      Top: "Solid American Walnut",
      Motors: "Dual Silent Electric"
    }
  },
  {
    id: "chair-01",
    name: "Northlane Ergo Executive Chair",
    subtitle: "Breathable Mesh · 4D Armrests",
    category: "Seating",
    brand: "Herman Miller",
    price: 6850,
    rating: 4.9,
    img: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80",
    description: "Advanced lumbar suspension chair engineered for posture alignment and 12-hour comfortable seating.",
    inStock: true,
    featured: true,
    specs: {
      Lumbar: "Dynamic PostureFit",
      Warranty: "12-Year Studio Warranty"
    }
  }
];

/**
 * Fetches products from live Headless WooCommerce REST API if configured
 */
export async function fetchLiveWooCommerceProducts(): Promise<CatalogProduct[] | null> {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !key || !secret) {
    return null; // Fallback to local catalog replica
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
    const response = await fetch(`${url}/wp-json/wc/v3/products?per_page=50`, {
      headers: { Authorization: authHeader },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      subtitle: item.short_description ? item.short_description.replace(/<[^>]*>?/gm, "") : "Studio Workspace Essential",
      category: item.categories?.[0]?.name || "Workspace",
      brand: "Northlane Studio",
      price: parseFloat(item.price || "0"),
      rating: parseFloat(item.average_rating || "4.8"),
      img: item.images?.[0]?.src || BACKEND_PRODUCTS[0].img,
      description: item.description ? item.description.replace(/<[^>]*>?/gm, "") : "",
      inStock: item.stock_status === "instock",
      featured: item.featured || false,
      specs: { SKU: item.sku || `SKU-${item.id}` },
    }));
  } catch (err) {
    console.error("[WooCommerce REST API Sync Error]:", err);
    return null;
  }
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  const liveWooProducts = await fetchLiveWooCommerceProducts();
  const productSource = liveWooProducts || BACKEND_PRODUCTS;

  const stopWords = new Set(["i", "need", "a", "to", "for", "the", "in", "under", "want", "find", "me", "show", "is", "of", "what", "are", "do", "you", "carry"]);
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  if (words.length === 0) return [];

  return productSource.filter(p => {
    return words.some(word => 
      p.name.toLowerCase().includes(word) ||
      p.category.toLowerCase().includes(word) ||
      p.brand.toLowerCase().includes(word) ||
      p.description.toLowerCase().includes(word)
    );
  });
}

export async function getProductById(id: string): Promise<CatalogProduct | null> {
  const live = await fetchLiveWooCommerceProducts();
  const source = live || BACKEND_PRODUCTS;
  return source.find(p => p.id === id) || null;
}

export async function getProductsByCategory(category: string): Promise<CatalogProduct[]> {
  const live = await fetchLiveWooCommerceProducts();
  const source = live || BACKEND_PRODUCTS;
  const lower = category.toLowerCase();
  return source.filter(p => p.category.toLowerCase() === lower);
}

export async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  const live = await fetchLiveWooCommerceProducts();
  const source = live || BACKEND_PRODUCTS;
  return source.filter(p => p.featured);
}

export async function getProductSpecifications(id: string): Promise<Record<string, string>> {
  const product = await getProductById(id);
  return product ? product.specs : {};
}
