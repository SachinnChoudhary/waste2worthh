import { Router } from 'express'
import { supabase, isSupabaseConfigured, mockDb } from '../config/supabase.js'

const router = Router()

// GET /api/bids - Retrieve all bids or filter by buyer_id or seller_id
router.get('/', async (req, res) => {
  try {
    const { buyer_id, seller_id } = req.query

    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('bids')
          .select('*, profiles:buyer_id (company_name, full_name, email, credit_score, city, phone), listings:listing_id (id, title, category, quantity, unit, price_display, price_inr, seller_id, profiles:seller_id (company_name, city))')
          .order('created_at', { ascending: false })

        if (buyer_id) query = query.eq('buyer_id', buyer_id)

        const { data, error } = await query
        if (!error && data) {
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
      } catch (e) {
        console.warn('⚡ Supabase bids query notice:', e.message)
      }
    }

    return res.json({ success: true, count: mockDb.bids.length, bids: mockDb.bids })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve bids' })
  }
})

// GET /api/bids/listing/:listingId - Retrieve all bids for a specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('bids')
          .select('*, profiles:buyer_id (company_name, verified, credit_score, city)')
          .eq('listing_id', listingId)
          .order('created_at', { ascending: false })
        if (!error && data) {
          const formatted = data.map(b => ({
            ...b,
            buyer_company: b.profiles?.company_name || 'Verified Buyer',
            price_per_unit: `₹${Math.round((b.bid_amount_inr || 0) / (b.bid_quantity || 1)).toLocaleString('en-IN')}/${b.unit || 'tonnes'}`
          }))
          return res.json({ success: true, bids: formatted })
        }
      } catch (e) {
        console.warn('⚡ Supabase bids query notice:', e.message)
      }
    }

    const bids = mockDb.bids.filter(b => String(b.listing_id) === String(listingId))
    return res.json({ success: true, bids })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve bids' })
  }
})

// POST /api/bids - Place a new procurement tender bid
router.post('/', async (req, res) => {
  try {
    const {
      listing_id,
      buyer_id,
      buyer_company = 'Verified Material Buyer',
      bid_amount_inr,
      bid_quantity,
      unit = 'tonnes',
      proposed_logistics = 'buyer_pickup',
      message = '',
    } = req.body

    if (!listing_id || !bid_amount_inr) {
      return res.status(400).json({ error: 'Listing ID and Bid Amount are required' })
    }

    let realBuyerId = buyer_id
    if (isSupabaseConfigured && (!realBuyerId || !realBuyerId.includes('-'))) {
      // Find a valid buyer UUID
      const { data: firstBuyer } = await supabase.from('profiles').select('id').eq('role', 'buyer').limit(1).single()
      if (firstBuyer) realBuyerId = firstBuyer.id
    }

    const insertBid = {
      listing_id,
      buyer_id: realBuyerId || 'a0000000-0000-0000-0000-000000000005',
      bid_amount_inr: Number(bid_amount_inr),
      bid_quantity: Number(bid_quantity) || 1,
      unit,
      proposed_logistics,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('bids').insert([insertBid]).select().single()
        if (!error && data) {
          // Increment listing total_bids count
          const { data: listData } = await supabase.from('listings').select('total_bids, title').eq('id', listing_id).single()
          if (listData) {
            await supabase.from('listings').update({ total_bids: (listData.total_bids || 0) + 1 }).eq('id', listing_id)
            
            // Log audit event
            await supabase.from('admin_audit_logs').insert([{
              action: 'BID_PLACED',
              entity: listData.title || `Listing #${listing_id}`,
              details: `Bid placed of ₹${Number(bid_amount_inr).toLocaleString('en-IN')} by ${buyer_company}`,
              performed_by: buyer_company,
              type: 'bid'
            }]).catch(() => {})
          }

          return res.status(201).json({
            success: true,
            bid: {
              ...data,
              buyer_company,
              price_per_unit: `₹${Math.round(Number(bid_amount_inr) / (Number(bid_quantity) || 1)).toLocaleString('en-IN')}/${unit}`
            }
          })
        }
      } catch (e) {
        console.warn('⚡ Supabase bid insert notice:', e.message)
      }
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      ...insertBid,
      buyer_company,
      price_per_unit: `₹${Math.round(Number(bid_amount_inr) / (Number(bid_quantity) || 1)).toLocaleString('en-IN')}/${unit}`
    }

    mockDb.bids.unshift(newBid)
    return res.status(201).json({ success: true, bid: newBid })
  } catch (err) {
    console.error('Error placing bid:', err)
    return res.status(500).json({ error: 'Failed to place bid' })
  }
})

// PATCH /api/bids/:id/status - Accept or Reject a bid in Supabase
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // 'accepted' | 'rejected' | 'countered'

    if (!['accepted', 'rejected', 'countered', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('bids')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (!error && data) {
          // Log audit action
          await supabase.from('admin_audit_logs').insert([{
            action: status === 'accepted' ? 'BID_ACCEPTED' : 'BID_REJECTED',
            entity: `Bid #${id}`,
            details: `Bid status updated to '${status}'`,
            performed_by: 'Authorized Enterprise Partner',
            type: 'bid'
          }]).catch(() => {})

          return res.json({ success: true, bid: data })
        }
      } catch (e) {
        console.warn('⚡ Supabase bid status notice:', e.message)
      }
    }

    const bid = mockDb.bids.find(b => String(b.id) === String(id))
    if (!bid) return res.status(404).json({ error: 'Bid not found' })

    bid.status = status
    return res.json({ success: true, bid })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update bid status' })
  }
})

export default router
