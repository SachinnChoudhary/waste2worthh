import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { StatCard } from '../components/StatCard'
import { api } from '../lib/api'
import { listings as fallbackListings } from '../data'
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
  Cpu,
} from 'lucide-react'

export default function BuyerDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('we need steel offcuts and scrap metal sheets for remelting')
  const [listings, setListings] = useState(fallbackListings)
  const [recommendations, setRecommendations] = useState([])
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)

  const categories = ['All', 'Metal Scrap', 'Plastic Waste', 'Chemical Residue', 'Textile Waste', 'E-Waste']

  // Fetch all live listings from Node.js backend
  useEffect(() => {
    async function loadData() {
      const res = await api.getListings()
      if (res && res.listings && res.listings.length > 0) {
        setListings(res.listings)
      }
    }
    loadData()
  }, [])

  // Live ML Buyer Recommendation Query
  useEffect(() => {
    async function fetchMatches() {
      if (!searchQuery.trim()) return
      setIsLoadingRecs(true)
      const res = await api.getBuyerRecommendations(searchQuery, 6)
      if (res && res.matches && res.matches.length > 0) {
        setRecommendations(res.matches)
      }
      setIsLoadingRecs(false)
    }
    fetchMatches()
  }, [searchQuery])

  const filteredListings = listings.filter(l => {
    if (selectedFilter === 'All') return true
    return l.category === selectedFilter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Buyer Procurement Hub
            </h1>
            <Badge variant="cyan" size="sm" dot>
              Python ML Matchmaking Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Content-based cosine similarity engine matching your plant's procurement specs with live secondary byproduct streams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/marketplace" className="no-underline">
            <Button size="sm" variant="secondary" leftIcon={<Search className="w-4 h-4" />}>
              Search All Listings
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── KPI Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Sourcing Alerts"
          value="4"
          trend="+1 trigger"
          isPositive={true}
          description="Monitoring 3 polymer & metal grades"
          icon={<Bell className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Active Bids Placed"
          value="12"
          trend="3 leading"
          isPositive={true}
          description="₹14.2L total tender volume"
          icon={<Zap className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Completed Contracts"
          value="8"
          trend="100% verified"
          isPositive={true}
          description="Zero delivery disputes"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="purple"
        />

        <StatCard
          title="Raw Material Cost Saved"
          value="₹6.8 Lakhs"
          trend="34.5% avg discount"
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
            {isLoadingRecs ? 'Vectorizing TF-IDF...' : 'ML Cosine Rank Active'}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. looking for HDPE and PET plastic packaging waste for recycling..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900/90 border border-white/15 text-xs text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchQuery('looking for HDPE and PET plastic packaging waste for recycling')}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer shrink-0"
            >
              Plastic Scrap
            </button>
            <button
              onClick={() => setSearchQuery('we need steel offcuts and scrap metal sheets for remelting')}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer shrink-0"
            >
              Steel / Metal
            </button>
            <button
              onClick={() => setSearchQuery('sourcing fabric offcuts and cotton scrap for fiber reprocessing')}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] text-fg-secondary hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer shrink-0"
            >
              Cotton Scrap
            </button>
          </div>
        </div>

        {/* Live Recommendation Chips */}
        {recommendations.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {rec.category} • Lot {rec.listing_id}
                  </span>
                  <span className="text-xs text-fg-primary truncate font-medium mt-0.5">
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

      {/* ─── Live Marketplace Tender Feed ─── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">
                Verified Industrial Lots Available for Bidding
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Direct procurement with verified lab reports and smart escrow release.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <Link key={listing.id} to={`/listing/${listing.id}`} className="no-underline block group h-full">
              <div className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 h-full flex flex-col justify-between gap-5">
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
                          {listing.aiConfidence || 92}% Match
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
                      {listing.company || listing.profiles?.company_name || 'Enterprise Seller'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {(listing.location || 'India').split(',')[0]}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Valuation */}
                  <div className="flex items-center justify-between text-[11px] font-mono bg-zinc-950/70 px-3 py-1.5 rounded-lg border border-white/[0.06] text-zinc-400">
                    <span>Valuation: {listing.aiValuation || `₹${(listing.price_inr || 25000).toLocaleString('en-IN')}`}</span>
                    <span className="text-emerald-400 font-semibold">{listing.postedAt || 'Live'}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-emerald-400 tracking-tight">
                      {listing.price}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Quantity: {listing.quantity}
                    </span>
                  </div>

                  <Button size="xs" variant="primary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    Place Tender Bid
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
