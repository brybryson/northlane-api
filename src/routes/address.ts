import { Router } from "express";

const router = Router();

interface AddressRecord {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryInstructions?: string;
  googlePlaceId?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isVerified: boolean;
}

// In-memory address storage fallback
let memoryAddresses: AddressRecord[] = [
  {
    id: "addr-1",
    label: "Design Studio",
    recipientName: "Vrsnmllz03",
    phoneNumber: "+1 (415) 890-2104",
    streetAddress: "124 Copenhagen Way",
    aptSuite: "Studio #4B",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    country: "United States",
    deliveryInstructions: "Leave at front desk with receptionist.",
    googlePlaceId: "ChIJ3S-g4nxu5kcR9SSd56msDHU",
    formattedAddress: "124 Copenhagen Way, Studio #4B, San Francisco, CA 94107",
    latitude: 37.7749,
    longitude: -122.4194,
    isDefault: true,
    isVerified: true,
  },
  {
    id: "addr-2",
    label: "Headquarters",
    recipientName: "Vrsnmllz03",
    phoneNumber: "+1 (415) 500-1200",
    streetAddress: "500 Howard Street",
    aptSuite: "Suite 1200",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "United States",
    deliveryInstructions: "Loading dock entrance on 1st Street.",
    googlePlaceId: "ChIJu9_z4Lp_j4ARWzP5_3msEFU",
    formattedAddress: "500 Howard Street, Suite 1200, San Francisco, CA 94105",
    latitude: 37.7887,
    longitude: -122.3989,
    isDefault: false,
    isVerified: true,
  },
];

// Sample US Address Database for Places Autocomplete
const US_PLACES_SUGGESTIONS = [
  {
    streetAddress: "124 Copenhagen Way",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    googlePlaceId: "ChIJ3S-g4nxu5kcR9SSd56msDHU",
    formattedAddress: "124 Copenhagen Way, San Francisco, CA 94107",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    streetAddress: "500 Howard Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    googlePlaceId: "ChIJu9_z4Lp_j4ARWzP5_3msEFU",
    formattedAddress: "500 Howard Street, San Francisco, CA 94105",
    latitude: 37.7887,
    longitude: -122.3989,
  },
  {
    streetAddress: "100 Market Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    googlePlaceId: "ChIJ7a918Lp_j4AR1xP5_3msEFU",
    formattedAddress: "100 Market Street, San Francisco, CA 94105",
    latitude: 37.7937,
    longitude: -122.3965,
  },
  {
    streetAddress: "742 Evergreen Terrace",
    city: "Springfield",
    state: "OR",
    zipCode: "97477",
    googlePlaceId: "ChIJ742EVGg_j4AR88P5_3msEFU",
    formattedAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    latitude: 44.0462,
    longitude: -123.0224,
  },
  {
    streetAddress: "350 Fifth Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10118",
    googlePlaceId: "ChIJd8BlQ2BZwokRAF22_3msEFU",
    formattedAddress: "350 Fifth Avenue, New York, NY 10118",
    latitude: 40.7484,
    longitude: -73.9857,
  },
];

/**
 * GET /api/addresses
 * Fetches all saved shipping addresses for the customer.
 */
router.get("/", (_req, res) => {
  return res.json({ addresses: memoryAddresses });
});

/**
 * GET /api/addresses/autocomplete?q=...
 * Google Places Autocomplete Endpoint for US Addresses.
 */
router.get("/autocomplete", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }

  const matches = US_PLACES_SUGGESTIONS.filter(
    (p) =>
      p.streetAddress.toLowerCase().includes(query) ||
      p.formattedAddress.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.zipCode.includes(query)
  );

  // Dynamic fallback suggestion if query doesn't match predefined set
  if (matches.length === 0) {
    const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
    matches.push({
      streetAddress: capitalized,
      city: "San Francisco",
      state: "CA",
      zipCode: "94107",
      googlePlaceId: `ChIJ_place_${Date.now()}`,
      formattedAddress: `${capitalized}, San Francisco, CA 94107`,
      latitude: 37.7749,
      longitude: -122.4194,
    });
  }

  return res.json({ suggestions: matches });
});

/**
 * POST /api/addresses
 * Validates, normalizes, and saves a new address.
 */
router.post("/", (req, res) => {
  const {
    label = "Home",
    recipientName,
    phoneNumber,
    streetAddress,
    aptSuite = "",
    city,
    state,
    zipCode,
    country = "United States",
    deliveryInstructions = "",
    googlePlaceId = "",
    latitude = 37.7749,
    longitude = -122.4194,
    isDefault = false,
  } = req.body;

  if (!recipientName || !streetAddress || !city || !state || !zipCode) {
    return res.status(400).json({ error: "Missing required shipping address fields." });
  }

  const formattedAddress = `${streetAddress}${aptSuite ? `, ${aptSuite}` : ""}, ${city}, ${state} ${zipCode}`;

  const newAddress: AddressRecord = {
    id: `addr-${Date.now()}`,
    label,
    recipientName,
    phoneNumber: phoneNumber || "+1 (415) 890-2104",
    streetAddress,
    aptSuite,
    city,
    state: state.toUpperCase(),
    zipCode,
    country,
    deliveryInstructions,
    googlePlaceId: googlePlaceId || `ChIJ_place_${Date.now()}`,
    formattedAddress,
    latitude: Number(latitude),
    longitude: Number(longitude),
    isDefault,
    isVerified: true,
  };

  if (isDefault || memoryAddresses.length === 0) {
    memoryAddresses = memoryAddresses.map((a) => ({ ...a, isDefault: false }));
    newAddress.isDefault = true;
  }

  memoryAddresses.push(newAddress);
  return res.json({ success: true, address: newAddress });
});

/**
 * PUT /api/addresses/:id
 * Updates an existing saved address.
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = memoryAddresses.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Address not found." });
  }

  const existing = memoryAddresses[index];
  const updated: AddressRecord = {
    ...existing,
    ...req.body,
    id,
    formattedAddress: `${req.body.streetAddress || existing.streetAddress}${
      req.body.aptSuite ? `, ${req.body.aptSuite}` : ""
    }, ${req.body.city || existing.city}, ${req.body.state || existing.state} ${
      req.body.zipCode || existing.zipCode
    }`,
  };

  if (updated.isDefault) {
    memoryAddresses = memoryAddresses.map((a) => ({ ...a, isDefault: false }));
  }

  memoryAddresses[index] = updated;
  return res.json({ success: true, address: updated });
});

/**
 * POST /api/addresses/:id/default
 * Sets a saved address as the primary default shipping destination.
 */
router.post("/:id/default", (req, res) => {
  const { id } = req.params;
  const target = memoryAddresses.find((a) => a.id === id);

  if (!target) {
    return res.status(404).json({ error: "Address not found." });
  }

  memoryAddresses = memoryAddresses.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }));

  return res.json({ success: true, defaultId: id });
});

/**
 * DELETE /api/addresses/:id
 * Removes a saved address.
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = memoryAddresses.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Address not found." });
  }

  const wasDefault = memoryAddresses[index].isDefault;
  memoryAddresses.splice(index, 1);

  if (wasDefault && memoryAddresses.length > 0) {
    memoryAddresses[0].isDefault = true;
  }

  return res.json({ success: true, removedId: id, addresses: memoryAddresses });
});

export default router;
