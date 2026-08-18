import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

let rawSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
if (rawSupabaseUrl && rawSupabaseUrl.startsWith('postgresql://')) {
  const match = rawSupabaseUrl.match(/@db\.([a-zA-Z0-9_-]+)\.supabase\.co/)
  if (match) {
    rawSupabaseUrl = `https://${match[1]}.supabase.co`
  }
}
const supabaseUrl = rawSupabaseUrl
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (isSupabaseConfigured) {
  console.log('⚡ Connected to remote Supabase database instance:', supabaseUrl)
} else {
  console.log('ℹ️ Running with local fallback data store (Set SUPABASE_URL and SUPABASE_ANON_KEY to link live instance).')
}

// Initial mock database store for seamless development
export const mockDb = {
  profiles: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      clerk_user_id: 'user_tatasteel_01',
      email: 'procurement@tatasteel.com',
      full_name: 'Rajesh Sharma',
      company_name: 'Tata Steel Ltd.',
      role: 'seller',
      gstin: '20AAACT2727Q1ZU',
      phone: '+91 657 664 1234',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      verified: true,
      credit_score: 890,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      clerk_user_id: 'user_reliance_02',
      email: 'circular@ril.com',
      full_name: 'Ananya Mehta',
      company_name: 'Reliance Petrochemicals',
      role: 'seller',
      gstin: '24AAACR5055K1ZI',
      phone: '+91 265 669 8800',
      city: 'Vadodara',
      state: 'Gujarat',
      verified: true,
      credit_score: 920,
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000005',
      clerk_user_id: 'user_ultratech_05',
      email: 'sourcing@ultratechcement.com',
      full_name: 'Karan Verma',
      company_name: 'UltraTech Cement Ltd.',
      role: 'buyer',
      gstin: '27AAACU1234L1ZX',
      phone: '+91 22 6691 7800',
      city: 'Mumbai',
      state: 'Maharashtra',
      verified: true,
      credit_score: 910,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],

  listings: [
    {
      id: '1',
      seller_id: 'a0000000-0000-0000-0000-000000000001',
      company: 'Tata Steel Ltd.',
      title: 'Steel Mill Slag — Grade A Silicate',
      category: 'Metal Scrap',
      hazard: 'Non-hazardous',
      condition: 'Unprocessed',
      quantity: '450 tonnes',
      quantity_kg: 450000,
      price: '₹8,200/tonne',
      price_inr: 3690000,
      location: 'Jamshedpur, Jharkhand',
      description: 'High-calcium steel slag from blast furnace operations. Ideal for cement manufacturing, road construction aggregate, or soil conditioning. Consistent chemical composition with monthly test reports available. Regular supply of 200+ tonnes/month guaranteed.',
      aiClassification: 'Calcium Silicate Slag (Blast Furnace)',
      aiValuation: '₹7,800 – ₹9,100/tonne',
      aiConfidence: 96,
      estimated_value_usd: 181125,
      disposal_cost_saved_usd: 27000,
      co2Saved: '1,240 kg CO₂e per tonne reused',
      co2_reduction_kg: 931500,
      status: 'active',
      postedAt: '2 days ago',
      bids: 7,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2',
      seller_id: 'a0000000-0000-0000-0000-000000000002',
      company: 'Reliance Petrochemicals',
      title: 'HDPE Drum Regrind — Clean, Single-Source',
      category: 'Plastic Waste',
      hazard: 'Non-hazardous',
      condition: 'Ground / Shredded',
      quantity: '12 tonnes',
      quantity_kg: 12000,
      price: '₹42,000/tonne',
      price_inr: 504000,
      location: 'Vadodara, Gujarat',
      description: 'Clean HDPE regrind from food-grade chemical drums. Single polymer source — no mixed plastics. Washed and granulated to 8-12mm flake. Melt flow index: 7.5 g/10min. Perfect for pipe extrusion or blow molding.',
      aiClassification: 'High-Density Polyethylene (HDPE, Resin Code 2)',
      aiValuation: '₹38,000 – ₹45,000/tonne',
      aiConfidence: 98,
      estimated_value_usd: 2760,
      disposal_cost_saved_usd: 720,
      co2Saved: '3,100 kg CO₂e per tonne recycled',
      co2_reduction_kg: 16560,
      status: 'active',
      postedAt: '5 hours ago',
      bids: 3,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: '3',
      seller_id: 'a0000000-0000-0000-0000-000000000001',
      company: 'IOCL Refinery',
      title: 'Spent Caustic Soda — Recoverable NaOH',
      category: 'Chemical Residue',
      hazard: 'Moderate',
      condition: 'Liquid — tanker pickup',
      quantity: '80 KL',
      quantity_kg: 80000,
      price: '₹6,500/KL',
      price_inr: 520000,
      location: 'Mathura, Uttar Pradesh',
      description: 'Spent caustic from crude desulfurization. NaOH concentration 8-12%. Contains mercaptides and sulfides. Suitable for caustic recovery units or wastewater neutralization. MSDS and transport documentation provided.',
      aiClassification: 'Spent Caustic — Sulfidic (EPA K062 equivalent)',
      aiValuation: '₹5,200 – ₹7,800/KL',
      aiConfidence: 89,
      estimated_value_usd: 17600,
      disposal_cost_saved_usd: 4800,
      co2Saved: '890 kg CO₂e per KL recovered',
      co2_reduction_kg: 92400,
      status: 'active',
      postedAt: '1 day ago',
      bids: 2,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      seller_id: 'a0000000-0000-0000-0000-000000000001',
      company: 'Arvind Mills',
      title: 'Cotton Selvedge & Cutting Waste',
      category: 'Textile Waste',
      hazard: 'Non-hazardous',
      condition: 'Baled',
      quantity: '6 tonnes/month',
      quantity_kg: 6000,
      price: '₹15,000/tonne',
      price_inr: 90000,
      location: 'Ahmedabad, Gujarat',
      description: 'Clean cotton selvedge waste from denim weaving. 100% cotton, undyed edges and cutting room scraps. Baled in 200kg blocks. Consistent quality — same mill, same raw material. Ideal for recycled yarn spinning or industrial wiping cloth.',
      aiClassification: 'Post-industrial Cotton Fiber Waste',
      aiValuation: '₹12,000 – ₹18,000/tonne',
      aiConfidence: 95,
      estimated_value_usd: 945,
      disposal_cost_saved_usd: 360,
      co2Saved: '5,200 kg CO₂e per tonne reused',
      co2_reduction_kg: 5670,
      status: 'active',
      postedAt: '3 days ago',
      bids: 11,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ],

  bids: [
    {
      id: 'bid-1',
      listing_id: '1',
      buyer_id: 'a0000000-0000-0000-0000-000000000005',
      buyer_company: 'UltraTech Cement Ltd.',
      bid_amount_inr: 3780000,
      bid_quantity: 450,
      unit: 'tonnes',
      price_per_unit: '₹8,400/tonne',
      proposed_logistics: 'seller_delivery',
      message: 'Offer ₹8,400/tonne for the full 450 tonnes lot. Delivery to our Durgapur grinding plant.',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],

  buyerPreferences: {
    'user_default_buyer': {
      material_keywords: 'we need steel offcuts and scrap metal sheets for remelting',
      target_categories: ['Metal Scrap', 'Plastic Waste'],
      min_quantity_kg: 500
    }
  }
}
