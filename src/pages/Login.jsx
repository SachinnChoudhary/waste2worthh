import { Link, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, role } = useWasteAuth()
  const [email, setEmail] = useState('rajesh@steelcycle.in')
  const [password, setPassword] = useState('••••••••••••')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    setIsLoading(true)
    login({
      name: 'Rajesh Sharma',
      company: 'Tata Steel Ltd.',
      email,
      role: 'seller'
    })
    setTimeout(() => {
      setIsLoading(false)
      navigate('/seller')
    }, 400)
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
              Log in to manage your active byproduct inventory, review live tenders, and download audit-ready scope-3 CO₂ reports.
            </p>
          </div>
        </div>

        {/* Testimonial Quote Capsule */}
        <div className="relative z-10 surface-card rounded-2xl p-5 border border-white/[0.08] space-y-3">
          <p className="text-xs text-fg-primary leading-relaxed italic">
            "Waste2Worth allowed us to source 450 tonnes of high-calcium slag per month at a 32% discount compared to virgin aggregates, while cutting our scope-3 carbon footprint by 1,240 tonnes."
          </p>
          <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              PM
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-primary block">Priya Mehta</span>
              <span className="text-[10px] text-fg-muted font-mono block">VP Procurement • GreenBuild Infra</span>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="relative z-10 flex items-center gap-4 text-[11px] text-fg-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit TLS Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CPCB Authorization Verified
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
              Don't have an account?{' '}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email"
                id="login-email"
                type="email"
                placeholder="rajesh@steelcycle.in"
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
                  Remember this enterprise session
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
                Sign In to Command Center
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
