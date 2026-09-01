import { Router } from 'express'
import axios from 'axios'

const router = Router()
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'

const SERVER_HEURISTICS = [
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

function evaluateServerFallback(description = '', condition = 'Clean / sorted', quantity_kg = 1000) {
  const normText = description.toLowerCase()
  let matched = null

  for (const rule of SERVER_HEURISTICS) {
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
    pricing_model: 'Heuristic Baseline (Server Fallback)'
  }
}

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
    const fallback = evaluateServerFallback(req.body.description || '')
    return res.json({
      category: fallback.category,
      hazard_level: fallback.hazard_level,
      confidence: fallback.classification_confidence,
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
    const { description = '', condition = 'Clean / sorted', quantity_kg = 1000 } = req.body
    const fallback = evaluateServerFallback(description, condition, Number(quantity_kg))
    return res.json(fallback)
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
