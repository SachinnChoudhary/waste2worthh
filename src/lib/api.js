/**
 * Waste2Worth Frontend API Client
 * Connects to Node.js Backend Gateway, Supabase Real-time & Python ML Service
 * 
 * All requests include the Clerk session token in the Authorization header
 * when the user is signed in (set via setTokenProvider from auth.jsx).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.DEV ? 'http://localhost:5001' : '')
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000'

// Token provider — set by auth.jsx with Clerk's getToken function
let _getToken = null

/**
 * Called by the auth layer to provide a function that returns the
 * current Clerk session JWT. This avoids a circular dependency
 * between api.js and auth.jsx.
 */
export function setTokenProvider(fn) {
  _getToken = fn
}

/**
 * Wrapper around fetch that automatically attaches the Clerk session
 * token as a Bearer token in the Authorization header.
 */
async function authFetch(url, options = {}) {
  const headers = { ...options.headers }

  if (_getToken) {
    try {
      const token = await _getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    } catch (e) {
      // Token retrieval failed — proceed without auth header
      // (the server will return 401 if the route requires auth)
    }
  }

  return fetch(url, { ...options, headers })
}

// Client-side rule heuristics for robust offline/fallback classification
const CLIENT_HEURISTICS = [
  {
    regex: /\b(hdpe|ldpe|lldpe|pet|pete|polypropylene|pp|pvc|polyethylene|abs|polystyrene|thermocol|eps|polymer|plastic|polythene|acrylic|nylon|regrind|blow mould|plastic bottle|pet bottle|plastic bottles|water bottle)\b/i,
    category: 'Plastic Waste',
    hazard: 'Non-hazardous',
    pricePerKg: 0.28,
    co2Factor: 2.2
  },
  {
    regex: /\b(pcb|printed circuit|motherboard|cpu|ram module|semiconductor|lithium|li-ion|battery|batteries|e-waste|electronic|capacitors?|smps|microchip|circuit board|server board|inverter battery)\b/i,
    category: 'Electronic Waste',
    hazard: 'Moderate',
    pricePerKg: 0.85,
    co2Factor: 4.5
  },
  {
    regex: /\b(acid|solvent|caustic|naoh|hcl|sludge|effluent|etp|coolant|distillation|phosphating|petroleum sludge|spent catalyst|resin waste|chemical|pickle liquor|lubricant|toxic|chemical effluent)\b/i,
    category: 'Chemical Byproducts',
    hazard: 'High',
    pricePerKg: 0.35,
    co2Factor: 1.5
  },
  {
    regex: /\b(tyres?|tires?|rubber|epdm|vulcanized|crumb rubber|butyl|inner tube|gasket|conveyor belt|retread)\b/i,
    category: 'Rubber & Tires',
    hazard: 'Low',
    pricePerKg: 0.22,
    co2Factor: 1.4
  },
  {
    regex: /\b(cardboard|carton|kraft|paper|newsprint|pulp|sawdust|timber|pallets?|plywood|mdf|wood|lumber|shavings|woodchips?|box scrap)\b/i,
    category: 'Wood & Paper',
    hazard: 'Non-hazardous',
    pricePerKg: 0.14,
    co2Factor: 0.9
  },
  {
    regex: /\b(cotton|denim|fabric|yarn|textile|garment|hosiery|viscose|rayon|silk|wool|cloth|selvedge|rags?|apparel scrap)\b/i,
    category: 'Textile Waste',
    hazard: 'Non-hazardous',
    pricePerKg: 0.20,
    co2Factor: 3.8
  },
  {
    regex: /\b(bagasse|husk|food waste|vegetable|fruit pulp|compost|manure|spent grain|crop|paddy|brewery|organic|bio-?waste|peelings?)\b/i,
    category: 'Organic Waste',
    hazard: 'Non-hazardous',
    pricePerKg: 0.05,
    co2Factor: 0.5
  },
  {
    regex: /\b(concrete|brick|mortar|drywall|gypsum|plaster|fly ash|bottom ash|granite|marble|demolition|rubble|asphalt|stone chips|cement|aggregate)\b/i,
    category: 'Construction Debris',
    hazard: 'Low',
    pricePerKg: 0.08,
    co2Factor: 0.45
  },
  {
    regex: /\b(flint glass|borosilicate|windshield|vial|ampoule|bottle glass|glass cullet|cullet|crushed glass|glass shards?|glass scrap|glass bottles?|glass)\b/i,
    category: 'Glass',
    hazard: 'Non-hazardous',
    pricePerKg: 0.10,
    co2Factor: 0.7
  },
  {
    regex: /\b(steel|iron|copper|aluminum|aluminium|brass|bronze|zinc|lead|nickel|titanium|metal|slag|dross|swarf|turnings?|filings?|rebar|tinplate|pipes?|wire scrap|sheet scrap|cables?)\b/i,
    category: 'Metal Scrap',
    hazard: 'Non-hazardous',
    pricePerKg: 0.45,
    co2Factor: 1.8
  }
]

export function evaluateClientFallback(description = '', condition = 'Clean / sorted', quantity_kg = 1000) {
  const normText = description.toLowerCase()
  let matched = null

  for (const rule of CLIENT_HEURISTICS) {
    if (rule.regex.test(normText)) {
      matched = rule
      break
    }
  }

  const category = matched ? matched.category : 'Metal Scrap'
  let hazard_level = matched ? matched.hazard : 'Non-hazardous'
  const basePrice = matched ? matched.pricePerKg : 0.45
  const co2Factor = matched ? matched.co2Factor : 1.8
  const confidence = matched ? 0.92 : 0.60

  if (/\b(toxic|acid|corrosive|flammable|hazard|hazardous|cyanide|cadmium|lead acid)\b/i.test(normText)) {
    hazard_level = 'High'
  }

  const conditionMultiplier = {
    'Clean / sorted': 1.15,
    'Baled': 1.05,
    'Loose': 0.95,
    'Mixed / unsorted': 0.85,
    'Contaminated': 0.55
  }[condition] || 1.0

  const pricePerKg = basePrice * conditionMultiplier

  return {
    category,
    hazard_level,
    classification_confidence: confidence,
    estimated_value_usd: Math.round(quantity_kg * pricePerKg),
    disposal_cost_saved_usd: Math.round(quantity_kg * 0.06),
    co2_reduction_kg: Math.round(quantity_kg * co2Factor * conditionMultiplier),
    pricing_model: 'Heuristic Baseline (Offline Sync)'
  }
}

export const api = {
  // ---- Listings ----
  async getListings(params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await authFetch(`${API_BASE_URL}/api/listings?${query}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('API fetch error for listings:', err)
      return { success: false, listings: [] }
    }
  },

  async getListingById(id) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/listings/${id}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('Failed to fetch listing by ID:', err)
      return { success: false, listing: null }
    }
  },

  async createListing(payload) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.error('Failed to create listing:', err)
      throw err
    }
  },

  // ---- Live AI & ML Service ----
  async classifyAndValue(description, condition = 'Clean / sorted', quantity_kg = 1000) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/ml/classify-and-value`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          condition,
          quantity_kg,
          use_ml_valuation: true
        })
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('ML Assistant service unavailable, executing client heuristics fallback:', err)
      return evaluateClientFallback(description, condition, quantity_kg)
    }
  },

  async getBuyerRecommendations(buyer_interests, top_n = 6) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/ml/recommend-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_interests, top_n })
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('Recommendation call failed:', err)
      return { count: 0, matches: [] }
    }
  },

  // ---- Bids & Offers ----
  async getBids(params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await authFetch(`${API_BASE_URL}/api/bids?${query}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, bids: [] }
    }
  },

  async getBidsForListing(listingId) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bids/listing/${listingId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, bids: [] }
    }
  },

  async placeBid(payload) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.error('Failed to place bid:', err)
      throw err
    }
  },

  async updateBidStatus(bidId, status) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bids/${bidId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.error('Failed to update bid status:', err)
      throw err
    }
  },

  // ---- Dashboard Analytics & Stats ----
  async getOverviewStats() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/stats/overview`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, stats: null }
    }
  },

  async getSellerDashboardData(sellerId = 'a0000000-0000-0000-0000-000000000001') {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/stats/seller/${sellerId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('Failed to load seller dashboard data:', err)
      return { success: false }
    }
  },

  async getBuyerDashboardData(buyerId = 'a0000000-0000-0000-0000-000000000005') {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/stats/buyer/${buyerId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('Failed to load buyer dashboard data:', err)
      return { success: false }
    }
  },

  // ---- User Profiles & Supabase Auth Sync ----
  async syncUser(userProfile) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      })
      return await res.json()
    } catch (err) {
      return { success: false }
    }
  },

  async getUserProfile(clerkUserId) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/users/profile/${clerkUserId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, profile: null }
    }
  },

  // ---- Admin Control Panel Endpoints ----
  async getAdminOverview() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/overview`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false }
    }
  },

  async getAdminSystemHealth() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/system-health`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false }
    }
  },

  async getAdminListings(params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await authFetch(`${API_BASE_URL}/api/admin/listings?${query}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, listings: [] }
    }
  },

  async updateAdminListing(id, updates) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async reEvaluateAdminListing(id) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/listings/${id}/re-evaluate`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async deleteAdminListing(id) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/listings/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async getAdminBids() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/bids`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, bids: [] }
    }
  },

  async updateAdminBid(id, updates) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/bids/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async getAdminUsers() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, users: [] }
    }
  },

  async createAdminUser(userProfile) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async updateAdminUser(id, updates) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  },

  async getAdminAuditLogs() {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/audit-logs`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: true, logs: [] }
    }
  },

  async updateAdminSystemSettings(settings) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/system/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      throw err
    }
  }
}
