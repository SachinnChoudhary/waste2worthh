import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Logo } from '../components/Logo'
import { Badge } from '../components/Badge'
import { useWasteAuth, isClerkConfigured } from '../lib/auth'
import { SignUp } from '@clerk/clerk-react'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  Factory,
  Layers,
  Repeat,
  User,
} from 'lucide-react'

const roles = [
  {
    value: 'seller',
    label: 'Industrial Seller',
    desc: 'Offload byproducts & secondary waste',
    icon: Factory,
  },
  {
    value: 'buyer',
    label: 'Material Buyer',
    desc: 'Procure secondary raw materials',
    icon: Layers,
  },
  {
    value: 'both',
    label: 'Dual Enterprise',
    desc: 'Buy, process & resell materials',
    icon: Repeat,
  },
]

export default function Signup() {
  const navigate = useNavigate()
  const { login, setRole: setGlobalRole } = useWasteAuth()
  const [role, setRole] = useState('seller')
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    gstin: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const update = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setGlobalRole(role)

    // Persist to registered accounts cache so login will remember their chosen role
    try {
      const savedAccounts = JSON.parse(localStorage.getItem('w2w_registered_users') || '{}')
      const emailKey = form.email.trim().toLowerCase()
      savedAccounts[emailKey] = {
        fullName: form.name || 'Industrial Leader',
        company: form.company || 'Enterprise Partner',
        email: form.email,
        role: role,
        gstin: form.gstin || '',
      }
      localStorage.setItem('w2w_registered_users', JSON.stringify(savedAccounts))
    } catch (err) {}

    await login({
      name: form.name || 'Industrial Leader',
      company: form.company || 'Enterprise Partner',
      email: form.email,
      role: role,
      gstin: form.gstin || ''
    })

    setIsLoading(false)
    navigate(role === 'buyer' ? '/buyer' : '/seller')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* ─── Left Panel: Enterprise Benefits (Desktop) ─── */}
      <div className="hidden lg:flex lg:w-5/12 bg-zinc-950/80 border-r border-white/[0.08] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Logo size="lg" />

          <div className="pt-8 space-y-3">
            <Badge variant="cyan" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              100% Free Enterprise Registration
            </Badge>
            <h2 className="text-3xl font-extrabold text-fg-primary tracking-tight leading-snug">
              Unlock immediate circular trading for your industrial manufacturing plant.
            </h2>
            <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed max-w-sm">
              Connect directly with verified processors, eliminate intermediary middleman cuts, and generate automated BRSR scope-3 carbon reduction audit logs.
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-start gap-3 text-xs text-fg-secondary">
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-fg-primary block font-semibold">Zero Listing & Setup Fees</strong>
              <span>List unlimited industrial material streams with zero upfront subscription charges.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-fg-secondary">
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-fg-primary block font-semibold">AI Automated Chemical Valuation</strong>
              <span>Instant price benchmarking against current spot bids and secondary market indices.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-fg-secondary">
            <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-fg-primary block font-semibold">Smart Escrow & Verified Logistics</strong>
              <span>Protected milestone payments and integrated hazmat carrier scheduling.</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[11px] text-fg-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ISO 14001:2015 Compliant
          </span>
        </div>
      </div>

      {/* ─── Right Panel: Account Creation Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden mb-4">
            <Logo size="md" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
              Create Enterprise Account
            </h1>
            <p className="text-xs sm:text-sm text-fg-secondary">
              Already have an enterprise ID?{' '}
              <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 no-underline transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Account Role Selector 3-Tile Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider block">
              Organization Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => {
                const Icon = r.icon
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value)
                      setGlobalRole(r.value)
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      role === r.value
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                        : 'surface-card border-white/10 text-fg-secondary hover:border-white/20'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${role === r.value ? 'text-emerald-400' : 'text-fg-muted'}`} />
                    <div>
                      <span className="text-xs font-bold text-fg-primary block leading-tight">
                        {r.label}
                      </span>
                      <span className="text-[10px] text-fg-muted block leading-tight mt-0.5 line-clamp-1">
                        {r.desc}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {isClerkConfigured ? (
            <div className="clerk-signup-wrapper">
              <SignUp
                routing="path"
                path="/signup"
                signInUrl="/login"
                fallbackRedirectUrl={role === 'buyer' ? '/buyer' : '/seller'}
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-zinc-900 border border-white/10 shadow-2xl text-fg-primary',
                    headerTitle: 'text-fg-primary font-bold',
                    headerSubtitle: 'text-fg-secondary text-xs',
                    formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold',
                  }
                }}
              />
            </div>
          ) : (
            /* Standard Industrial Signup Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  id="signup-name"
                  placeholder="Rajesh Kumar"
                  leftIcon={<User className="w-4 h-4" />}
                  value={form.name}
                  onChange={update('name')}
                  required
                />
                <Input
                  label="Company Name"
                  id="signup-company"
                  placeholder="SteelCycle Ltd."
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={form.company}
                  onChange={update('company')}
                  required
                />
              </div>

              <Input
                label="Work Email"
                id="signup-email"
                type="email"
                placeholder="rajesh@steelcycle.in"
                leftIcon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={update('email')}
                required
              />

              <Input
                label="Set Master Password"
                id="signup-password"
                type="password"
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                value={form.password}
                onChange={update('password')}
                required
              />

              <label className="flex items-start gap-2 text-xs text-fg-secondary cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  required
                  defaultChecked
                  className="mt-0.5 rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-emerald-400/30"
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms" className="text-emerald-400 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" className="text-emerald-400 underline">
                    Compliance Policy
                  </a>
                </span>
              </label>

              <Button
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2"
              >
                Create Account & Launch {role === 'buyer' ? 'Buyer Dashboard' : 'Seller Command Center'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
