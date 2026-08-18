/**
 * Waste2Worth Frontend API Client
 * Connects to Node.js Backend Gateway & Python ML Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000'

export const api = {
  // ---- Listings ----
  async getListings(params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`${API_BASE_URL}/api/listings?${query}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('API fetch fallback to local data:', err)
      return { success: false, listings: [] }
    }
  },

  async getListingById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${id}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('Failed to fetch listing:', err)
      return { success: false, listing: null }
    }
  },

  async createListing(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/listings`, {
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
      // Direct call to Python ML or via Node.js proxy
      const res = await fetch(`${API_BASE_URL}/api/ml/classify-and-value`, {
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
      console.warn('ML Assistant call failed, using heuristic:', err)
      return {
        category: 'Metal Scrap',
        hazard_level: 'Low',
        classification_confidence: 0.85,
        estimated_value_usd: Math.round(quantity_kg * 0.35),
        disposal_cost_saved_usd: Math.round(quantity_kg * 0.06),
        co2_reduction_kg: Math.round(quantity_kg * 1.8),
        pricing_model: 'Local Heuristics'
      }
    }
  },

  async getBuyerRecommendations(buyer_interests, top_n = 6) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ml/recommend-matches`, {
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
  async getBidsForListing(listingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bids/listing/${listingId}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, bids: [] }
    }
  },

  async placeBid(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bids`, {
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

  // ---- Stats & Users ----
  async getOverviewStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/overview`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch (err) {
      return { success: false, stats: null }
    }
  },

  async syncUser(userProfile) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      })
      return await res.json()
    } catch (err) {
      return { success: false }
    }
  }
}
