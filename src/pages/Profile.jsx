import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import { Badge } from '../components/Badge'
import {
  Building2,
  ShieldCheck,
  Award,
  Bell,
  Key,
  Trash2,
  CheckCircle2,
  FileCheck,
  UploadCloud,
  Save,
  Globe,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Organization Profile', icon: Building2 },
    { id: 'compliance', label: 'KYC & Environmental Certifications', icon: Award },
    { id: 'security', label: 'Security & Access', icon: Key },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
  ]

  const handleSave = e => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }, 600)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ─── Top Header ─── */}
      <div className="space-y-1 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
            Organization Profile & Settings
          </h1>
          <Badge variant="emerald" size="sm" dot>
            Verified Partner
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-fg-secondary">
          Manage your verified manufacturing facility credentials, tax GSTIN compliance, and tender notification channels.
        </p>
      </div>

      {/* ─── Modern Sub-Nav Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0
                ${
                  activeTab === tab.id
                    ? 'bg-white/[0.08] text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                    : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.03]'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Tab 1: Organization Profile ─── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Company Hero Profile Capsule */}
          <div className="surface-card rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-emerald-950 text-2xl font-extrabold shadow-lg shrink-0">
                SC
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-fg-primary">
                    SteelCycle Industries Pvt. Ltd.
                  </h2>
                  <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                    GST Verified: 27AABCS1234A1Z5
                  </Badge>
                </div>
                <p className="text-xs text-fg-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-fg-muted" /> MIDC Taloja, Navi Mumbai, Maharashtra • Secondary Metallurgy Hub
                </p>
                <div className="flex items-center gap-4 text-[11px] text-fg-muted pt-1 flex-wrap font-mono">
                  <span>🏭 50+ Workforce</span>
                  <span>📦 34 Closed Contracts</span>
                  <span>⭐ 4.9 ESG Score</span>
                  <span className="text-emerald-400 font-semibold">🌱 42 MT CO₂ Abated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <h3 className="text-sm font-bold text-fg-primary uppercase tracking-wider">
              Legal Entity & Factory Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Legal Name"
                id="co-name"
                defaultValue="SteelCycle Industries Pvt. Ltd."
              />
              <Input
                label="GSTIN Number"
                id="co-gstin"
                defaultValue="27AABCS1234A1Z5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Industry Segment"
                id="co-segment"
                defaultValue="Secondary Steel & Slag Aggregates"
              />
              <Input
                label="Estimated Monthly Byproduct Volume"
                id="co-vol"
                defaultValue="500 – 1,000 Tonnes"
              />
            </div>

            <Input
              label="Manufacturing & Dispatch Plant Address"
              id="co-address"
              defaultValue="Plot 42, MIDC Taloja Industrial Area, Navi Mumbai, Maharashtra 410208"
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Website"
                id="co-web"
                defaultValue="https://steelcycle.in"
                leftIcon={<Globe className="w-4 h-4" />}
              />
              <Input
                label="Procurement Desk Phone"
                id="co-phone"
                defaultValue="+91 22 2740 8888"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <Textarea
              label="Company Capability & Recycling Summary"
              id="co-bio"
              rows={3}
              defaultValue="SteelCycle operates secondary blast furnace processing converting slag, mill scale, and industrial scrap into construction-grade aggregates and billets. ISO 14001:2015 certified."
            />

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Profile credentials updated successfully.
                </span>
              ) : (
                <span className="text-xs text-fg-muted">Changes reflect across all published listings.</span>
              )}

              <Button type="submit" size="md" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Tab 2: Compliance & Regulatory Certifications ─── */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-6">
            <div>
              <h3 className="text-sm font-bold text-fg-primary uppercase tracking-wider">
                State & Central Environmental Clearances
              </h3>
              <p className="text-xs text-fg-secondary mt-0.5">
                Maintain active clearances to be eligible for enterprise bidding above ₹5,00,000.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: 'ISO 14001:2015',
                  body: 'Environmental Management System',
                  status: 'Valid until Dec 2027',
                  verified: true,
                },
                {
                  name: 'CPCB Industrial Authorization',
                  body: 'Central Pollution Control Board',
                  status: 'Valid until Aug 2026',
                  verified: true,
                },
                {
                  name: 'Maharashtra SPCB Consent to Operate',
                  body: 'Water & Air Act Compliance',
                  status: 'Renewal Submitted',
                  verified: false,
                },
                {
                  name: 'R2 Responsible Recycling Standard',
                  body: 'Sustainable Electronics & Metal Protocol',
                  status: 'Audit in Progress',
                  verified: false,
                },
              ].map(cert => (
                <div
                  key={cert.name}
                  className="surface-card rounded-2xl p-4 border border-white/[0.08] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className={`w-4 h-4 ${cert.verified ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <h4 className="text-xs font-bold text-fg-primary">{cert.name}</h4>
                    </div>
                    <p className="text-[11px] text-fg-secondary">{cert.body}</p>
                    <span className="text-[10px] text-fg-muted font-mono block pt-1">
                      {cert.status}
                    </span>
                  </div>

                  <Badge variant={cert.verified ? 'emerald' : 'amber'} size="sm">
                    {cert.verified ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Upload Certificate Action */}
            <div className="pt-2">
              <Button size="sm" variant="secondary" leftIcon={<UploadCloud className="w-4 h-4" />}>
                Upload New Certification Document (.pdf)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 3: Security & Access ─── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account Security & Credentials</CardTitle>
              <CardDescription>Update your master account login password and 2FA settings.</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Authorized Officer Name" id="auth-name" defaultValue="Sachin Chaudhary" />
                <Input label="Registered Security Email" id="auth-email" defaultValue="sachin@steelcycle.in" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                <Input label="Current Password" id="curr-pw" type="password" placeholder="••••••••••••" />
                <Input label="New Master Password" id="new-pw" type="password" placeholder="••••••••••••" />
              </div>
            </CardBody>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button size="sm" variant="primary">Update Password</Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <div className="surface-card rounded-2xl p-6 border border-rose-500/30 bg-rose-950/10 space-y-3">
            <h3 className="text-sm font-bold text-rose-400">Danger Zone: Decommission Account</h3>
            <p className="text-xs text-fg-secondary leading-relaxed">
              Once an enterprise account is deleted, all active byproduct tenders, escrow ledger records, and scope-3 audit certificates are permanently expunged.
            </p>
            <Button size="sm" variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Decommission Organization
            </Button>
          </div>
        </div>
      )}

      {/* ─── Tab 4: Alert Preferences ─── */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tender & Sourcing Alert Channels</CardTitle>
            <CardDescription>Select which real-time notifications you receive via email and instant SMS.</CardDescription>
          </CardHeader>

          <CardBody className="space-y-3 divide-y divide-white/[0.06]">
            {[
              { title: 'New bids on your inventory lots', desc: 'Instant alert when a buyer submits a purchase tender', def: true },
              { title: 'AI Material Match Alerts', desc: 'When new matching streams within 250km are published', def: true },
              { title: 'Escrow Milestone Settlements', desc: 'Instant weighbridge receipt confirmation and escrow release', def: true },
              { title: 'Weekly Secondary Market Spot Digest', desc: 'Pricing shifts and supply demand trends across industrial sectors', def: false },
            ].map(item => (
              <div key={item.title} className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-semibold text-fg-primary">{item.title}</h4>
                  <p className="text-[11px] text-fg-muted">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" defaultChecked={item.def} className="sr-only peer" />
                  <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
                </label>
              </div>
            ))}
          </CardBody>

          <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
            <Button size="sm" variant="primary">Save Alert Preferences</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
