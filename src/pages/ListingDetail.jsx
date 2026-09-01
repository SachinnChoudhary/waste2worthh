import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import { api } from '../lib/api'
import { useWasteAuth } from '../lib/auth'
import {
  ArrowLeft,
  Sparkles,
  Building2,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Truck,
  CheckCircle2,
  Share2,
  Bookmark,
  RefreshCw,
  FileText,
  ExternalLink,
  Check,
  X,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Eye,
} from 'lucide-react'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useWasteAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidQuantity, setBidQuantity] = useState('100')
  const [bidNote, setBidNote] = useState('')
  const [logistics, setLogistics] = useState('buyer_pickup')
  const [showBidForm, setShowBidForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidSubmitted, setBidSubmitted] = useState(false)
  const [bidsList, setBidsList] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadListingAndBids = async () => {
    const res = await api.getListingById(id)
    if (res && res.listing) {
      setListing(res.listing)
      setBidAmount(String(res.listing.price_inr || ''))
    }
    const bidsRes = await api.getBidsForListing(id)
    if (bidsRes && bidsRes.bids) {
      setBidsList(bidsRes.bids)
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      await loadListingAndBids()
      setLoading(false)
    }
    load()
  }, [id])

  // Determine whether current authenticated user is the owner/seller who posted this listing
  const isOwner = Boolean(
    user && listing && (
      (listing.seller_id && (String(user.id) === String(listing.seller_id) || (user.clerk_user_id && String(user.clerk_user_id) === String(listing.seller_id)))) ||
      (listing.profiles?.id && String(user.id) === String(listing.profiles.id)) ||
      (listing.profiles?.email && user.email && String(listing.profiles.email).toLowerCase() === String(user.email).toLowerCase()) ||
      (listing.email && user.email && String(listing.email).toLowerCase() === String(user.email).toLowerCase()) ||
      (listing.company && user.company && String(listing.company).trim().toLowerCase() === String(user.company).trim().toLowerCase())
    )
  )

  const handleBidSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    const numAmount = parseFloat(bidAmount.replace(/[^0-9.]/g, '')) || (listing?.price_inr || 50000)

    try {
      await api.placeBid({
        listing_id: id,
        buyer_id: user?.id,
        buyer_company: user?.company || 'Verified Material Buyer',
        bid_amount_inr: numAmount,
        bid_quantity: parseFloat(bidQuantity) || 10,
        unit: listing?.unit || 'tonnes',
        proposed_logistics: logistics,
        message: bidNote,
      })

      setBidSubmitted(true)
      setIsSubmitting(false)
      setShowBidForm(false)
      showToast('Tender bid submitted successfully!')
      // Refresh bids
      const bidsRes = await api.getBidsForListing(id)
      if (bidsRes && bidsRes.bids) {
        setBidsList(bidsRes.bids)
      }
    } catch (err) {
      setBidSubmitted(true)
      setIsSubmitting(false)
      setShowBidForm(false)
    }
  }

  const handleBidStatusUpdate = async (bidId, newStatus) => {
    try {
      await api.updateBidStatus(bidId, newStatus)
      setBidsList(prev => prev.map(b => String(b.id) === String(bidId) ? { ...b, status: newStatus } : b))
      showToast(`Bid marked as ${newStatus.toUpperCase()}`)
    } catch (e) {
      showToast('Failed to update bid status')
    }
  }

  const hazardColorMap = {
    'Non-hazardous': 'emerald',
    Low: 'cyan',
    Moderate: 'amber',
    High: 'rose',
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-fg-primary">Listing Not Found</h2>
        <p className="text-xs text-fg-secondary">This byproduct stream may have been completed or archived.</p>
        <Link to="/marketplace" className="no-underline inline-block">
          <Button variant="primary" size="sm">Back to Marketplace</Button>
        </Link>
      </div>
    )
  }

  const hazardVal = listing.hazard || listing.hazard_level || 'Non-hazardous'
  const highestBid = bidsList.length > 0
    ? Math.max(...bidsList.map(b => Number(b.bid_amount_inr) || 0))
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-300">
          <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-xl">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ─── Breadcrumb & Actions Strip ─── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Link to="/seller" className="no-underline">
              <Button size="xs" variant="primary" leftIcon={<Building2 className="w-3.5 h-3.5" />}>
                Seller Center
              </Button>
            </Link>
          )}
          <Button size="xs" variant="secondary" leftIcon={<Share2 className="w-3.5 h-3.5" />}>
            Share Lot
          </Button>
          <Button size="xs" variant="secondary" leftIcon={<Bookmark className="w-3.5 h-3.5" />}>
            Save
          </Button>
        </div>
      </div>

      {/* ─── Main Content Split ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Material Specifications & Technical Profile */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="surface-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] flex flex-col gap-6">
            {/* Visual Icon Box */}
            <div className="h-60 sm:h-72 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-emerald-950/40 rounded-2xl flex items-center justify-center text-7xl relative border border-white/[0.06] overflow-hidden">
              <span className="drop-shadow-2xl">
                {listing.category === 'Metal Scrap' ? '🔩' :
                 listing.category === 'Plastic Waste' ? '♳' :
                 listing.category?.includes('Chemical') ? '🧪' :
                 listing.category?.includes('Textile') ? '🧵' :
                 listing.category?.includes('Electronic') || listing.category === 'E-Waste' ? '💻' : '🏭'}
              </span>

              {/* Badges on visual */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge variant={hazardColorMap[hazardVal] || 'emerald'} size="md" dot>
                  {hazardVal}
                </Badge>
                <Badge variant="zinc" size="md">
                  {listing.category}
                </Badge>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isOwner && (
                  <Badge variant="emerald" size="md" icon={<UserCheck className="w-3.5 h-3.5" />}>
                    Your Lot
                  </Badge>
                )}
                <Badge variant="cyan" size="md" icon={<TrendingUp className="w-3.5 h-3.5" />}>
                  {bidsList.length} Active Offers
                </Badge>
              </div>

              <div className="absolute bottom-3 left-4 right-4 bg-zinc-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Lot ID: #{String(listing.id).slice(0, 8)}</span>
                <span>Live & Verified</span>
              </div>
            </div>

            {/* Title & Asking Price Hero Block */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    {listing.company || 'Enterprise Seller'}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {listing.location}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight block">
                  {listing.price}
                </span>
                <span className="text-xs text-zinc-400 font-mono block">
                  Available: {listing.quantity}
                </span>
              </div>
            </div>

            {/* Quick Specs 4-Tile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Category', value: listing.category },
                { label: 'Condition', value: listing.condition || 'Clean / sorted' },
                { label: 'Total Lot', value: listing.quantity },
                { label: 'Hazard Class', value: hazardVal },
              ].map(spec => (
                <div key={spec.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    {spec.label}
                  </span>
                  <span className="text-xs font-bold text-zinc-100 block truncate">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Technical Material Narrative */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Material Composition & Specifications
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {listing.description}
              </p>
            </div>

            {/* Attached Photos & MSDS Documents */}
            {((listing.images && listing.images.length > 0) || listing.msds_document_url) && (
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                  Material Documentation & Lab Photos
                </h3>

                {/* Images gallery */}
                {listing.images && listing.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.images.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40 hover:border-emerald-500/50 transition-all group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Lot media ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* MSDS Document Button */}
                {listing.msds_document_url && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-zinc-100 block">MSDS / Lab Assay Certificate</span>
                        <span className="text-[11px] text-zinc-400 block">Verified Certified Laboratory Report</span>
                      </div>
                    </div>
                    <a
                      href={listing.msds_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors no-underline"
                    >
                      <span>View PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Pickup & Logistics Info */}
            <div className="flex flex-col gap-2.5 pt-2">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Dispatch & Loading Facility
              </h3>
              <div className="surface-card rounded-xl p-4 border border-white/[0.08] flex flex-col gap-2 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Dispatch Address:</span>
                  <span className="font-semibold text-zinc-100">{listing.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Weighbridge on site:</span>
                  <span className="text-emerald-400 font-semibold">Available (Certified Calibrated)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Loading assistance:</span>
                  <span>Overhead crane / forklift available on dock</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: AI Valuation & Action Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Valuation Card */}
          <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-zinc-950/90 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  AI Material Intelligence
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                {listing.aiConfidence || 95}% Confidence
              </Badge>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Classification & CAS Ref
                </span>
                <span className="text-xs font-semibold text-zinc-200 font-mono mt-0.5 block">
                  {listing.aiClassification || `${listing.category} Ref`}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Fair Spot Valuation Range
                </span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  {listing.aiValuation || listing.price}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                  Environmental Abatement Score
                </span>
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                  <Leaf className="w-3.5 h-3.5 shrink-0" />
                  {listing.co2Saved || 'Scope-3 Monitored'}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Action Card: Owner View vs Buyer Tender Card */}
          {isOwner ? (
            /* ─── OWNER / SELLER PANEL: ACTIVE TENDER BIDS & MANAGEMENT ─── */
            <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-zinc-900/90 flex flex-col gap-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Your Listed Stream
                  </h3>
                </div>
                <Badge variant="emerald" size="sm" dot>
                  Owner Active
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-emerald-300">You posted this waste stream</span>
                  <span className="text-zinc-400">
                    Monitor competitive buyer tender offers below or manage contracts in your Seller Command Center.
                  </span>
                </div>
              </div>

              {/* Quick Lot Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Bids</span>
                  <span className="text-lg font-extrabold text-cyan-400">{bidsList.length} Offers</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Top Offer</span>
                  <span className="text-lg font-extrabold text-emerald-400 truncate">
                    {highestBid > 0 ? `₹${highestBid.toLocaleString('en-IN')}` : 'Awaiting Bids'}
                  </span>
                </div>
              </div>

              {/* Active Bids Feed */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Incoming Tender Bids ({bidsList.length})
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                    onClick={async () => {
                      const res = await api.getBidsForListing(id)
                      if (res?.bids) setBidsList(res.bids)
                    }}
                  >
                    Refresh
                  </Button>
                </div>

                {bidsList.length === 0 ? (
                  <div className="p-6 rounded-xl bg-zinc-950/40 border border-dashed border-white/10 text-center flex flex-col items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-zinc-600" />
                    <span className="text-xs font-semibold text-zinc-300">No tender bids placed yet</span>
                    <p className="text-[11px] text-zinc-500 max-w-xs">
                      Industrial buyers are reviewing your specifications. Verified offers will appear here live with smart escrow protection.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {bidsList.map((bid) => (
                      <div
                        key={bid.id}
                        className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-200">{bid.buyer_company || 'Verified Buyer'}</span>
                            {bid.verified !== false && (
                              <Badge variant="emerald" size="xs">Verified</Badge>
                            )}
                          </div>
                          <Badge
                            variant={
                              bid.status === 'accepted' ? 'emerald' :
                              bid.status === 'rejected' ? 'rose' :
                              bid.status === 'countered' ? 'amber' : 'cyan'
                            }
                            size="xs"
                          >
                            {bid.status ? bid.status.toUpperCase() : 'PENDING'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[11px] text-zinc-400 block">Tender Offer:</span>
                            <span className="text-sm font-bold text-emerald-400">
                              ₹{(Number(bid.bid_amount_inr) || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-zinc-400 block">Volume:</span>
                            <span className="font-semibold text-zinc-200">
                              {bid.bid_quantity || '—'} {bid.unit || listing.unit || 'tonnes'}
                            </span>
                          </div>
                        </div>

                        {bid.message && (
                          <p className="text-[11px] text-zinc-400 italic bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                            "{bid.message}"
                          </p>
                        )}

                        {bid.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="xs"
                              variant="primary"
                              fullWidth
                              leftIcon={<Check className="w-3 h-3" />}
                              onClick={() => handleBidStatusUpdate(bid.id, 'accepted')}
                            >
                              Accept Offer
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleBidStatusUpdate(bid.id, 'rejected')}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                <Link to="/seller" className="no-underline">
                  <Button variant="primary" size="md" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Seller Command Center
                  </Button>
                </Link>
                <Link to="/marketplace" className="no-underline">
                  <Button variant="ghost" size="sm" fullWidth>
                    Browse Other Marketplace Lots
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ─── BUYER / PROCUREMENT TENDER BID CARD ─── */
            <div className="surface-card rounded-2xl p-6 border border-white/[0.08] flex flex-col gap-4">
              <h3 className="text-base font-bold text-zinc-100">
                Procurement & Tender Offer
              </h3>

              {bidSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-300">Bid Recorded in Live Ledger</span>
                    <span className="text-[11px] text-zinc-400">The seller has been notified via smart escrow channel.</span>
                  </div>
                </div>
              ) : showBidForm ? (
                <form onSubmit={handleBidSubmit} className="flex flex-col gap-3">
                  <Input
                    label="Total Bid Amount (₹ INR)"
                    id="bid-amt"
                    placeholder="e.g. 3600000"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    required
                  />
                  <Input
                    label="Target Volume"
                    id="bid-qty"
                    placeholder={`Quantity in ${listing.unit || 'tonnes'}`}
                    value={bidQuantity}
                    onChange={e => setBidQuantity(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Proposed Pickup Terms / Logistics Notes"
                    id="bid-note"
                    rows={2}
                    placeholder="e.g. Pickup via dedicated closed container trucks within 48 hours..."
                    value={bidNote}
                    onChange={e => setBidNote(e.target.value)}
                  />
                  <div className="flex items-center gap-2 pt-2">
                    <Button type="submit" variant="primary" fullWidth size="md" isLoading={isSubmitting}>
                      Confirm & Transmit Bid
                    </Button>
                    <Button type="button" variant="ghost" size="md" onClick={() => setShowBidForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-zinc-400">
                    Submit a formal bid against this industrial stream with Escrow settlement protection.
                  </p>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setShowBidForm(true)}>
                    Place Competitive Tender Bid
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

