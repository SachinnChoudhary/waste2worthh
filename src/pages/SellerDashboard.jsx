import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { StatCard } from '../components/StatCard'
import { api } from '../lib/api'
import { useWasteAuth } from '../lib/auth'
import {
  PlusCircle,
  TrendingUp,
  Package,
  Leaf,
  IndianRupee,
  FileSpreadsheet,
  ArrowUpRight,
  Download,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react'

export default function SellerDashboard() {
  const { user } = useWasteAuth()
  const [activeTab, setActiveTab] = useState('inventory')
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [myListings, setMyListings] = useState([])
  const [incomingBids, setIncomingBids] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [stats, setStats] = useState({
    activeListings: 0,
    totalBids: 0,
    revenue: '₹0',
    co2Saved: '0 tonnes'
  })
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadSellerData = async () => {
    setRefreshing(true)
    try {
      const sellerId = user?.id || 'a0000000-0000-0000-0000-000000000001'
      const data = await api.getSellerDashboardData(sellerId)

      if (data && data.success) {
        setStats(data.sellerStats || {
          activeListings: 0,
          totalBids: 0,
          revenue: '₹0',
          co2Saved: '0 tonnes'
        })
        setMyListings(data.listings || [])
        setIncomingBids(data.bids || [])
        setRecentLogs(data.recentActivity || [])
      } else {
        // Direct query fallback to listings API
        const listRes = await api.getListings()
        if (listRes?.listings) {
          const all = listRes.listings
          setMyListings(all)
          const totalKg = all.reduce((sum, l) => sum + (Number(l.quantity_kg) || 0), 0)
          const totalCo2 = all.reduce((sum, l) => sum + (Number(l.co2_reduction_kg) || 0), 0)
          const totalRev = all.reduce((sum, l) => sum + (Number(l.price_inr) || 0), 0)
          setStats({
            activeListings: all.filter(l => l.status === 'active').length,
            totalBids: all.reduce((sum, l) => sum + (l.bids || 0), 0),
            revenue: `₹${totalRev.toLocaleString('en-IN')}`,
            co2Saved: `${(totalCo2 / 1000).toFixed(1)} tonnes`
          })
        }
      }
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSellerData()
  }, [user?.id])

  const handleBidStatus = async (bidId, newStatus) => {
    try {
      await api.updateBidStatus(bidId, newStatus)
      setIncomingBids(prev => prev.map(b => String(b.id) === String(bidId) ? { ...b, status: newStatus } : b))
      showToast(`Tender bid marked as ${newStatus.toUpperCase()}`)
      loadSellerData()
    } catch (e) {
      showToast('Failed to update bid status')
    }
  }

  const exportLedger = () => {
    const reportData = {
      enterprise: user?.company || 'Tata Steel Ltd.',
      exportedAt: new Date().toISOString(),
      activeInventoryCount: myListings.length,
      listings: myListings,
      bidsReceived: incomingBids,
      abatementSummary: stats
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waste2worth-seller-ledger-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Enterprise circular ledger downloaded!')
  }

  const activeLots = myListings.filter(l => (l.status || 'active') === 'active')
  const closedLots = myListings.filter(l => l.status === 'completed' || l.status === 'sold')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-300">
          <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ─── Top Command Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Seller Command Center
            </h1>
            <Badge variant="emerald" size="sm" dot>
              Live Supabase Data
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time management of {user?.company || 'Tata Steel Ltd.'} byproduct streams, incoming tender bids, and ESG scope-3 carbon offsets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={loadSellerData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={exportLedger}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Ledger
          </Button>

          <Link to="/listing/new" className="no-underline">
            <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Top KPI Cards Row (Real Live Supabase Data) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Inventory Lots"
          value={stats.activeListings}
          trend={`${activeLots.length} published`}
          isPositive={true}
          description="Live on marketplace"
          icon={<Package className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Total Bids Received"
          value={stats.totalBids}
          trend={`${incomingBids.length} tenders`}
          isPositive={true}
          description="Verified buyer offers"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Total Listed / Traded Value"
          value={stats.revenue}
          trend="Escrow Protected"
          isPositive={true}
          description="Direct factory sales"
          icon={<IndianRupee className="w-5 h-5" />}
          accentColor="purple"
        />

        <StatCard
          title="CO₂ Emissions Abated"
          value={stats.co2Saved}
          trend="Certified Offset"
          isPositive={true}
          description="BRSR Audit Ready"
          icon={<Leaf className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* ─── Main Operations Split Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Tabs & Inventory Management Table */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1">
            {[
              { id: 'inventory', label: 'Active Lots', count: activeLots.length },
              { id: 'bids', label: 'Incoming Tenders', count: incomingBids.length },
              { id: 'closed', label: 'Settled Deals', count: closedLots.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'bg-white/[0.08] text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/[0.06] text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* TAB 1: Active Lots */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-3">
              {activeLots.length === 0 ? (
                <div className="surface-card rounded-2xl p-10 border border-white/[0.08] text-center space-y-4">
                  <Package className="w-10 h-10 text-zinc-500 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">No Active Lots Listed Yet</h3>
                    <p className="text-xs text-zinc-400 mt-1">Publish your first industrial byproduct stream to connect with verified buyers.</p>
                  </div>
                  <Link to="/listing/new" className="inline-block no-underline">
                    <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                      Create First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                activeLots.map(listing => (
                  <div
                    key={listing.id}
                    className="surface-card rounded-2xl p-5 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                          {listing.category === 'Metal Scrap' ? '🔩' :
                           listing.category === 'Plastic Waste' ? '♳' :
                           listing.category?.includes('Chemical') ? '🧪' :
                           listing.category?.includes('Textile') ? '🧵' :
                           listing.category?.includes('Electronic') || listing.category === 'E-Waste' ? '💻' : '🏭'}
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="emerald" size="sm">
                              {listing.category}
                            </Badge>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              ID: #{String(listing.id).slice(0, 8)}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-zinc-100">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-mono">
                            {listing.quantity} • Asking {listing.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <Badge variant="cyan" size="sm" icon={<MessageSquare className="w-3 h-3" />}>
                            {listing.bids || 0} Bids Active
                          </Badge>
                          <span className="text-[10px] text-zinc-400 block mt-1">
                            {listing.co2Saved || 'Scope-3 Monitored'}
                          </span>
                        </div>

                        <Link to={`/listing/${listing.id}`} className="no-underline">
                          <Button size="xs" variant="secondary" rightIcon={<ArrowUpRight className="w-3 h-3" />}>
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Incoming Tenders */}
          {activeTab === 'bids' && (
            <div className="flex flex-col gap-3">
              {incomingBids.length === 0 ? (
                <div className="surface-card rounded-2xl p-10 border border-white/[0.08] text-center space-y-3">
                  <TrendingUp className="w-10 h-10 text-zinc-500 mx-auto" />
                  <h3 className="text-base font-bold text-zinc-100">No Bids Received Yet</h3>
                  <p className="text-xs text-zinc-400">Incoming buyer tenders for your byproduct lots will appear here in real-time.</p>
                </div>
              ) : (
                incomingBids.map(bid => (
                  <div
                    key={bid.id}
                    className="surface-card rounded-2xl p-5 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">
                          {bid.buyer_company || 'Verified Buyer'}
                        </span>
                        <Badge
                          variant={bid.status === 'accepted' ? 'emerald' : bid.status === 'rejected' ? 'rose' : 'cyan'}
                          size="sm"
                        >
                          {bid.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Offered <strong className="text-emerald-400 font-mono font-bold">₹{(bid.bid_amount_inr || 0).toLocaleString('en-IN')}</strong> for {bid.bid_quantity || 1} {bid.unit || 'tonnes'}
                      </p>
                      {bid.message && (
                        <p className="text-[11px] text-zinc-500 italic mt-0.5 max-w-md">
                          "{bid.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {bid.status !== 'accepted' && (
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => handleBidStatus(bid.id, 'accepted')}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Accept Offer
                        </Button>
                      )}
                      {bid.status !== 'rejected' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleBidStatus(bid.id, 'rejected')}
                          leftIcon={<X className="w-3.5 h-3.5 text-rose-400" />}
                        >
                          Decline
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Settled Deals */}
          {activeTab === 'closed' && (
            <div className="surface-card rounded-2xl p-8 border border-white/[0.08] text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-100">Escrow Settlement Ledger</h4>
              <p className="text-xs text-zinc-400">
                All dispatched material lots with signed weighbridge slips and released escrow disbursements.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Live Activity Stream & ESG Certificate Box */}
        <div className="flex flex-col gap-6">
          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Real-Time Audit Stream</span>
                <Badge variant="zinc" size="sm">Supabase Sync</Badge>
              </CardTitle>
              <CardDescription>
                Recent tender bids, logistics confirmations, and payments
              </CardDescription>
            </CardHeader>

            <CardBody className="flex flex-col gap-4">
              {recentLogs.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-4">
                  No recent audit events recorded.
                </div>
              ) : (
                recentLogs.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <p className="font-bold text-zinc-100 leading-snug">
                        {act.action}
                      </p>
                      <p className="text-zinc-300 text-[11px] leading-normal">
                        {act.detail}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* ESG Scope-3 Certification Card */}
          <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-zinc-950/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                ISO 14064
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-zinc-100">
                Official Circular Audit Certificate
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your enterprise has abated {stats.co2Saved} this fiscal year. Download your official ESG report for audit filing.
              </p>
            </div>

            <Button
              fullWidth
              size="sm"
              variant="outline"
              onClick={exportLedger}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF Certificate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
