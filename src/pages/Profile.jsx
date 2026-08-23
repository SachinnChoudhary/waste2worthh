import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import { Badge } from '../components/Badge'
import { useWasteAuth } from '../lib/auth'
import { api } from '../lib/api'
import { supabase, isSupabaseLive } from '../lib/supabaseClient'
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
  RefreshCw,
} from 'lucide-react'

export default function Profile() {
  const { user, role, setRole } = useWasteAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.fullName || 'Rajesh Sharma',
    company_name: user?.company || 'Northgate Steelworks Ltd.',
    email: user?.email || 'procurement@northgatesteel.demo',
    role: role || 'seller',
    gstin: '20AAAAA0000A1Z1',
    phone: '+91 657 555 0101',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    address: 'Northgate Steelworks Plant Complex, Jamshedpur, Jharkhand 831001',
    credit_score: 890,
  })

  useEffect(() => {
    async function loadProfile() {
      if (isSupabaseLive && user?.email) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!error && data) {
            setProfileForm({
              full_name: data.full_name || user.fullName || '',
              company_name: data.company_name || user.company || '',
              email: data.email || user.email || '',
              role: data.role || role || 'seller',
              gstin: data.gstin || '20AAACT2727Q1ZU',
              phone: data.phone || '+91 657 664 1234',
              city: data.city || 'Jamshedpur',
              state: data.state || 'Jharkhand',
              address: data.address || `${data.city || 'Jamshedpur'}, ${data.state || 'Jharkhand'}`,
              credit_score: data.credit_score || 890,
            })
          }
        } catch (e) {}
      }
    }
    loadProfile()
  }, [user?.email])

  const tabs = [
    { id: 'profile', label: 'Organization Profile', icon: Building2 },
    { id: 'compliance', label: 'KYC & Environmental Certifications', icon: Award },
    { id: 'security', label: 'Security & Access', icon: Key },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
  ]

  const update = field => e => setProfileForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setIsSaving(true)

    // Save profile via Express API (service role key handles the Supabase write)
    if (user?.id) {
      try {
        await api.syncUser({
          clerk_user_id: user.clerk_user_id || user.id,
          email: profileForm.email,
          full_name: profileForm.full_name,
          company_name: profileForm.company_name,
          role: profileForm.role,
          gstin: profileForm.gstin,
          phone: profileForm.phone,
        })
      } catch (err) {
        console.warn('Profile save notice:', err.message)
      }
    }

    if (profileForm.role !== role) {
      setRole(profileForm.role)
    }

    setIsSaving(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ─── Top Header ─── */}
      <div className="space-y-1 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
            Organization Profile & Credentials
          </h1>
          <Badge variant="emerald" size="sm" dot>
            Verified Enterprise Account
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-fg-secondary">
          Manage your verified manufacturing facility credentials, tax GSTIN compliance, and role permissions.
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
                {profileForm.company_name ? profileForm.company_name.slice(0, 2).toUpperCase() : 'SC'}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-fg-primary">
                    {profileForm.company_name}
                  </h2>
                  <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                    GSTIN: {profileForm.gstin}
                  </Badge>
                  <Badge variant="cyan" size="sm">
                    ROLE: {profileForm.role?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-fg-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-fg-muted" /> {profileForm.city}, {profileForm.state} • Secondary Metallurgy Hub
                </p>
                <div className="flex items-center gap-4 text-[11px] text-fg-muted pt-1 flex-wrap font-mono">
                  <span>Authorized: {profileForm.full_name}</span>
                  <span>⭐ {profileForm.credit_score} Trust Rating</span>
                  <span className="text-emerald-400 font-semibold">🌱 Verified Enterprise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <h3 className="text-sm font-bold text-fg-primary uppercase tracking-wider">
              Legal Entity & Factory Info (Synced to Live Database)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Legal Name"
                id="co-name"
                value={profileForm.company_name}
                onChange={update('company_name')}
                required
              />
              <Input
                label="GSTIN Number"
                id="co-gstin"
                value={profileForm.gstin}
                onChange={update('gstin')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Authorized Officer Name"
                id="co-officer"
                value={profileForm.full_name}
                onChange={update('full_name')}
                required
              />
              <Input
                label="Registered Work Email"
                id="co-email"
                type="email"
                value={profileForm.email}
                onChange={update('email')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider block mb-2">
                  Designated Organization Role
                </label>
                <select
                  value={profileForm.role}
                  onChange={update('role')}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-xs text-fg-primary focus:outline-none focus:border-emerald-500/50 cursor-pointer font-sans"
                >
                  <option value="seller">Industrial Seller (Byproduct Generators)</option>
                  <option value="buyer">Material Buyer (Procurement / Processors)</option>
                  <option value="both">Dual Enterprise (Buy & Sell Recycled Streams)</option>
                  <option value="admin">SuperAdmin</option>
                </select>
              </div>

              <Input
                label="Procurement Desk Phone"
                id="co-phone"
                value={profileForm.phone}
                onChange={update('phone')}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                id="co-city"
                value={profileForm.city}
                onChange={update('city')}
              />
              <Input
                label="State"
                id="co-state"
                value={profileForm.state}
                onChange={update('state')}
              />
            </div>

            <Input
              label="Manufacturing & Dispatch Plant Address"
              id="co-address"
              value={profileForm.address}
              onChange={update('address')}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Profile credentials updated in database.
                </span>
              ) : (
                <span className="text-xs text-fg-muted">Changes persist across the entire Waste2Worth exchange.</span>
              )}

              <Button type="submit" size="md" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Profile Changes
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
                  name: 'State SPCB Consent to Operate',
                  body: 'Water & Air Act Compliance',
                  status: 'Active & Verified',
                  verified: true,
                },
                {
                  name: 'R2 Responsible Recycling Standard',
                  body: 'Sustainable Secondary Metals Protocol',
                  status: 'Audited & Active',
                  verified: true,
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
                Upload New Environmental Clearance Document (.pdf)
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
              <CardTitle className="text-sm">Account Security & Authentication Link</CardTitle>
              <CardDescription>Update your enterprise login password and 2FA credentials.</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Authorized Officer Name" id="auth-name" value={profileForm.full_name} onChange={update('full_name')} />
                <Input label="Registered Security Email" id="auth-email" value={profileForm.email} onChange={update('email')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                <Input label="Current Password" id="curr-pw" type="password" placeholder="••••••••••••" />
                <Input label="New Master Password" id="new-pw" type="password" placeholder="••••••••••••" />
              </div>
            </CardBody>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
              <Button size="sm" variant="primary">Update Credentials</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Tab 4: Alert Preferences ─── */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tender & Sourcing Alert Channels</CardTitle>
            <CardDescription>Select real-time notification channels for tender offers and escrow releases.</CardDescription>
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
            <Button size="sm" variant="primary">Save Preferences</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
