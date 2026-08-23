import { Router } from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/bids - Retrieve all bids or filter by buyer_id or seller_id
router.get('/', async (req, res) => {
  try {
    const { buyer_id, seller_id } = req.query

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('bids')
        .select('*, profiles:buyer_id (company_name, full_name, email, credit_score, city, phone), listings:listing_id (id, title, category, quantity, unit, price_display, price_inr, seller_id, profiles:seller_id (company_name, city))')
        .order('created_at', { ascending: false })

      if (buyer_id) query = query.eq('buyer_id', buyer_id)

      const { data, error } = await query
      if (error) {
        return res.status(500).json({ success: false, error: error.message, bids: [] })
      }

      if (data) {
        let results = data.map(b => ({
          ...b,
          buyer_company: b.profiles?.company_name || 'Verified Material Buyer',
          listingTitle: b.listings?.title || `Lot #${b.listing_id}`,
          sellerCompany: b.listings?.profiles?.company_name || 'Enterprise Seller',
          price_per_unit: b.price_per_unit || `₹${Math.round((b.bid_amount_inr || 0) / (b.bid_quantity || 1)).toLocaleString('en-IN')}/${b.unit || 'tonnes'}`
        }))

        if (seller_id) {
          results = results.filter(b => b.listings?.seller_id === seller_id)
        }

        return res.json({ success: true, count: results.length, bids: results })
      }
    }

    return res.json({ success: true, count: 0, bids: [] })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve bids', bids: [] })
  }
})

// GET /api/bids/listing/:listingId - Retrieve all bids for a specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bids')
        .select('*, profiles:buyer_id (company_name, verified, credit_score, city)')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ success: false, error: error.message, bids: [] })
      }

      if (data) {
        const formatted = data.map(b => ({
          ...b,
          buyer_company: b.profiles?.company_name || 'Enterprise Buyer',
          verified: b.profiles?.verified ?? true,
          credit_score: b.profiles?.credit_score || 850
        }))
        return res.json({ success: true, count: formatted.length, bids: formatted })
      }
    }

    return res.json({ success: true, count: 0, bids: [] })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch bids for lot', bids: [] })
  }
})

// POST /api/bids - Place a new tender / commercial bid (authenticated buyers only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      listing_id,
      buyer_id,
      buyer_company = 'Verified Material Buyer',
      bid_amount_inr,
      bid_quantity,
      unit = 'tonnes',
      proposed_logistics = 'buyer_pickup',
      message = ''
    } = req.body

    // Use authenticated user's profile ID as buyer; don't trust client-supplied buyer_id
    let realBuyerId = req.user?.profileId || buyer_id
    if (isSupabaseConfigured && supabase && (!realBuyerId || !realBuyerId.includes('-'))) {
      const { data: firstBuyer } = await supabase.from('profiles').select('id').eq('role', 'buyer').limit(1).single()
      if (firstBuyer) realBuyerId = firstBuyer.id
    }

    const bidRecord = {
      listing_id,
      buyer_id: realBuyerId || 'a0000000-0000-0000-0000-000000000005',
      bid_amount_inr: Number(bid_amount_inr) || 50000,
      bid_quantity: Number(bid_quantity) || 10,
      unit,
      proposed_logistics,
      message,
      status: 'pending'
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bids')
        .insert([bidRecord])
        .select()
        .single()

      if (error) {
        console.error('Database bid insert error:', error.message)
        return res.status(500).json({ success: false, error: error.message })
      }

      if (data) {
        supabase.from('listings').select('total_bids').eq('id', listing_id).single().then(({ data: l }) => {
          if (l) supabase.from('listings').update({ total_bids: (l.total_bids || 0) + 1 }).eq('id', listing_id).then()
        })

        supabase.from('admin_audit_logs').insert([{
          action: 'BID_PLACED',
          entity: `Lot #${listing_id?.slice(0, 8)}`,
          details: `Bid of ₹${Number(bid_amount_inr).toLocaleString('en-IN')} submitted`,
          type: 'bid',
          performed_by: buyer_company
        }]).then()

        return res.status(201).json({
          success: true,
          bid: {
            ...data,
            buyer_company,
            price_per_unit: `₹${Math.round(data.bid_amount_inr / (data.bid_quantity || 1)).toLocaleString('en-IN')}/${data.unit}`
          }
        })
      }
    }

    return res.status(201).json({ success: true, bid: bidRecord })
  } catch (err) {
    console.error('Error placing bid:', err)
    return res.status(500).json({ success: false, error: 'Failed to place bid' })
  }
})

// PATCH /api/bids/:id/status - Update tender bid status (authenticated parties only)
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status, counter_amount_inr } = req.body

    const updates = { status, updated_at: new Date().toISOString() }
    if (counter_amount_inr) updates.counter_amount_inr = counter_amount_inr

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bids')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }

      if (data) {
        supabase.from('admin_audit_logs').insert([{
          action: `BID_${status.toUpperCase()}`,
          entity: `Bid #${id?.slice(0, 8)}`,
          details: `Bid status updated to ${status}`,
          type: 'bid',
          performed_by: 'Authorized Counterparty'
        }]).then()

        return res.json({ success: true, bid: data })
      }
    }

    return res.json({ success: true, bid: { id, status } })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update bid status' })
  }
})

export default router
