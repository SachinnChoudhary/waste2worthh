import { Router } from 'express'
import { supabase, isSupabaseConfigured, mockDb } from '../config/supabase.js'

const router = Router()

// GET /api/bids/listing/:listingId - Retrieve all bids for a listing
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
        if (!error && data) return res.json({ success: true, bids: data })
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

// POST /api/bids - Place a new procurement bid
router.post('/', async (req, res) => {
  try {
    const {
      listing_id,
      buyer_id = 'a0000000-0000-0000-0000-000000000005',
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

    const newBid = {
      id: `bid-${Date.now()}`,
      listing_id,
      buyer_id,
      buyer_company,
      bid_amount_inr: Number(bid_amount_inr),
      bid_quantity: Number(bid_quantity) || 1,
      unit,
      price_per_unit: `₹${Math.round(Number(bid_amount_inr) / (Number(bid_quantity) || 1)).toLocaleString('en-IN')}/${unit}`,
      proposed_logistics,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('bids').insert([{ ...newBid, id: undefined }]).select().single()
        if (!error && data) {
          // Increment listing total_bids
          await supabase.rpc('increment_listing_bids', { x: 1, row_id: listing_id }).catch(() => {})
          return res.status(201).json({ success: true, bid: data })
        }
      } catch (e) {
        console.warn('⚡ Supabase bid insert notice:', e.message)
      }
    }

    mockDb.bids.unshift(newBid)
    
    // Update listing bid count in mock DB
    const targetListing = mockDb.listings.find(l => String(l.id) === String(listing_id))
    if (targetListing) {
      targetListing.bids = (targetListing.bids || 0) + 1
    }

    return res.status(201).json({ success: true, bid: newBid })
  } catch (err) {
    console.error('Error placing bid:', err)
    return res.status(500).json({ error: 'Failed to place bid' })
  }
})

// PATCH /api/bids/:id/status - Accept or Reject a bid
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // 'accepted' | 'rejected'

    if (!['accepted', 'rejected', 'countered'].includes(status)) {
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
        if (!error && data) return res.json({ success: true, bid: data })
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
