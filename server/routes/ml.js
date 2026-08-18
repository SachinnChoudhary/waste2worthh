import { Router } from 'express'
import axios from 'axios'

const router = Router()
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'

// Health proxy
router.get('/health', async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 })
    return res.json({ status: 'ok', python_ml: data })
  } catch (err) {
    return res.json({
      status: 'degraded',
      python_ml: 'offline',
      fallback: 'Rule-based heuristics active',
    })
  }
})

// Auto-classify description
router.post('/classify', async (req, res) => {
  try {
    const { description } = req.body
    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }
    const { data } = await axios.post(`${ML_SERVICE_URL}/api/ml/predict-category`, { description }, { timeout: 4000 })
    return res.json(data)
  } catch (err) {
    // Fallback if ML service unreachable
    const text = (req.body.description || '').toLowerCase()
    let category = 'Metal Scrap'
    if (text.includes('plastic') || text.includes('pet') || text.includes('hdpe')) category = 'Plastic Waste'
    else if (text.includes('chemical') || text.includes('acid') || text.includes('sludge')) category = 'Chemical Residue'
    else if (text.includes('cotton') || text.includes('fabric') || text.includes('yarn')) category = 'Textile Waste'
    else if (text.includes('ash') || text.includes('debris') || text.includes('concrete')) category = 'Construction Debris'
    else if (text.includes('pcb') || text.includes('battery') || text.includes('electronic')) category = 'E-Waste'
    
    return res.json({
      category,
      hazard_level: category === 'Chemical Residue' || category === 'E-Waste' ? 'High' : 'Low',
      confidence: 0.88,
      source: 'heuristic_fallback'
    })
  }
})

// Combined Classify and Value endpoint (Single-call listing assistant)
router.post('/classify-and-value', async (req, res) => {
  try {
    const { description, condition = 'Clean / sorted', quantity_kg = 1000, use_ml_valuation = true } = req.body
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/api/ml/classify-and-value`,
      { description, condition, quantity_kg: Number(quantity_kg), use_ml_valuation },
      { timeout: 4000 }
    )
    return res.json(data)
  } catch (err) {
    const qty = Number(req.body.quantity_kg) || 1000
    return res.json({
      category: 'Plastic Waste',
      hazard_level: 'Low',
      classification_confidence: 0.85,
      estimated_value_usd: Math.round(qty * 0.22),
      disposal_cost_saved_usd: Math.round(qty * 0.06),
      co2_reduction_kg: Math.round(qty * 1.3),
      pricing_model: 'Fallback Rule Engine'
    })
  }
})

// Buyer recommendations
router.post('/recommend-matches', async (req, res) => {
  try {
    const { buyer_interests, top_n = 5 } = req.body
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/api/ml/recommend-buyers`,
      { buyer_interests, top_n },
      { timeout: 4000 }
    )
    return res.json(data)
  } catch (err) {
    return res.json({
      query: req.body.buyer_interests || '',
      count: 0,
      matches: [],
      error: 'Recommendation service temporarily unavailable'
    })
  }
})

export default router
