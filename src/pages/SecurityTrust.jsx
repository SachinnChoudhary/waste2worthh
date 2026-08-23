import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Building2,
  Users,
  Eye,
  Award
} from 'lucide-react'

export default function SecurityTrust() {
  const securityPillars = [
    {
      title: 'Enterprise Encryption at Rest & in Transit',
      description: 'All sensitive transactional data, contracts, and financial documents are encrypted using AES-256 at rest and TLS 1.3 in transit with strict Perfect Forward Secrecy (PFS).',
      badge: 'AES-256 & TLS 1.3',
      badgeColor: 'emerald',
      icon: Lock
    },
    {
      title: 'Automated KYC & GSTIN Verification',
      description: 'Every seller and buyer undergoes automated real-time verification against the GSTN government database, MCA corporate registry, and CPCB SPCB consent certificates.',
      badge: 'Government Verified',
      badgeColor: 'cyan',
      icon: Building2
    },
    {
      title: 'Immutable Ledger & Audit Trails',
      description: 'Every tender, bid negotiation, laboratory assay, and escrow release is cryptographically signed and stored in append-only audit tables with tamper-evident hashing.',
      badge: 'Audit Ready',
      badgeColor: 'purple',
      icon: Database
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      description: 'Fine-grained permissions ensure procurement leads, sustainability officers, weighbridge operators, and finance controllers access only authorized operational data.',
      badge: 'Zero-Trust RBAC',
      badgeColor: 'amber',
      icon: Key
    }
  ]

  const certifications = [
    { name: 'SOC-2 Type II Certified', issuer: 'Independent AICPA Audit', desc: 'Verified controls for security, availability, and confidentiality.' },
    { name: 'ISO/IEC 27001:2022', issuer: 'Information Security Management', desc: 'Global benchmark for enterprise data protection and disaster recovery.' },
    { name: 'CPCB Authorized Platform', issuer: 'Ministry of Environment (MoEFCC)', desc: 'Authorized secondary raw material trading and EPR exchange protocol.' },
    { name: 'RBI Compliant Escrow', issuer: 'Nodal Banking Partners (ICICI/HDFC)', desc: '100% compliant with RBI Master Directions on Online Payment Intermediaries.' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Bank-Grade Security Architecture
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Security, Compliance & Industrial Trust
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Waste2Worth is engineered to meet the stringent security, environmental, and corporate governance standards of Fortune 500 manufacturing conglomerates and heavy industry.
        </p>
      </div>

      {/* Trust Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-6 border border-emerald-500/20 text-center space-y-1">
          <span className="text-3xl font-extrabold text-emerald-400 font-sans tracking-tight">99.98%</span>
          <p className="text-xs text-fg-secondary font-medium">Platform Uptime SLA</p>
          <span className="text-[10px] text-emerald-400 font-mono">Multi-region redundancy</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-cyan-500/20 text-center space-y-1">
          <span className="text-3xl font-extrabold text-cyan-400 font-sans tracking-tight">100%</span>
          <p className="text-xs text-fg-secondary font-medium">KYC & GSTIN Verified</p>
          <span className="text-[10px] text-cyan-400 font-mono">Zero unverified accounts</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-purple-500/20 text-center space-y-1">
          <span className="text-3xl font-extrabold text-purple-400 font-sans tracking-tight">₹0</span>
          <p className="text-xs text-fg-secondary font-medium">Escrow Settlement Loss</p>
          <span className="text-[10px] text-purple-400 font-mono">100% Guaranteed Payouts</span>
        </div>

        <div className="surface-card rounded-2xl p-6 border border-amber-500/20 text-center space-y-1">
          <span className="text-3xl font-extrabold text-amber-400 font-sans tracking-tight">256-bit</span>
          <p className="text-xs text-fg-secondary font-medium">End-to-End Encryption</p>
          <span className="text-[10px] text-amber-400 font-mono">Military grade security</span>
        </div>
      </div>

      {/* 4 Pillars of Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityPillars.map(p => {
          const Icon = p.icon
          return (
            <div
              key={p.title}
              className="surface-card rounded-3xl p-8 border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant={p.badgeColor} size="sm">
                    {p.badge}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-fg-primary">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Certifications and Compliance Standards */}
      <div className="surface-card rounded-3xl p-8 border border-white/[0.08] space-y-8">
        <div className="max-w-2xl">
          <Badge variant="purple" size="sm" icon={<Award className="w-3 h-3" />}>
            Statutory Certifications
          </Badge>
          <h2 className="text-2xl font-bold text-fg-primary mt-2">
            Enterprise Compliance & Auditing Badges
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map(c => (
            <div key={c.name} className="p-5 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-2">
              <span className="text-sm font-bold text-fg-primary block">{c.name}</span>
              <span className="text-[11px] font-semibold text-emerald-400 block">{c.issuer}</span>
              <p className="text-xs text-fg-secondary leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
