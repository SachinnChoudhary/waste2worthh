import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Scale,
  Cpu,
  Layers,
  Zap,
  Building2,
  BarChart3,
  Flame,
  Truck,
  FileCheck,
} from 'lucide-react'

const categories = [
  { name: 'Metal Scrap', count: 142, icon: Scale, volume: '8,400 MT' },
  { name: 'Plastics & Polymers', count: 96, icon: Layers, volume: '2,100 MT' },
  { name: 'Chemical Byproducts', count: 64, icon: Flame, volume: '450 KL' },
  { name: 'Textile Waste', count: 52, icon: Sparkles, volume: '1,800 MT' },
  { name: 'Fly Ash & Slag', count: 88, icon: Building2, volume: '25,000 MT' },
  { name: 'E-Waste & PCBs', count: 71, icon: Cpu, volume: '340 MT' },
  { name: 'Wood & Biomass', count: 41, icon: Leaf, volume: '4,200 MT' },
  { name: 'Rubber & Tyres', count: 35, icon: Zap, volume: '950 MT' },
]

export default function Landing() {
  const [calcMaterial, setCalcMaterial] = useState('Steel Mill Slag')
  const [calcQuantity, setCalcQuantity] = useState(100)

  const materialRates = {
    'Steel Mill Slag': { rate: 8200, unit: 'tonne', co2Factor: 1.24 },
    'HDPE Drum Regrind': { rate: 42000, unit: 'tonne', co2Factor: 3.1 },
    'Spent Caustic Soda': { rate: 6500, unit: 'KL', co2Factor: 0.89 },
    'Cotton Selvedge': { rate: 15000, unit: 'tonne', co2Factor: 5.2 },
    'Class F Fly Ash': { rate: 800, unit: 'tonne', co2Factor: 0.42 },
  }

  const currentRate = materialRates[calcMaterial] || materialRates['Steel Mill Slag']
  const estValue = (calcQuantity * currentRate.rate).toLocaleString('en-IN')
  const estCo2 = (calcQuantity * currentRate.co2Factor).toFixed(1)

  return (
    <div className="flex flex-col gap-24 lg:gap-32 pb-24 overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-12 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Hero Headline */}
          <div className="text-center max-w-4xl mx-auto flex flex-col gap-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 leading-[1.08] text-balance">
              Your industrial waste is someone else’s{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(52,211,153,0.3)]">
                raw material
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed text-balance">
              The verified B2B circular exchange where heavy industry, refineries, and recyclers trade high-volume byproducts with AI valuation, real-time CO₂ audits, and guaranteed escrow settlement.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/listing/new" className="w-full sm:w-auto no-underline">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  List Industrial Waste Free
                </Button>
              </Link>
              <Link to="/marketplace" className="w-full sm:w-auto no-underline">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Live Marketplace
                </Button>
              </Link>
            </div>

          </div>

          {/* ─── Hero Key Performance Metrics Ribbon ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
            <div className="surface-card rounded-2xl p-6 border border-white/[0.08] text-center flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                ₹4.2 Cr+
              </span>
              <p className="text-xs text-zinc-400 font-medium">Waste Value Monetized</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">+28% this quarter</span>
            </div>

            <div className="surface-card rounded-2xl p-6 border border-white/[0.08] text-center flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                2,400+ MT
              </span>
              <p className="text-xs text-zinc-400 font-medium">Landfill Diverted</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">100% circular tracking</span>
            </div>

            <div className="surface-card rounded-2xl p-6 border border-white/[0.08] text-center flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                340+
              </span>
              <p className="text-xs text-zinc-400 font-medium">Verified Manufacturers</p>
              <span className="text-[10px] text-cyan-400 font-mono mt-0.5 inline-block">Tata, Reliance, UltraTech</span>
            </div>

            <div className="surface-card rounded-2xl p-6 border border-white/[0.08] text-center flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                12,800 t
              </span>
              <p className="text-xs text-zinc-400 font-medium">CO₂ Emissions Abated</p>
              <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">ISO 14064 Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Material Valuation Simulator ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-3xl p-6 sm:p-10 border border-emerald-500/20 relative overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div>
                <Badge variant="emerald" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Instant AI Pricing Engine
                </Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                Simulate your waste stream value in seconds
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Select your byproduct type and quantity to see live spot market pricing based on ongoing industrial bids across India.
              </p>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Select Material Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(materialRates).map(mat => (
                      <button
                        key={mat}
                        onClick={() => setCalcMaterial(mat)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                          calcMaterial === mat
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                            : 'bg-zinc-900/80 text-zinc-400 border-zinc-700/60 hover:border-zinc-500'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                    <span>Batch Quantity</span>
                    <span className="font-mono text-emerald-400 font-bold">{calcQuantity} {currentRate.unit}s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={calcQuantity}
                    onChange={e => setCalcQuantity(Number(e.target.value))}
                    className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>10 {currentRate.unit}s</span>
                    <span>500 {currentRate.unit}s</span>
                    <span>1000 {currentRate.unit}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-6">
              <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-zinc-950/80 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-100 block">AI Market Estimate</span>
                      <span className="text-[10px] text-emerald-400 font-mono">98.4% Valuation Confidence</span>
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm">
                    Spot Rate
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 font-medium block">Total Recoverable Value</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-sans block">
                      ₹{estValue}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">₹{currentRate.rate.toLocaleString('en-IN')} / {currentRate.unit}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1">
                    <span className="text-xs text-zinc-400 font-medium block">Carbon Footprint Saved</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight font-sans block">
                      {estCo2} t
                    </span>
                    <span className="text-[10px] text-zinc-400 block">CO₂ equivalent emissions</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-500" /> Logistics Cost Est.
                    </span>
                    <span className="font-mono font-semibold text-zinc-200">₹{(calcQuantity * 350).toLocaleString('en-IN')} (Avg 120km)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-zinc-500" /> ESG Compliance Certificate
                    </span>
                    <span className="text-emerald-400 font-bold">Included Free</span>
                  </div>
                </div>

                <Link to="/listing/new" className="block no-underline pt-2">
                  <Button fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Publish This Batch to Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Box Platform Architecture ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            How enterprise circular exchange works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Eliminate intermediary brokers with smart classification, direct factory-to-factory bidding, and automated ESG verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card rounded-3xl p-8 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              01. AI Material Fingerprinting
            </span>
            <h3 className="text-xl font-bold text-zinc-100">
              Automated Chemical & Purity Valuation
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Upload basic specs or test sheets. Our models map ASTM / BIS standards, determine impurity thresholds, and suggest high-yield buyer verticals.
            </p>
          </div>

          <div className="surface-card rounded-3xl p-8 border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Scale className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider block">
              02. Transparent Multi-Buyer Bidding
            </span>
            <h3 className="text-xl font-bold text-zinc-100">
              Direct Negotiation & Smart Escrow
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Receive competitive tenders from verified consumers within a 300km radius. Lock funds into escrow with milestone payment releases upon weighbridge verification.
            </p>
          </div>

          <div className="surface-card rounded-3xl p-8 border border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider block">
              03. Certified Scope-3 Audit Trails
            </span>
            <h3 className="text-xl font-bold text-zinc-100">
              Real-time ESG & CO₂ Ledger
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Every completed transaction generates an immutable life-cycle audit certificate ready for BRSR, GRI, and international carbon credit accounting.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Material Category Grid with Supply Counters ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Active Material Exchanges
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Explore high-demand raw byproduct streams updated in real time.
            </p>
          </div>
          <Link to="/marketplace" className="no-underline">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All 450+ Listings
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(({ name, count, icon: Icon, volume }) => (
            <Link
              key={name}
              to="/marketplace"
              className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 group no-underline flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <Badge variant="zinc" size="sm">
                  {volume}
                </Badge>
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {name}
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  {count} active lots
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Enterprise Call to Action ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card rounded-3xl p-8 sm:p-14 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-zinc-950/80 text-center flex flex-col items-center gap-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Ready to monetize your industrial byproduct inventory?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Join 340+ certified manufacturing hubs already trading on Waste2Worth. Zero listing fees and zero transaction commission on your first 5 deals.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto no-underline">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Enterprise Account
                </Button>
              </Link>
              <Link to="/marketplace" className="w-full sm:w-auto no-underline">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Active Tenders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
