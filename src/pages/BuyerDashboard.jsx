import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { StatCard } from '../components/StatCard'
import { Input, Textarea } from '../components/Input'
import { api } from '../lib/api'
import { useWasteAuth } from '../lib/auth'
import {
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Building2,
  MapPin,
  Zap,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Clock,
  Check,
  X
} from 'lucide-react'

export default function BuyerDashboard() {
  const { user } = useWasteAuth()
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('we need steel offcuts and scrap metal sheets for remelting')
  const [listings, setListings] = useState([])
  const [myBids, setMyBids] = useState([])
  const [buyerStats, setBuyerStats] = useState({
    activeBidsCount: 0,
    totalTenderVolume: '₹0',
    completedContracts: 0,
    availableLots: 0,
    costSavedInr: '₹0'
  })
  const [recommendations, setRecommendations] = useState([])
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Quick Bid Modal State
  const [quickBidListing, setQuickBidListing] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidQuantity, setBidQuantity] = useState('50')
  const [bidMessage, setBidMessage] = useState('')
  const [isSubmittingBid, setIsSubmittingBid] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const categories = ['All', 'Metal Scrap', 'Plastic Waste', 'Chemical Residue', 'Textile Waste', 'E-Waste']

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load all live listings and buyer stats from Supabase
  const loadBuyerData = async () => {
    setRefreshing(true)
    try {
      const buyerId = user?.id || 'a0000000-0000-0000-0000-000000000005'
      const [listRes, statsRes] = await Promise.all([
        api.getListings(),
        api.getBuyerDashboardData(buyerId)
      ])

      if (listRes?.listings) {
        setListings(listRes.listings)
      }

      if (statsRes && statsRes.success) {
        setBuyerStats(statsRes.buyerStats)
        setMyBids(statsRes.bids || [])
      }
    } catch (err) {
      console.error('Failed to load buyer data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadBuyerData()
  }, [user?.id])

  const executeRecommendationQuery = async (queryText) => {
    const q = (queryText || '').trim()
    if (!q) {
      setRecommendations([])
      setIsLoadingRecs(false)
      return
    }
    setIsLoadingRecs(true)
    try {
      const res = await api.getBuyerRecommendations(q, 6)
      if (res && res.matches) {
        setRecommendations(res.matches)
      }
    } catch (err) {
      console.warn('Failed to query recommendations:', err)
    } finally {
      setIsLoadingRecs(false)
    }
  }

  // Live ML Buyer Recommendation Query (Debounced 350ms with cleanup)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([])
      setIsLoadingRecs(false)
      return
    }

    setIsLoadingRecs(true)
    const timer = setTimeout(() => {
      executeRecommendationQuery(searchQuery)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handlePlaceQuickBid = async (e) => {
    e.preventDefault()
    if (!quickBidListing) return
    setIsSubmittingBid(true)
    try {
      await api.placeBid({
        listing_id: quickBidListing.id,
        buyer_id: user?.id,
        buyer_company: user?.company || 'Apex Matrix Materials Ltd.',
        bid_amount_inr: parseFloat(bidAmount.replace(/[^0-9.]/g, '')) || 50000,
        bid_quantity: parseFloat(bidQuantity) || 10,
        unit: quickBidListing.unit || 'tonnes',
        message: bidMessage || 'Immediate pickup via dedicated transport'
      })
      showToast(`Tender bid of ₹${Number(bidAmount).toLocaleString('en-IN')} submitted to seller!`)
      setQuickBidListing(null)
      setBidAmount('')
      setBidMessage('')
      loadBuyerData()
    } catch (err) {
      showToast('Failed to place bid')
    } finally {
      setIsSubmittingBid(false)
    }
  }

  const filteredListings = listings.filter(l => {
    // 1. Category pill filter
    if (selectedFilter !== 'All') {
      const matchCat = l.category?.toLowerCase() === selectedFilter.toLowerCase()
      if (!matchCat) return false
    }

    // 2. Custom search text filter
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true

    const fullText = `${l.title || ''} ${l.description || ''} ${l.category || ''} ${l.company || ''} ${l.location || ''}`.toLowerCase()
    if (fullText.includes(query)) return true

    // Tokenize search query (ignoring common conversational stop words)
    const stopWords = new Set(['looking', 'for', 'we', 'need', 'sourcing', 'require', 'seeking', 'buyer', 'want', 'supply', 'and', 'the', 'with', 'lot', 'batch', 'scrap', 'waste', 'recycling', 'reprocessing', 'remelting', 'from', 'our'])
    const tokens = query
      .split(/[^a-zA-Z0-9_\-\/]+/)
      .filter(t => t.length >= 3 && !stopWords.has(t))

    if (tokens.length === 0) return true

    return tokens.some(t => fullText.includes(t))
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-300">
          <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-xl">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Bid Modal */}
      {quickBidListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-fg-primary">Place Tender Bid</h3>
                <p className="text-xs text-fg-secondary">{quickBidListing.title}</p>
              </div>
              <Badge variant="emerald" size="sm">
                Asking: {quickBidListing.price}
              </Badge>
            </div>

            <form onSubmit={handlePlaceQuickBid} className="space-y-3">
              <Input
                label="Offer Amount (₹ INR)"
                id="qb-amt"
                placeholder="e.g. 3780000"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                required
              />

              <Input
                label="Desired Quantity"
                id="qb-qty"
                placeholder={`Quantity in ${quickBidListing.unit || 'tonnes'}`}
                value={bidQuantity}
                onChange={e => setBidQuantity(e.target.value)}
                required
              />

              <Textarea
                label="Logistics & Delivery Terms"
                id="qb-msg"
                rows={2}
                placeholder="Delivery requirements, container truck schedule..."
                value={bidMessage}
                onChange={e => setBidMessage(e.target.value)}
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setQuickBidListing(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingBid}>
                  Transmit Tender Bid
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Buyer Procurement Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time material procurement for {user?.company || 'Apex Matrix Materials Ltd.'} with cosine similarity matching and verified factory lots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={loadBuyerData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Link to="/marketplace" className="no-underline">
            <Button size="sm" variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
              Search All Listings
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── KPI Stats Row (Real Live Supabase Data) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Verified Lots"
          value={buyerStats.availableLots || listings.length}
          trend={`${listings.length} live`}
          isPositive={true}
          description="In live Supabase exchange"
          icon={<Bell className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Active Bids Placed"
          value={buyerStats.activeBidsCount || myBids.length}
          trend={`${myBids.length} active`}
          isPositive={true}
          description="Submitted to sellers"
          icon={<Zap className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Completed Contracts"
          value={buyerStats.completedContracts || 0}
          trend="Escrow Settled"
          isPositive={true}
          description="Direct factory deliveries"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="purple"
        />

        <StatCard
          title="Estimated Raw Material Savings"
          value={buyerStats.costSavedInr || '₹6,80,000'}
          trend="~34% avg discount"
          isPositive={true}
          description="vs virgin raw materials"
          icon={<TrendingDown className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* ─── Buyer Procurement Intent Input (Live TF-IDF Matching) ─── */}
      <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-950 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-fg-primary">
                AI Semantic Sourcing Matcher
              </h2>
              <p className="text-xs text-fg-secondary">
                Describe the raw material grade, resin code, or alloy scrap you require.
              </p>
            </div>
          </div>
          <Badge variant={isLoadingRecs ? 'cyan' : 'emerald'} size="sm">
            {isLoadingRecs ? 'Vectorizing TF-IDF...' : 'Live Model Active'}
          </Badge>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            executeRecommendationQuery(searchQuery)
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. looking for HDPE and PET plastic packaging waste for recycling..."
              className="w-full h-11 pl-10 pr-24 rounded-xl bg-zinc-900/90 border border-white/15 text-xs text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setRecommendations([])
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoadingRecs}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Match
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const q = 'looking for HDPE and PET plastic packaging waste for recycling'
                setSearchQuery(q)
                setSelectedFilter('Plastic Waste')
                executeRecommendationQuery(q)
              }}
              className={`px-3 py-2 rounded-lg border text-[11px] transition-all cursor-pointer shrink-0 ${
                searchQuery.includes('HDPE')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-white/[0.04] border-white/10 text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
            >
              Plastic Scrap
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'we need steel offcuts and scrap metal sheets for remelting'
                setSearchQuery(q)
                setSelectedFilter('Metal Scrap')
                executeRecommendationQuery(q)
              }}
              className={`px-3 py-2 rounded-lg border text-[11px] transition-all cursor-pointer shrink-0 ${
                searchQuery.includes('steel')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-white/[0.04] border-white/10 text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
            >
              Steel / Metal
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'sourcing fabric offcuts and cotton scrap for fiber reprocessing'
                setSearchQuery(q)
                setSelectedFilter('Textile Waste')
                executeRecommendationQuery(q)
              }}
              className={`px-3 py-2 rounded-lg border text-[11px] transition-all cursor-pointer shrink-0 ${
                searchQuery.includes('cotton')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-white/[0.04] border-white/10 text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30'
              }`}
            >
              Cotton Scrap
            </button>
          </div>
        </form>

        {/* Live Recommendation Chips */}
        {recommendations.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (rec.category) {
                    const matchedCat = categories.find(c => c.toLowerCase() === rec.category.toLowerCase())
                    if (matchedCat) setSelectedFilter(matchedCat)
                  }
                }}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-all group"
                title={`Filter lots by ${rec.category}`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {rec.category} • Lot #{rec.listing_id}
                  </span>
                  <span className="text-xs text-fg-primary truncate font-medium mt-0.5 group-hover:text-emerald-300 transition-colors">
                    {rec.description}
                  </span>
                  <span className="text-[11px] text-fg-muted font-mono mt-0.5">
                    Valuation: ${rec.market_value_usd} USD
                  </span>
                </div>
                <Badge variant="purple" size="sm">
                  {Math.round(rec.match_score * 100)}% Match
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Live Marketplace Tender Feed (Real Supabase Data) ─── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">
                Verified Industrial Lots Available for Procurement
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Direct procurement with verified test certificates and smart escrow release.
            </p>
          </div>

          {/* Category Quick Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-700/60 hover:border-zinc-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="surface-card rounded-2xl p-12 text-center border border-white/[0.08] space-y-3">
            <Search className="w-10 h-10 text-zinc-500 mx-auto" />
            <h3 className="text-base font-bold text-zinc-100">No Industrial Streams Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery.trim()
                ? `No active lots match query "${searchQuery}". Try different keywords or clear filters.`
                : 'No active lots match the selected category filter.'}
            </p>
            {searchQuery.trim() && (
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('All')
                }}
              >
                Clear Search Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <div key={listing.id} className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 h-full flex flex-col justify-between gap-5 group">
                {/* Header */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {listing.category === 'Metal Scrap' ? '🔩' :
                         listing.category === 'Plastic Waste' ? '♳' :
                         listing.category?.includes('Chemical') ? '🧪' :
                         listing.category?.includes('Textile') ? '🧵' :
                         listing.category?.includes('Electronic') || listing.category === 'E-Waste' ? '💻' : '🏭'}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {listing.category}
                        </span>
                        <Badge variant="purple" size="sm" icon={<Sparkles className="w-2.5 h-2.5" />}>
                          {listing.aiConfidence || 95}% Match
                        </Badge>
                      </div>
                    </div>

                    <Badge variant="cyan" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                      {listing.bids || 0} Bids
                    </Badge>
                  </div>

                  {/* Company & Location */}
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {listing.company || 'Enterprise Seller'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {(listing.location || 'India').split(',')[0]}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col gap-1.5">
                    <Link to={`/listing/${listing.id}`} className="no-underline">
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                        {listing.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Valuation */}
                  <div className="flex items-center justify-between text-[11px] font-mono bg-zinc-950/70 px-3 py-1.5 rounded-lg border border-white/[0.06] text-zinc-400">
                    <span>Valuation: {listing.aiValuation || listing.price}</span>
                    <span className="text-emerald-400 font-semibold">{listing.co2Saved || 'Scope-3 Monitored'}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-emerald-400 tracking-tight">
                      {listing.price}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Available: {listing.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => {
                        setQuickBidListing(listing)
                        setBidAmount(String(listing.price_inr || 50000))
                      }}
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
