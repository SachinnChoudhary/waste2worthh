import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Scale,
  DollarSign,
  Building2,
  Sparkles,
  ChevronRight,
  Clock,
  RotateCcw
} from 'lucide-react'

export default function EscrowSettlement() {
  const [tradeAmount, setTradeAmount] = useState(2500000)

  const escrowFee = Math.round(tradeAmount * 0.0075) // 0.75%
  const sellerPayout = tradeAmount - escrowFee

  const workflowSteps = [
    {
      step: '01',
      title: 'Tender Acceptance & Fund Locking',
      subtitle: 'Buyer deposits 100% funds into Escrow Account',
      description: 'Upon bid acceptance, buyer transfers invoice amount into an RBI-regulated tripartite escrow account (ICICI / HDFC Bank). Seller receives instant irrevocable fund guarantee.',
      badge: 'Escrow Held',
      badgeColor: 'amber',
      icon: Lock
    },
    {
      step: '02',
      title: 'Dispatch & GPS In-Transit Monitoring',
      subtitle: 'Seller dispatches consignment with Form 10',
      description: 'Transporter picks up material with digital gate pass and tare weighbridge ticket. Consignment is tracked via Waste2Worth real-time GPS telemetry.',
      badge: 'In Transit',
      badgeColor: 'cyan',
      icon: Truck
    },
    {
      step: '03',
      title: 'Weighbridge & Quality Assay Verification',
      subtitle: 'Buyer inspects purity & gross tonnage',
      description: 'Upon factory arrival, buyer conducts gross weight check and moisture/purity assay within 24 hours. Digital inspection pass automatically triggers release mandate.',
      badge: 'Inspection Passed',
      badgeColor: 'purple',
      icon: Scale
    },
    {
      step: '04',
      title: 'Automated Immediate Fund Release',
      subtitle: 'Seller account credited instantly via RTGS',
      description: 'Smart contract triggers automated bank payout directly into seller registered current account. Immutable carbon certificate and tax invoice generated simultaneously.',
      badge: 'Payout Released',
      badgeColor: 'emerald',
      icon: CheckCircle2
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            RBI-Regulated Tripartite Escrow
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Smart Industrial Escrow & Guaranteed Settlements
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Zero payment defaults for sellers, zero adulterated deliveries for buyers. Our milestone-based escrow locks commercial payments until digital weighbridge and laboratory assay sign-off.
        </p>
      </div>

      {/* 4-Step Interactive Workflow */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            Step-by-Step Security Protocol
          </span>
          <h2 className="text-2xl font-bold text-fg-primary mt-1">
            How Waste2Worth Smart Escrow Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="surface-card rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-200 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {item.step}
                    </span>
                    <Badge variant={item.badgeColor} size="sm">
                      {item.badge}
                    </Badge>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-fg-primary group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-400/90 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-fg-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Escrow Fee & Timeline Simulator */}
      <div className="surface-card rounded-3xl p-6 sm:p-10 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <Badge variant="cyan" size="sm">
              Fee & Settlement Simulator
            </Badge>
            <h2 className="text-2xl font-bold text-fg-primary mt-1">
              Calculate Transaction Escrow Protection
            </h2>
          </div>
          <span className="text-xs text-fg-secondary font-mono">
            Platform Fee: Flat 0.75% | Zero Wire Charges
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Contract Tender Value (INR)
                </label>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ₹{tradeAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="20000000"
                step="50000"
                value={tradeAmount}
                onChange={e => setTradeAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-fg-muted font-mono">
                <span>₹1 Lakh</span>
                <span>₹50 Lakhs</span>
                <span>₹1 Crore</span>
                <span>₹2 Crores</span>
              </div>
            </div>

            <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/[0.06] space-y-2 text-xs text-fg-secondary">
              <span className="font-bold text-fg-primary block">
                Guaranteed Protections Included:
              </span>
              <ul className="space-y-1 text-fg-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% upfront liquidity lock in nodal account</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free NABL Accredited Lab arbitration on assay dispute</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automatic GST compliance & E-Way bill generation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="surface-card rounded-2xl p-5 border border-white/[0.08] bg-zinc-900/60 space-y-1">
              <span className="text-xs text-fg-muted font-medium">Buyer Locked Deposit</span>
              <span className="text-2xl font-bold text-fg-primary font-sans block">
                ₹{tradeAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Protected in Escrow</span>
            </div>

            <div className="surface-card rounded-2xl p-5 border border-white/[0.08] bg-zinc-900/60 space-y-1">
              <span className="text-xs text-fg-muted font-medium">Escrow Security Fee (0.75%)</span>
              <span className="text-2xl font-bold text-cyan-400 font-sans block">
                ₹{escrowFee.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-fg-muted font-mono">Includes Insurance & Legal</span>
            </div>

            <div className="surface-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-1 sm:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-emerald-300 font-medium">Guaranteed Net Seller Payout</span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-sans block mt-0.5">
                    ₹{sellerPayout.toLocaleString('en-IN')}
                  </span>
                </div>
                <Badge variant="emerald" size="sm">
                  Settlement &lt; 24h
                </Badge>
              </div>
              <p className="text-[11px] text-fg-muted pt-2 border-t border-white/[0.06]">
                Instant RTGS payout credited immediately upon buyer gross weighbridge scan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Resolution Guarantee */}
      <div className="surface-card rounded-3xl p-8 border border-white/[0.08] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-fg-primary">
              NABL Laboratory Arbitration Protocol
            </h3>
            <p className="text-xs text-fg-secondary">
              Fair, automated dispute settlement for tonnage or impurity discrepancies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-fg-secondary leading-relaxed">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2">
            <span className="font-bold text-fg-primary text-sm block">1. 2% Tonnage Buffer</span>
            <p>
              Minor weight variances below 2% due to transit moisture loss are automatically adjusted against the final invoice using calibrated weighbridge slips.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2">
            <span className="font-bold text-fg-primary text-sm block">2. Third-Party Lab Testing</span>
            <p>
              In case of chemical purity or hazard variance, a sealed composite sample is sent to an independent NABL-accredited test laboratory within 48 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2">
            <span className="font-bold text-fg-primary text-sm block">3. Pro-Rata Re-pricing</span>
            <p>
              If assay results show lower active grade, the escrow smart contract dynamically adjusts the unit rate and refunds the difference to the buyer.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
