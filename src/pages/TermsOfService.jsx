import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Scale, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, FileText } from 'lucide-react'

export default function TermsOfService() {
  const lastUpdated = 'August 21, 2026'

  const sections = [
    {
      id: 'eligibility',
      title: '1. Commercial Master Agreement & Eligibility',
      content: `• These Terms of Service constitute a legally binding Commercial Master Agreement between Waste2Worth Technologies Private Limited and your corporate enterprise.
• Access to the platform is restricted exclusively to registered businesses possessing valid Indian GSTIN, PAN, and, where applicable, valid State Pollution Control Board (SPCB) Consents to Operate (CTO).
• Individuals acting on behalf of an enterprise represent and warrant that they possess legal corporate authority to execute high-volume contracts and financial escrow mandates.`
    },
    {
      id: 'listings-bids',
      title: '2. Listings, Tenders & Bidding Conduct',
      content: `• Sellers must ensure that material descriptions, hazard levels, physical condition, and chemical purity metrics represent accurate, verifiable facts.
• Placing a bid constitutes an irrevocable commercial offer. Upon seller acceptance, the buyer is legally obligated to deposit the full gross contract amount into the designated tripartite escrow account within 48 banking hours.
• Artificial bid suppression, collusion, price manipulation, or unauthorized cancellation of accepted tenders will result in immediate forfeiture of security deposits and permanent platform ban.`
    },
    {
      id: 'escrow-payment',
      title: '3. Smart Escrow Settlement & Payment Flow',
      content: `• All transactions on Waste2Worth are settled exclusively through RBI-regulated nodal escrow banking channels.
• Funds remain locked until the buyer confirms physical consignment arrival, gross weighbridge slip upload, and absence of critical assay discrepancy.
• The platform charges a standard escrow facilitation fee of 0.75% of the total gross transaction value, automatically deducted upon payout release.`
    },
    {
      id: 'quality-arbitration',
      title: '4. Weight Discrepancies & Chemical Assay Arbitration',
      content: `• Standard Weight Allowance: Weight variances up to ±2% between origin and destination weighbridges (attributable to transit moisture or atmospheric exposure) are settled pro-rata against the final payment ticket.
• Major Impurity Discrepancies: If chemical purity deviates significantly from the listing specification, the buyer must raise a formal dispute within 24 hours of weighbridge check-in.
• Disputed lots will be sampled by an independent NABL-accredited laboratory whose technical findings shall be binding on both parties.`
    },
    {
      id: 'environmental-liability',
      title: '5. Hazardous Waste & Environmental Indemnity',
      content: `• Compliance with Hazardous and Other Wastes Management Rules (HWMR 2016) and Plastic Waste Management Rules (PWMR 2022) is non-negotiable.
• The waste generator (seller) and waste receiver (buyer) remain statutory custodians of the material under the Environment (Protection) Act, 1986. Waste2Worth functions as an electronic transaction facilitator and does not take physical ownership of hazardous consignments.`
    },
    {
      id: 'jurisdiction',
      title: '6. Governing Law & Dispute Jurisdiction',
      content: `• This Agreement is governed by the laws of the Republic of India.
• Any unresolved commercial dispute arising out of or in connection with this contract shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, with the seat of arbitration located at New Delhi, India.`
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="md" icon={<Scale className="w-3.5 h-3.5" />}>
            B2B Commercial Master Agreement
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fg-primary tracking-tight">
          Terms of Service & Commercial Master Rules
        </h1>
        <div className="flex items-center gap-4 text-xs text-fg-muted font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Last Updated: {lastUpdated}
          </span>
          <span>•</span>
          <span>Legal Edition 4.1</span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="surface-card rounded-2xl p-6 border border-cyan-500/20 bg-cyan-950/20 space-y-2">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
          Commercial Undertaking Summary
        </h3>
        <p className="text-xs text-fg-secondary leading-relaxed">
          Waste2Worth guarantees a transparent, legally protected marketplace for secondary raw materials. By bidding or listing on the platform, enterprise users commit to fair assay reporting, prompt escrow funding, and complete CPCB statutory adherence.
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <h2 className="text-lg font-bold text-fg-primary">
              {section.title}
            </h2>
            <div className="text-xs sm:text-sm text-fg-secondary leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Legal Helpdesk Contact */}
      <div className="surface-card rounded-2xl p-6 border border-white/[0.08] bg-zinc-950 space-y-3 text-xs text-fg-secondary">
        <h3 className="text-base font-bold text-fg-primary">
          Legal & Compliance Department
        </h3>
        <p>
          For customized bipartite trade agreements, large-volume annual off-take memorandums, or regulatory queries, please contact <code className="text-emerald-400 font-mono">legal@waste2worth.in</code>.
        </p>
      </div>
    </div>
  )
}
