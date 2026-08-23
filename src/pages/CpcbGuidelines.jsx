import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import {
  ShieldCheck,
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Search,
  ExternalLink,
  BookOpen,
  Scale,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react'

export default function CpcbGuidelines() {
  const [searchFilter, setSearchFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const guidelines = [
    {
      id: 'hwmr-2016',
      title: 'Hazardous & Other Wastes (Management & Transboundary Movement) Rules',
      authority: 'CPCB / MoEFCC',
      category: 'Hazardous Waste',
      effectiveYear: '2016 (Amended 2022)',
      summary: 'Mandates strict Form 9 (Transport Emergency Card / TREMCARD), Form 10 (Manifest for hazardous waste), and authorization from State Pollution Control Board for inter-state movement.',
      rules: [
        'Mandatory 7-copy Form 10 physical & digital color-coded manifest',
        'Authorized GPS-tracked containment transport with valid HAZCHEM signage',
        'Storage limit: Not exceeding 90 days on industrial premises without SPCB waiver',
        'Mandatory authorization under Rule 6 for recycling/reprocessing units'
      ],
      badgeColor: 'rose'
    },
    {
      id: 'pwmr-2022',
      title: 'Plastic Waste Management Rules & EPR Guidelines',
      authority: 'CPCB Portal',
      category: 'Plastic Waste',
      effectiveYear: '2022',
      summary: 'Defines four categories of plastics (Rigid, Flexible, Multi-layer, Biodegradable) and enforces mandatory Extended Producer Responsibility (EPR) recycling quotas on Brand Owners & Recyclers.',
      rules: [
        'Mandatory central EPR registration on centralized CPCB online portal',
        'Minimum 50% post-consumer recycled (PCR) content targets for category I rigid plastics',
        'Prohibition on single-use plastics below 120 microns thickness',
        'Quarterly filing of certificate transfers and verified plastic credits'
      ],
      badgeColor: 'cyan'
    },
    {
      id: 'ewaste-2022',
      title: 'E-Waste (Management) Rules — Schedule I & II',
      authority: 'MoEFCC',
      category: 'E-Waste',
      effectiveYear: '2022 (Effective 2023)',
      summary: 'Regulates 106 categories of electrical & electronic equipment. Restricts hazardous substances (RoHS threshold for lead, mercury, cadmium, hexavalent chromium).',
      rules: [
        'End-of-life precious metal extraction allowed only in R2/CPCB registered refineries',
        'E-Waste EPR certificates trading strictly mapped to verified recycling capacity',
        'Mandatory annual return filing under Form 3 by June 30 every fiscal year',
        'Traceability requirement down to component recycling fractions'
      ],
      badgeColor: 'purple'
    },
    {
      id: 'flyash-2021',
      title: 'Fly Ash Utilization Notification for Thermal Power Stations',
      authority: 'CPCB / CEA',
      category: 'Construction & Ash',
      effectiveYear: '2021 (100% Target)',
      summary: 'Mandates 100% utilization of coal and lignite fly ash in cement, concrete, bricks, road embankments, and mine stowing within 300 km radius of thermal plants.',
      rules: [
        'Free supply of fly ash to brick/tile makers within 100 km radius',
        'Mandatory 25% fly ash usage in government road construction & NHAI projects',
        'Ecological compensation of ₹1,000 per tonne on unutilized legacy ash mounds',
        'Daily acoustic and dry silo monitoring to prevent fugitive dust emissions'
      ],
      badgeColor: 'amber'
    },
    {
      id: 'batteries-2022',
      title: 'Battery Waste Management Rules (Lead Acid & Lithium-Ion)',
      authority: 'CPCB',
      category: 'Metals & Energy',
      effectiveYear: '2022',
      summary: 'Covers EV batteries, industrial batteries, and portable accumulators with target recovery rates of 90% for Lead, 70% for Cobalt & Nickel, and 80% for Lithium by 2026.',
      rules: [
        'Prohibition of battery disposal in landfills and incineration',
        'Unique serial tracking for EV traction battery packs',
        'Mandatory EPR certificate generation on CPCB Battery Portal',
        'Only secondary pyrometallurgical & hydrometallurgical smelters authorized'
      ],
      badgeColor: 'emerald'
    },
    {
      id: 'cdwm-2016',
      title: 'Construction & Demolition (C&D) Waste Management Rules',
      authority: 'MoUD / CPCB',
      category: 'Construction & Ash',
      effectiveYear: '2016',
      summary: 'Governs processing of concrete debris, steel rebar scrap, soil, and aggregate for production of manufactured sand (M-Sand) and paver blocks.',
      rules: [
        'Waste generator waste management plan required for >20 tonnes/day projects',
        'Segregation at source into concrete, metal, wood, and mixed inert fractions',
        'Mandatory 10-20% recycled aggregate in municipal procurement projects'
      ],
      badgeColor: 'zinc'
    }
  ]

  const filtered = guidelines.filter(g => {
    const matchesCat = activeCategory === 'all' || g.category.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesSearch = g.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          g.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          g.category.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            CPCB & SPCB Regulatory Framework
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Statutory Environmental Compliance & Guidelines
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Waste2Worth aligns all secondary raw material trades with the Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change (MoEFCC), and respective State Pollution Control Boards (SPCB).
        </p>
      </div>

      {/* Compliance Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-zinc-950/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">100% CPCB Form 10 Automation</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Digital manifest generation for hazardous materials with pre-filled CTE/CTO numbers, transporter authorization, and QR-code verification.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-zinc-950/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">EPR Certificate Registry</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Automated generation and transfer of Extended Producer Responsibility (EPR) credit proofs mapped to certified recyclers across 28 states.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-zinc-950/80 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">Zero Non-Compliance Escrow</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Tender funds are released only when digital weighbridge slips, SPCB passes, and laboratory purity test reports are approved.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card rounded-2xl p-5 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'Hazardous', 'Plastic', 'E-Waste', 'Construction', 'Metals'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-800/80 text-fg-secondary hover:text-fg-primary hover:bg-zinc-700'
              }`}
            >
              {cat === 'all' ? 'All Regulations' : cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search regulations & guidelines..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            size="sm"
          />
        </div>
      </div>

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 flex flex-col justify-between gap-5 group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <Badge variant={item.badgeColor} size="sm">
                  {item.category}
                </Badge>
                <span className="text-[11px] font-mono text-fg-muted font-semibold">
                  {item.effectiveYear}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-fg-primary group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs font-semibold text-emerald-400 block mt-1">
                  Enforcing Body: {item.authority}
                </span>
              </div>

              <p className="text-xs text-fg-secondary leading-relaxed">
                {item.summary}
              </p>

              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-bold text-fg-primary uppercase tracking-wider block">
                  Mandatory Platform Checkpoints:
                </span>
                <ul className="space-y-1.5 text-xs text-fg-secondary">
                  {item.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-fg-muted">
                CPCB Compliant Exchange Verified
              </span>
              <a
                href="https://cpcb.nic.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>CPCB Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* CTA section */}
      <div className="surface-card rounded-3xl p-8 border border-emerald-500/20 text-center space-y-4 bg-gradient-to-r from-emerald-950/20 via-zinc-950 to-cyan-950/20">
        <h3 className="text-xl sm:text-2xl font-bold text-fg-primary">
          Need a Custom SPCB Consented Material Transfer Protocol?
        </h3>
        <p className="text-xs sm:text-sm text-fg-secondary max-w-xl mx-auto">
          Our in-house environmental compliance desk assists with Form 10 manifests, CTE/CTO verifications, and inter-state hazmat transport permissions.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/marketplace">
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Compliant Lots
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary">
              Upload Industrial SPCB Consent (CTO)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
