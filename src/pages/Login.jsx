import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Logo } from '../components/Logo'
import { Badge } from '../components/Badge'
import { useWasteAuth, isClerkConfigured } from '../lib/auth'
import { SignIn } from '@clerk/clerk-react'
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Factory,
  Layers,
  Shield,
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, role: currentRole } = useWasteAuth()
  const [email, setEmail] = useState('procurement@tatasteel.com')
  const [password, setPassword] = useState('••••••••••••')
  const [selectedRole, setSelectedRole] = useState('seller')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickSelect = (roleKey, emailVal, nameVal, companyVal) => {
    setSelectedRole(roleKey)
    setEmail(emailVal)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    const isSeller = selectedRole === 'seller' || email.includes('tata') || email.includes('steel') || email.includes('reliance')
    const isAdmin = selectedRole === 'admin' || email.includes('admin')
    const finalRole = isAdmin ? 'admin' : (isSeller ? 'seller' : 'buyer')

    const companyMap = {
      seller: 'Tata Steel Ltd.',
      buyer: 'UltraTech Cement Ltd.',
      admin: 'Waste2Worth SuperAdmin'
    }

    await login({
      name: finalRole === 'seller' ? 'Rajesh Sharma' : finalRole === 'buyer' ? 'Karan Verma' : 'SuperAdmin',
      company: companyMap[finalRole] || 'Industrial Partner',
      email,
      role: finalRole
    })

    setIsLoading(false)
    const targetDashboard = finalRole === 'buyer' ? '/buyer' : finalRole === 'admin' ? '/admin' : '/seller'
    navigate(targetDashboard)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* ─── Left Panel: Enterprise Social Proof & Security Brand (Desktop) ─── */}
      <div className="hidden lg:flex lg:w-5/12 bg-zinc-950/80 border-r border-white/[0.08] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Logo size="lg" />

          <div className="pt-8 space-y-3">
            <Badge variant="emerald" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              Enterprise Industrial Exchange
            </Badge>
            <h2 className="text-3xl font-extrabold text-fg-primary tracking-tight leading-snug">
              Welcome back to India’s leading circular raw material exchange.
            </h2>
            <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed max-w-sm">
              Log in to access your role-specific dashboard with live inventory, active tender bids, and automated scope-3 audit reports.
            </p>
          </div>
        </div>

        {/* Demo Fast Login Switcher Cards */}
        <div className="relative z-10 space-y-2 pt-4 border-t border-white/[0.08]">
          <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider block">
            Quick Enterprise Roles (Live Supabase Data)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect('seller', 'procurement@tatasteel.com', 'Rajesh Sharma', 'Tata Steel Ltd.')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'seller'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/[0.03] border-white/10 text-fg-secondary hover:border-white/20'
              }`}
            >
              <Factory className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold block">Seller</span>
              <span className="text-[10px] text-fg-muted block truncate">Tata Steel</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('buyer', 'sourcing@ultratechcement.com', 'Karan Verma', 'UltraTech Cement Ltd.')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'buyer'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/[0.03] border-white/10 text-fg-secondary hover:border-white/20'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-xs font-bold block">Buyer</span>
              <span className="text-[10px] text-fg-muted block truncate">UltraTech</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('admin', 'admin@waste2worth.com', 'SuperAdmin', 'Waste2Worth SuperAdmin')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/[0.03] border-white/10 text-fg-secondary hover:border-white/20'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-xs font-bold block">Admin</span>
              <span className="text-[10px] text-fg-muted block truncate">SuperAdmin</span>
            </button>
          </div>
        </div>

        {/* Security badges */}
        <div className="relative z-10 flex items-center gap-4 text-[11px] text-fg-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit TLS Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Supabase Realtime Active
          </span>
        </div>
      </div>

      {/* ─── Right Panel: Clean SaaS Sign In Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden mb-4">
            <Logo size="md" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
              Sign in to Waste2Worth
            </h1>
            <p className="text-xs sm:text-sm text-fg-secondary">
              Don't have an enterprise account?{' '}
              <Link to="/signup" className="text-emerald-400 font-semibold hover:text-emerald-300 no-underline transition-colors">
                Create free enterprise account
              </Link>
            </p>
          </div>

          {isClerkConfigured ? (
            <div className="clerk-signin-wrapper">
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/signup"
                fallbackRedirectUrl={selectedRole === 'buyer' ? '/buyer' : selectedRole === 'admin' ? '/admin' : '/seller'}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Toggle for Mobile / Direct Selection */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-white/10">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('seller', 'procurement@tatasteel.com', 'Rajesh Sharma', 'Tata Steel Ltd.')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'seller' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('buyer', 'sourcing@ultratechcement.com', 'Karan Verma', 'UltraTech Cement Ltd.')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'buyer' ? 'bg-cyan-500 text-zinc-950 shadow-sm' : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('admin', 'admin@waste2worth.com', 'SuperAdmin', 'Waste2Worth SuperAdmin')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRole === 'admin' ? 'bg-purple-500 text-zinc-950 shadow-sm' : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  Admin
                </button>
              </div>

              <Input
                label="Enterprise Work Email"
                id="login-email"
                type="email"
                placeholder="procurement@tatasteel.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                id="login-password"
                type="password"
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-fg-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-white/20 bg-zinc-900 text-emerald-500 focus:ring-emerald-400/30"
                  />
                  Remember enterprise session
                </label>
                <a href="#forgot" className="text-emerald-400 hover:text-emerald-300 transition-colors no-underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In & Open {selectedRole === 'buyer' ? 'Buyer Procurement Hub' : selectedRole === 'admin' ? 'Admin Control Center' : 'Seller Command Center'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
