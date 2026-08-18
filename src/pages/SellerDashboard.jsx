import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { StatCard } from '../components/StatCard'
import { sellerStats, recentActivity, listings } from '../data'
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
} from 'lucide-react'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('inventory')
  const myListings = listings.slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* ─── Top Command Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Seller Command Center
            </h1>
            <Badge variant="emerald" size="sm" dot>
              Live Operations
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Manage your industrial waste streams, review incoming tender bids, and monitor ESG carbon offsets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
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

      {/* ─── Top KPI Cards Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Inventory Lots"
          value={sellerStats.activeListings}
          trend="+2 new"
          isPositive={true}
          description="8 published, 2 in review"
          icon={<Package className="w-5 h-5" />}
          accentColor="emerald"
        />

        <StatCard
          title="Total Bids Received"
          value={sellerStats.totalBids}
          trend="+18.4%"
          isPositive={true}
          description="Avg 5.8 bids per lot"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="cyan"
        />

        <StatCard
          title="Net Recovered Revenue"
          value={sellerStats.revenue}
          trend="+24.2%"
          isPositive={true}
          description="₹6.4L pending in escrow"
          icon={<IndianRupee className="w-5 h-5" />}
          accentColor="purple"
        />

        <StatCard
          title="CO₂ Emissions Abated"
          value={sellerStats.co2Saved}
          trend="+3.2 MT"
          isPositive={true}
          description="Equal to 62 trees planted"
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
              { id: 'inventory', label: 'Active Lots', count: myListings.length },
              { id: 'bids', label: 'Incoming Tenders', count: 14 },
              { id: 'closed', label: 'Dispatched & Settled', count: 6 },
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

          {/* Table / Card List */}
          <div className="flex flex-col gap-3">
            {myListings.map(listing => (
              <div
                key={listing.id}
                className="surface-card rounded-2xl p-5 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                      {listing.category === 'Metal Scrap' ? '🔩' :
                       listing.category === 'Plastic Waste' ? '♳' :
                       listing.category === 'Chemical Byproducts' ? '🧪' :
                       listing.category === 'Textile Waste' ? '🧵' :
                       listing.category === 'Electronic Waste' ? '💻' : '🏭'}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="emerald" size="sm">
                          {listing.category}
                        </Badge>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          ID: #{listing.id}0924
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
                        {listing.bids} Bids Active
                      </Badge>
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        High bid: ₹8,400/t
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
            ))}
          </div>
        </div>

        {/* Right Col: Live Activity Stream & ESG Certificate Box */}
        <div className="flex flex-col gap-6">
          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Real-Time Audit Stream</span>
                <Badge variant="zinc" size="sm">Live</Badge>
              </CardTitle>
              <CardDescription>
                Recent tender bids, logistics confirmations, and payments
              </CardDescription>
            </CardHeader>

            <CardBody className="flex flex-col gap-4">
              {recentActivity.map((act, i) => (
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
              ))}
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
                Monthly Circular Audit Certificate
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your company diverted 450 tonnes from landfill this month. Download your official ESG report for audit filing.
              </p>
            </div>

            <Button
              fullWidth
              size="sm"
              variant="outline"
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
