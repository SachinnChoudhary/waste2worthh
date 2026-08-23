import { Router } from 'express'
import { supabase, isSupabaseConfigured } from '../config/supabase.js'

const router = Router()

// GET /api/stats/overview - Overall marketplace statistics from database
router.get('/overview', async (req, res) => {
  try {
    if (isSupabaseConfigured && supabase) {
      const [listingsRes, bidsRes, profilesRes] = await Promise.all([
        supabase.from('listings').select('id, quantity_kg, price_inr, co2_reduction_kg, status'),
        supabase.from('bids').select('id, bid_amount_inr, status'),
        supabase.from('profiles').select('id, verified')
      ])

      const listings = listingsRes.data || []
      const bids = bidsRes.data || []
      const profiles = profilesRes.data || []

      const activeListings = listings.filter(l => l.status === 'active').length
      const totalBids = bids.length
      const totalKg = listings.reduce((sum, l) => sum + (Number(l.quantity_kg) || 0), 0)
      const totalCo2Kg = listings.reduce((sum, l) => sum + (Number(l.co2_reduction_kg) || 0), 0)
      const totalGmv = listings.reduce((sum, l) => sum + (Number(l.price_inr) || 0), 0)

      const divertedLandfillTonnes = (totalKg / 1000).toFixed(1)
      const co2SavedTonnes = (totalCo2Kg / 1000).toFixed(1)

      return res.json({
        success: true,
        stats: {
          activeListings: activeListings || listings.length,
          totalListings: listings.length,
          totalBids,
          co2SavedTonnes: Number(co2SavedTonnes) || 0,
          divertedLandfillTonnes: Number(divertedLandfillTonnes) || 0,
          totalRevenueInr: `₹${(totalGmv || 0).toLocaleString('en-IN')}`,
          conversionRate: `${totalBids > 0 ? Math.min(100, Math.round((bids.filter(b => b.status === 'accepted').length / totalBids) * 100)) : 0}%`,
          verifiedProfiles: profiles.filter(p => p.verified).length,
        }
      })
    }

    return res.json({
      success: true,
      stats: {
        activeListings: 0,
        totalBids: 0,
        co2SavedTonnes: 0,
        divertedLandfillTonnes: 0,
        totalRevenueInr: '₹0',
        conversionRate: '0%',
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to compute stats' })
  }
})

// GET /api/stats/seller/:sellerId - Specific seller metrics computed from database
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params

    if (isSupabaseConfigured && supabase) {
      let sellerUuid = sellerId
      if (!sellerId.includes('-')) {
        const { data: prof } = await supabase.from('profiles').select('id').or(`clerk_user_id.eq.${sellerId},email.eq.${sellerId}`).single()
        if (prof) sellerUuid = prof.id
      }

      // Fetch seller listings
      let query = supabase.from('listings').select('*').order('created_at', { ascending: false })
      if (sellerUuid && sellerUuid.includes('-') && sellerUuid !== 'a0000000-0000-0000-0000-000000000001') {
        query = query.eq('seller_id', sellerUuid)
      }
      const { data: sellerListings } = await query

      const listings = sellerListings || []
      const listingIds = listings.map(l => l.id)

      // Fetch bids received on seller listings
      let sellerBids = []
      if (listingIds.length > 0) {
        const { data: bids } = await supabase
          .from('bids')
          .select('*, profiles:buyer_id (company_name, full_name, city)')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false })
        sellerBids = bids || []
      }

      const { data: logsData } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      const activeListings = listings.filter(l => l.status === 'active').length
      const totalBids = sellerBids.length
      const totalKg = listings.reduce((sum, l) => sum + (Number(l.quantity_kg) || 0), 0)
      const totalCo2Kg = listings.reduce((sum, l) => sum + (Number(l.co2_reduction_kg) || 0), 0)
      const totalRev = listings.reduce((sum, l) => sum + (Number(l.price_inr) || 0), 0)

      const formattedListings = listings.map(l => ({
        ...l,
        company: 'Enterprise Seller',
        price: l.price_display || (l.price_inr ? `₹${Number(l.price_inr).toLocaleString('en-IN')}` : '₹0'),
        quantity: `${l.quantity} ${l.unit || 'tonnes'}`,
        bids: l.total_bids || 0,
        aiConfidence: Math.round((Number(l.ai_confidence) || 0.95) * 100),
        co2Saved: l.co2_reduction_kg ? `${(Number(l.co2_reduction_kg) / 1000).toFixed(1)} tonnes` : '0 tonnes'
      }))

      const formattedBids = sellerBids.map(b => ({
        ...b,
        buyer_company: b.profiles?.company_name || 'Enterprise Buyer',
        buyer_name: b.profiles?.full_name || 'Procurement Lead',
        amount_display: `₹${Number(b.bid_amount_inr).toLocaleString('en-IN')}`,
        price_per_unit: b.bid_quantity ? `₹${Math.round(b.bid_amount_inr / b.bid_quantity).toLocaleString('en-IN')}/${b.unit || 'tonnes'}` : `₹${Number(b.bid_amount_inr).toLocaleString('en-IN')}`
      }))

      return res.json({
        success: true,
        sellerStats: {
          activeListings,
          totalBids,
          revenue: `₹${totalRev.toLocaleString('en-IN')}`,
          co2Saved: `${(totalCo2Kg / 1000).toFixed(1)} tonnes`,
          conversionRate: `${totalBids > 0 ? Math.round((sellerBids.filter(b => b.status === 'accepted').length / totalBids) * 100) : 0}%`,
        },
        listings: formattedListings,
        bids: formattedBids,
        recentActivity: (logsData || []).map(log => ({
          action: log.action.replace(/_/g, ' '),
          detail: `${log.entity}: ${log.details}`,
          time: new Date(log.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }))
      })
    }

    return res.json({ success: false, error: 'Database unconfigured' })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve seller stats' })
  }
})

// GET /api/stats/buyer/:buyerId - Specific buyer procurement statistics
router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params

    if (isSupabaseConfigured && supabase) {
      let buyerUuid = buyerId
      if (!buyerId.includes('-')) {
        const { data: prof } = await supabase.from('profiles').select('id').or(`clerk_user_id.eq.${buyerId},email.eq.${buyerId}`).single()
        if (prof) buyerUuid = prof.id
      }

      const { data: allListings } = await supabase.from('listings').select('id, quantity_kg, price_inr, status').eq('status', 'active')

      let bidQuery = supabase.from('bids').select('*, listings(id, title, category, price_display, location, quantity, unit)').order('created_at', { ascending: false })
      if (buyerUuid && buyerUuid.includes('-') && buyerUuid !== 'a0000000-0000-0000-0000-000000000005') {
        bidQuery = bidQuery.eq('buyer_id', buyerUuid)
      }
      const { data: buyerBids } = await bidQuery

      const bids = buyerBids || []
      const listings = allListings || []

      const totalTender = bids.reduce((sum, b) => sum + (Number(b.bid_amount_inr) || 0), 0)
      const costSaved = Math.round(totalTender * 0.18)

      return res.json({
        success: true,
        buyerStats: {
          activeBidsCount: bids.filter(b => b.status === 'pending').length || bids.length,
          totalTenderVolume: `₹${totalTender.toLocaleString('en-IN')}`,
          completedContracts: bids.filter(b => b.status === 'accepted').length,
          availableLots: listings.length,
          costSavedInr: `₹${costSaved.toLocaleString('en-IN')}`
        },
        bids: bids.map(b => ({
          ...b,
          listing_title: b.listings?.title || 'Industrial Lot',
          amount_display: `₹${Number(b.bid_amount_inr).toLocaleString('en-IN')}`
        }))
      })
    }

    return res.json({ success: false, error: 'Database unconfigured' })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve buyer stats' })
  }
})

export default router
