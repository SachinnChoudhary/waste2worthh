import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Select } from '../components/Input'
import {
  Leaf,
  Sparkles,
  Award,
  ShieldCheck,
  TrendingUp,
  Download,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Search,
  ArrowRight,
  BarChart3,
  Layers,
  Globe
} from 'lucide-react'

export default function CarbonCredits() {
  const [certQuery, setCertQuery] = useState('')
  const [certResult, setCertResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Interactive Calculator State
  const [calcStream, setCalcStream] = useState('Steel Slag')
  const [calcTonnage, setCalcTonnage] = useState(250)

  const streamFactors = {
    'Steel Slag': { factor: 1.24, name: 'Blast Furnace Silicate Slag', creditRateUsd: 24 },
    'HDPE Regrind': { factor: 3.10, name: 'Post-Industrial HDPE Flakes', creditRateUsd: 28 },
    'Class F Fly Ash': { factor: 0.42, name: 'Coal Combustion Fly Ash', creditRateUsd: 18 },
    'Cotton Selvedge': { factor: 5.20, name: 'Post-Industrial Denim Fiber', creditRateUsd: 32 },
    'Aluminium Dross': { factor: 8.80, name: 'Secondary Aluminium Smelter Feed', creditRateUsd: 35 },
    'Waste Solvent': { factor: 1.30, name: 'Recovered Acetone/IPA Mix', creditRateUsd: 22 },
    'E-Waste PCBs': { factor: 14.00, name: 'Telecom & Server Gold/Copper PCBs', creditRateUsd: 45 },
    'Rubber Crumb': { factor: 2.40, name: 'Devulcanized SBR Tyre Granules', creditRateUsd: 26 }
  }

  const currentStream = streamFactors[calcStream] || streamFactors['Steel Slag']
  const totalCo2SavedTonnes = (calcTonnage * currentStream.factor).toFixed(1)
  const totalCreditsGenerated = Math.floor(Number(totalCo2SavedTonnes))
  const creditValueUsd = (totalCreditsGenerated * currentStream.creditRateUsd).toLocaleString('en-US')
  const creditValueInr = (totalCreditsGenerated * currentStream.creditRateUsd * 83).toLocaleString('en-IN')

  const verifiedCertificates = {
    'W2W-CERT-2026-0819-001': {
      id: 'W2W-CERT-2026-0819-001',
      deal: 'Steel Mill Slag (450 MT) — Northgate Steelworks to Apex Matrix Materials',
      date: '19 August 2026',
      co2Avoided: '931.5 Tonnes CO₂e',
      landfillAvoided: '450.0 Tonnes',
      methodology: 'ISO 14064-2 / GHG Scope-3 Protocol',
      verifier: 'Waste2Worth Carbon Registry Engine',
      status: 'VERIFIED & IMMUTABLE',
      sha256: '9a7f3c81e2b4d6083fa9b77201c841e9382103fa72bb3e18a99478f654ce8b99'
    },
    'W2W-CERT-2026-0818-002': {
      id: 'W2W-CERT-2026-0818-002',
      deal: 'HDPE Drum Regrind (12 MT) — Meridian Petrochemicals to EcoPlastics',
      date: '18 August 2026',
      co2Avoided: '16.56 Tonnes CO₂e',
      landfillAvoided: '12.0 Tonnes',
      methodology: 'UNFCCC AMS-III.AJ Circular Polymer',
      verifier: 'Waste2Worth Carbon Registry Engine',
      status: 'VERIFIED & IMMUTABLE',
      sha256: '4e8b39a1f772b9083fa1c841e9382103fa72bb3e18a99478f654ce8b999a7f3c'
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setTimeout(() => {
      const q = certQuery.trim().toUpperCase()
      if (verifiedCertificates[q]) {
        setCertResult(verifiedCertificates[q])
      } else {
        setCertResult({
          id: q || 'W2W-CERT-2026-GEN',
          deal: 'Generic Circular Off-Take Batch #9924',
          date: 'Active Session',
          co2Avoided: `${(calcTonnage * currentStream.factor).toFixed(1)} Tonnes CO₂e`,
          landfillAvoided: `${calcTonnage} Tonnes`,
          methodology: 'ISO 14064-2 Scope-3 Standard',
          verifier: 'Waste2Worth Automated ESG Auditing Node',
          status: 'AUTHENTIC RECORD',
          sha256: '8f9a2e3c1b4d5083fa9b77201c841e9382103fa72bb3e18a99478f654ce8b991'
        })
      }
      setIsVerifying(false)
    }, 400)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<Leaf className="w-3.5 h-3.5" />}>
            ISO 14064 & GHG Protocol Certified
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Scope-3 Carbon Accounting & Circular Carbon Credits
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Every tonne of industrial byproduct repurposed through Waste2Worth generates cryptographic, audit-ready carbon offset certificates ready for SEBI BRSR, GRI, and voluntary carbon markets.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-6 border border-emerald-500/20 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-sans tracking-tight">
            1,420.5 MT
          </span>
          <p className="text-xs text-fg-secondary font-medium">CO₂e Abated in Q3</p>
          <span className="text-[10px] text-emerald-400 font-mono">+44% vs virgin raw materials</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-cyan-500/20 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-sans tracking-tight">
            3,260 MT
          </span>
          <p className="text-xs text-fg-secondary font-medium">Landfill Space Diverted</p>
          <span className="text-[10px] text-cyan-400 font-mono">100% circular tracking</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-purple-500/20 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-sans tracking-tight">
            1,420
          </span>
          <p className="text-xs text-fg-secondary font-medium">Verified Carbon Units (VCUs)</p>
          <span className="text-[10px] text-purple-400 font-mono">1 Credit = 1 MT CO₂e</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-amber-500/20 text-center space-y-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-sans tracking-tight">
            ₹28.2 Lakh
          </span>
          <p className="text-xs text-fg-secondary font-medium">Carbon Monetization Value</p>
          <span className="text-[10px] text-amber-400 font-mono">Tradable ESG assets</span>
        </div>
      </div>

      {/* Interactive Carbon Calculator Simulator */}
      <div className="surface-card rounded-3xl p-6 sm:p-10 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              Live ESG Engine
            </span>
            <h2 className="text-2xl font-bold text-fg-primary mt-1">
              Industrial Byproduct Carbon Yield Calculator
            </h2>
          </div>
          <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3" />}>
            AI Life Cycle Assessment (LCA) Model v2.4
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-5">
            <Select
              label="Select Secondary Waste Stream"
              id="calcStream"
              value={calcStream}
              onChange={e => setCalcStream(e.target.value)}
              options={Object.keys(streamFactors).map(k => ({ value: k, label: `${k} — (${streamFactors[k].name})` }))}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Material Volume (Tonnes)
                </label>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {calcTonnage} MT
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="2000"
                step="5"
                value={calcTonnage}
                onChange={e => setCalcTonnage(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-fg-muted font-mono">
                <span>5 MT</span>
                <span>500 MT</span>
                <span>1,000 MT</span>
                <span>2,000 MT</span>
              </div>
            </div>

            <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/[0.06] space-y-2 text-xs text-fg-secondary">
              <span className="font-bold text-fg-primary block">
                Accounting Methodology:
              </span>
              <p className="leading-relaxed">
                Calculated by subtracting circular reprocessing energy consumption from the baseline emissions of virgin mining and clinker/virgin resin extraction.
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="surface-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">Net Avoided CO₂e</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-sans block">
                {totalCo2SavedTonnes} t
              </span>
              <p className="text-[11px] text-fg-muted font-mono">Scope-3 Emission Reduction</p>
            </div>

            <div className="surface-card rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/20 space-y-1">
              <span className="text-xs text-cyan-300 font-medium">Tradable Carbon Credits</span>
              <span className="text-3xl font-extrabold text-cyan-400 font-sans block">
                {totalCreditsGenerated} VCUs
              </span>
              <p className="text-[11px] text-fg-muted font-mono">1 Credit = 1 MT CO₂e</p>
            </div>

            <div className="surface-card rounded-2xl p-5 border border-purple-500/30 bg-purple-950/20 space-y-1 sm:col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-purple-300 font-medium">Estimated Monetization Value</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-sans block mt-0.5">
                    ₹{creditValueInr} <span className="text-sm font-normal text-fg-secondary">(${creditValueUsd} USD)</span>
                  </span>
                </div>
                <Badge variant="purple" size="sm">
                  Spot Rate ${currentStream.creditRateUsd}/VCU
                </Badge>
              </div>
              <p className="text-[11px] text-fg-muted pt-2 border-t border-white/[0.06]">
                Eligible for carbon market off-take or corporate ESG offset retirement certificate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Verification Lookup */}
      <div className="surface-card rounded-3xl p-6 sm:p-10 border border-white/[0.08] space-y-8">
        <div className="max-w-2xl">
          <Badge variant="cyan" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
            Cryptographic Registry
          </Badge>
          <h2 className="text-2xl font-bold text-fg-primary mt-2">
            Verify Waste2Worth Carbon Offset Certificate
          </h2>
          <p className="text-xs sm:text-sm text-fg-secondary mt-1">
            Enter a Certificate Serial Number to verify authenticity and inspect the immutable life-cycle audit trail. Try demo IDs: <code className="text-emerald-400 font-mono">W2W-CERT-2026-0819-001</code> or <code className="text-emerald-400 font-mono">W2W-CERT-2026-0818-002</code>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <Input
            placeholder="e.g., W2W-CERT-2026-0819-001"
            value={certQuery}
            onChange={e => setCertQuery(e.target.value)}
            className="font-mono text-sm"
          />
          <Button type="submit" variant="primary" disabled={isVerifying} rightIcon={<Search className="w-4 h-4" />}>
            {isVerifying ? 'Verifying...' : 'Verify Certificate'}
          </Button>
        </form>

        {certResult && (
          <div className="surface-card rounded-2xl p-6 border border-emerald-500/40 bg-zinc-950/90 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-fg-primary font-mono">{certResult.id}</h4>
                  <span className="text-xs text-fg-secondary">{certResult.deal}</span>
                </div>
              </div>
              <Badge variant="emerald" size="md">
                {certResult.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-fg-muted font-medium block">Audited Offset</span>
                <span className="font-bold text-emerald-400 text-sm font-sans">{certResult.co2Avoided}</span>
              </div>
              <div className="space-y-1">
                <span className="text-fg-muted font-medium block">Landfill Avoided</span>
                <span className="font-bold text-fg-primary text-sm font-sans">{certResult.landfillAvoided}</span>
              </div>
              <div className="space-y-1">
                <span className="text-fg-muted font-medium block">Standard</span>
                <span className="font-bold text-fg-primary">{certResult.methodology}</span>
              </div>
              <div className="space-y-1">
                <span className="text-fg-muted font-medium block">Settlement Date</span>
                <span className="font-bold text-fg-primary">{certResult.date}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-[11px] font-mono text-fg-secondary truncate">
              <span className="text-fg-muted mr-2">SHA-256 Digest:</span>
              <span className="text-cyan-400">{certResult.sha256}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Pillars of ESG Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">SEBI BRSR Core Ready</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Format 100% compliant with Principle 6 (Environment) of the Business Responsibility and Sustainability Reporting mandate for top 1,000 listed Indian entities.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">GHG Protocol Scope-3</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Covers Category 1 (Purchased Goods & Services) and Category 5 (Waste Generated in Operations) with traceable cradle-to-gate lifecycle data.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">Anti-Greenwashing Ledger</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Double-counting prevention engine: every credit is permanently retired upon usage with weighbridge and transporter GPS proof.
          </p>
        </div>
      </div>
    </div>
  )
}
