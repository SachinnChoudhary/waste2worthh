import { Router } from 'express'
import axios from 'axios'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'

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

// Fallback buyer recommendation engine using heuristics & available listings
async function getFallbackBuyerRecommendations(buyerInterests = '', topN = 5) {
  const normQuery = (buyerInterests || '').toLowerCase()
  let matchedRule = null
  for (const rule of SERVER_HEURISTICS) {
    if (rule.regex.test(normQuery)) {
      matchedRule = rule
      break
    }
  }
  const detectedCategory = matchedRule ? matchedRule.category : 'Metal Scrap'

  // Extract clean tokens
  const cleanTokens = normQuery
    .replace(/\b(looking for|we need|sourcing|require|seeking|buyer for|want|need|supply of|for recycling|for remelting|for reprocessing|for)\b/gi, '')
    .match(/[a-z0-9_\-\/]{3,}/gi) || []

  // Try querying Supabase live listings first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('listings')
        .select('id, title, category, description, price_inr, quantity')
        .limit(30)
      
      if (data && data.length > 0) {
        const scored = data.map(item => {
          const itemCat = item.category || ''
          const itemText = `${item.title} ${item.description}`.toLowerCase()
          let score = 0.25
          if (itemCat.toLowerCase() === detectedCategory.toLowerCase()) score += 0.50
          for (const token of cleanTokens) {
            if (itemText.includes(token)) score += 0.15
          }
          return {
            listing_id: item.id.substring(0, 8),
            category: item.category,
            description: item.title + (item.description ? ` — ${item.description.substring(0, 75)}...` : ''),
            market_value_usd: Math.round((item.price_inr || 50000) / 83),
            match_score: Math.min(0.98, Math.round(score * 100) / 100)
          }
        })
        scored.sort((a, b) => b.match_score - a.match_score)
        return {
          query: buyerInterests,
          detected_category: detectedCategory,
          count: Math.min(topN, scored.length),
          matches: scored.slice(0, topN),
          source: 'live_supabase_heuristic'
        }
      }
    } catch (e) {
      console.warn('Fallback Supabase listing fetch failed:', e.message)
    }
  }

  // Pre-configured curated catalogue for instant offline responses
  const CATALOG = [
    { listing_id: 'L00492', category: 'Plastic Waste', description: 'Clean HDPE bottle scrap and baled rigid polymers for extrusion', market_value_usd: 322 },
    { listing_id: 'L00523', category: 'Plastic Waste', description: 'Crushed PET bottles and polymer flakes washed ready for spinning', market_value_usd: 410 },
    { listing_id: 'L00491', category: 'Plastic Waste', description: 'HDPE drum regrind granulated 10mm flakes single polymer source', market_value_usd: 280 },
    { listing_id: 'L00003', category: 'Metal Scrap', description: 'Structural steel offcuts, plate cuttings and remelting scrap', market_value_usd: 518 },
    { listing_id: 'L00012', category: 'Metal Scrap', description: 'Heavy copper wire scrap, millberry grade bright busbar cuttings', market_value_usd: 890 },
    { listing_id: 'L00115', category: 'Chemical Byproducts', description: 'Recoverable spent caustic soda NaOH solution 10% concentration', market_value_usd: 340 },
    { listing_id: 'L01462', category: 'Textile Waste', description: 'Clean cotton selvedge and denim cutting waste for fiber spinning', market_value_usd: 195 },
    { listing_id: 'L01938', category: 'Wood & Paper', description: 'Baled corrugated cardboard boxes and clean industrial paper scrap', market_value_usd: 161 },
    { listing_id: 'L00810', category: 'Electronic Waste', description: 'Depopulated PCB boards, server components and copper clad scrap', market_value_usd: 620 }
  ]

  const scored = CATALOG.map(item => {
    let score = 0.20
    if (item.category.toLowerCase() === detectedCategory.toLowerCase()) score += 0.50
    const text = (item.description + ' ' + item.category).toLowerCase()
    for (const token of cleanTokens) {
      if (text.includes(token)) score += 0.15
    }
    return {
      ...item,
      match_score: Math.min(0.98, Math.round(score * 100) / 100)
    }
  })
  scored.sort((a, b) => b.match_score - a.match_score)

  return {
    query: buyerInterests,
    detected_category: detectedCategory,
    count: Math.min(topN, scored.length),
    matches: scored.slice(0, topN),
    source: 'catalog_heuristic'
  }
}

// Buyer recommendations
router.post('/recommend-matches', async (req, res) => {
  const { buyer_interests, top_n = 5 } = req.body
  try {
    const { data } = await axios.post(
      `${ML_SERVICE_URL}/api/ml/recommend-buyers`,
      { buyer_interests, top_n },
      { timeout: 4500 }
    )
    if (data && data.matches && data.matches.length > 0) {
      return res.json(data)
    }
    // Fallback if zero matches returned
    const fallback = await getFallbackBuyerRecommendations(buyer_interests, top_n)
    return res.json(fallback)
  } catch (err) {
    const fallback = await getFallbackBuyerRecommendations(buyer_interests, top_n)
    return res.json(fallback)
  }
})

export default router

