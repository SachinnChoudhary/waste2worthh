import { useState } from 'react'
import { Badge } from '../components/Badge'
import { ShieldCheck, Lock, FileText, CheckCircle2, Building2, Mail, Phone, Calendar } from 'lucide-react'

export default function PrivacyPolicy() {
  const lastUpdated = 'August 21, 2026'

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: `We collect information necessary to operate a compliant B2B industrial byproduct marketplace:
• Corporate Identity & KYC: Company legal name, CIN, GSTIN, PAN, registered office address, and authorized signatory credentials.
• Environmental & Regulatory Records: SPCB Consent to Establish (CTE), Consent to Operate (CTO), Hazardous Waste Authorization (HWA) certificates, and CPCB EPR registration identifiers.
• Material Specifications & Assays: Chemical composition, MSDS documentation, batch test sheets, and weighbridge telemetry.
• Commercial & Financial Data: Nodal escrow banking details, RTGS transaction receipts, and digital invoice manifests.`
    },
    {
      id: 'usage',
      title: '2. Purpose of Data Processing',
      content: `Your data is processed strictly for legitimate corporate purposes under the Digital Personal Data Protection Act (DPDP Act 2023):
• Matchmaking & AI Valuation: Utilizing chemical specifications and historic trade volumes to predict fair secondary raw material valuations.
• Statutory Compliance: Generating mandatory CPCB Form 10 manifests and SEBI BRSR Principle 6 carbon audit certificates.
• Smart Escrow Settlement: Facilitating secure tripartite fund locking and release upon weighbridge verification.
• Platform Security: Detecting duplicate bids, price cartels, and unauthorized hazardous material transfers.`
    },
    {
      id: 'protection',
      title: '3. Data Security & Storage Architecture',
      content: `All collected data is stored in ISO 27001 and SOC-2 Type II certified cloud infrastructure located in Mumbai, India (ap-south-1).
• Data at rest is encrypted using 256-bit Advanced Encryption Standard (AES-256).
• Data in transit is secured using Transport Layer Security (TLS 1.3).
• Regular automated vulnerability assessments, penetration tests, and immutable database audit logging.`
    },
    {
      id: 'disclosure',
      title: '4. Third-Party Disclosures',
      content: `Waste2Worth does not sell, rent, or trade enterprise operational data to third-party advertisers. Data is shared solely with:
• Statutory Authorities: CPCB, State Pollution Control Boards, and Ministry of Environment when legally mandated.
• Nodal Banking Partners: RBI-regulated escrow banks (ICICI / HDFC) for trade settlement execution.
• Independent Assayers: NABL-accredited test laboratories during formal quality arbitration.`
    },
    {
      id: 'rights',
      title: '5. Enterprise Rights & Data Governance',
      content: `Authorized corporate representatives hold statutory rights under the DPDP Act 2023:
• Right to Access & Correction: View and update company KYC, GSTIN, and operational contact records.
• Right to Data Portability: Export complete historical transaction logs, weighbridge tickets, and carbon offset certificates.
• Right to Erasure: Request account decommissioning post completion and financial audit clearance of all active escrow trades.`
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            DPDP Act 2023 & GDPR Compliant
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fg-primary tracking-tight">
          Enterprise Privacy Policy & Data Governance
        </h1>
        <div className="flex items-center gap-4 text-xs text-fg-muted font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Last Updated: {lastUpdated}
          </span>
          <span>•</span>
          <span>Version 3.2</span>
        </div>
      </div>

      {/* Summary Box */}
      <div className="surface-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/20 space-y-2">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
          Privacy Commitment at a Glance
        </h3>
        <p className="text-xs text-fg-secondary leading-relaxed">
          Waste2Worth treats all industrial waste formulations, pricing negotiations, and enterprise off-take volumes as strictly confidential proprietary trade data. All data resides exclusively within Indian sovereign data centers.
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

      {/* Grievance Officer */}
      <div className="surface-card rounded-2xl p-6 border border-white/[0.08] bg-zinc-950 space-y-4">
        <h3 className="text-base font-bold text-fg-primary">
          Data Protection & Grievance Redressal Officer
        </h3>
        <p className="text-xs text-fg-secondary leading-relaxed">
          In accordance with the Information Technology Act 2000 and DPDP Act 2023, the details of the Grievance Officer for Waste2Worth are:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-fg-secondary">
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1">
            <span className="text-fg-muted block">Officer Name</span>
            <span className="font-bold text-fg-primary block">Aditya Sen, Chief Compliance Officer</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1">
            <span className="text-fg-muted block">Email Inquiries</span>
            <span className="font-bold text-emerald-400 block font-mono">privacy@waste2worth.in</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.06] space-y-1">
            <span className="text-fg-muted block">Corporate Office</span>
            <span className="font-bold text-fg-primary block">Cyber City, Gurugram, Haryana 122002</span>
          </div>
        </div>
      </div>
    </div>
  )
}
