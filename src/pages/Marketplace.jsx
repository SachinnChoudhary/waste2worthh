import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { EmptyState } from '../components/EmptyState'
import { listings as defaultListings, wasteCategories, hazardLevels } from '../data'
import { api } from '../lib/api'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  TrendingUp,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

function ListingCard({ listing, viewMode = 'grid' }) {
  const hazardColorMap = {
    'Non-hazardous': 'emerald',
    Low: 'cyan',
    Moderate: 'amber',
    High: 'rose',
  }

  const hazardVal = listing.hazard || listing.hazard_level || 'Low'
  const companyName = listing.company || listing.profiles?.company_name || 'Industrial Plant'

  if (viewMode === 'list') {
    return (
      <Link to={`/listing/${listing.id}`} className="no-underline block group">
        <div className="surface-card rounded-2xl p-5 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-2xl shrink-0">
              {listing.category === 'Metal Scrap' ? '🔩' :
               listing.category === 'Plastic Waste' ? '♳' :
               listing.category?.includes('Chemical') ? '🧪' :
               listing.category?.includes('Textile') ? '🧵' :
               listing.category?.includes('Electronic') || listing.category === 'E-Waste' ? '💻' : '🏭'}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {companyName}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {listing.location}
                </span>
                <Badge variant={hazardColorMap[hazardVal] || 'zinc'} size="sm">
                  {hazardVal}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {listing.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/[0.06] pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-lg font-bold text-emerald-400 block">
                {listing.price}
              </span>
              <span className="text-xs text-zinc-400 font-mono block">
                {listing.quantity} available
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Badge variant="cyan" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                {listing.bids || 0} Bids
              </Badge>
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Specs
              </Button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/listing/${listing.id}`} className="no-underline block group h-full">
      <div className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 h-full flex flex-col justify-between gap-5">
        {/* Card Header */}
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
                <Badge variant={hazardColorMap[hazardVal] || 'zinc'} size="sm" dot>
                  {hazardVal}
                </Badge>
              </div>
            </div>

            <Badge variant="cyan" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
              {listing.bids || 0} Bids
            </Badge>
          </div>

          {/* Company & Location Info */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300 flex items-center gap-1 truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {companyName}
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

          {/* AI Match Info Strip */}
          <div className="flex items-center justify-between text-[11px] font-mono bg-zinc-950/70 px-3 py-1.5 rounded-lg border border-white/[0.06] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles className="w-3 h-3" /> AI Valued
            </span>
            <span>{listing.postedAt || 'Live'}</span>
          </div>
        </div>

        {/* Card Footer Strip */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-emerald-400 tracking-tight">
              {listing.price}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Lot: {listing.quantity}
            </span>
          </div>

          <Button size="xs" variant="secondary" rightIcon={<ArrowRight className="w-3 h-3" />}>
            View Lot
          </Button>
        </div>
      </div>
    </Link>
  )
}

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [hazard, setHazard] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [allListings, setAllListings] = useState(defaultListings)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const res = await api.getListings({ category, hazard, search })
      if (res && res.listings && res.listings.length > 0) {
        setAllListings(res.listings)
      }
      setIsLoading(false)
    }
    load()
  }, [category, hazard, search])

  const filtered = allListings.filter(l => {
    if (
      search &&
      !l.title.toLowerCase().includes(search.toLowerCase()) &&
      !(l.company || '').toLowerCase().includes(search.toLowerCase()) &&
      !(l.location || '').toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (category && l.category !== category) return false
    if (hazard && (l.hazard !== hazard && l.hazard_level !== hazard)) return false
    return true
  })

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setHazard('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Industrial Byproduct Exchange
            </h1>
            <Badge variant="emerald" size="sm" dot>
              Live Market Tenders
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Browse verified post-industrial waste streams, chemical byproducts, and secondary raw materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/listing/new" className="no-underline">
            <Button size="sm" variant="primary">
              + Post New Lot
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="surface-card rounded-2xl p-4 border border-white/[0.08] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search material type, chemical CAS, city, or seller..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-10 px-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            {wasteCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={hazard}
            onChange={e => setHazard(e.target.value)}
            className="h-10 px-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="">All Hazards</option>
            {hazardLevels.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {(search || category || hazard) && (
            <Button size="sm" variant="ghost" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-zinc-900/80 border border-white/10 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Listings Grid/List View ─── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No Matching Industrial Lots Found"
          description="Try broadening your category filter or search keywords."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}
