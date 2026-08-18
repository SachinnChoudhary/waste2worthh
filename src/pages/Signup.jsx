import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Logo } from '../components/Logo'

const roles = [
  { value: 'seller', label: 'Seller', desc: 'I have waste to sell', icon: '🏭' },
  { value: 'buyer', label: 'Buyer', desc: 'I want to buy waste materials', icon: '🔄' },
  { value: 'both', label: 'Both', desc: 'I buy and sell', icon: '♻️' },
]

export default function Signup() {
  const [role, setRole] = useState('seller')
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' })

  const update = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-b from-forest-800 to-forest-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-forest-600 rounded-full opacity-20 blur-3xl" />
        
        <div className="relative">
          <Logo size="lg" />
          <h2 className="font-display text-3xl mt-12 leading-snug">
            Join the industrial waste marketplace.
          </h2>
          <p className="text-forest-300 mt-4 leading-relaxed">
            Whether you're looking to offload byproducts or source affordable raw materials, 
            Waste2Worth connects you with verified businesses across India.
          </p>
        </div>

        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-forest-400 mt-0.5">✓</span>
            <span className="text-sm text-forest-200">Free to list — no upfront costs</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-forest-400 mt-0.5">✓</span>
            <span className="text-sm text-forest-200">AI-powered material classification & pricing</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-forest-400 mt-0.5">✓</span>
            <span className="text-sm text-forest-200">CO₂ impact tracking on every transaction</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-2xl text-forest-900 mb-1">Create your account</h1>
          <p className="text-sm text-earth-500 mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-medium no-underline">Log in</Link>
          </p>

          {/* Role selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-earth-800 mb-2 block">I want to</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    role === r.value
                      ? 'border-forest-500 bg-forest-50'
                      : 'border-sage-200 bg-white hover:border-forest-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{r.icon}</span>
                  <span className="text-sm font-medium text-bark">{r.label}</span>
                  <span className="text-xs text-earth-400 block mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full name" id="signup-name" placeholder="Rajesh Kumar" value={form.name} onChange={update('name')} />
              <Input label="Company" id="signup-company" placeholder="Acme Industries" value={form.company} onChange={update('company')} />
            </div>
            <Input label="Work email" id="signup-email" type="email" placeholder="rajesh@acme.in" value={form.email} onChange={update('email')} />
            <Input label="Password" id="signup-password" type="password" placeholder="Min 8 characters" value={form.password} onChange={update('password')} />
            
            <label className="flex items-start gap-2 text-xs text-earth-500 cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded border-sage-300 text-forest-600 focus:ring-forest-400" />
              I agree to the Terms of Service and Privacy Policy
            </label>

            <Link to="/seller">
              <Button className="w-full" size="lg">Create account</Button>
            </Link>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-200" /></div>
            <div className="relative flex justify-center"><span className="bg-cream px-3 text-xs text-earth-400">or</span></div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-sage-200 bg-white text-sm font-medium text-earth-700 hover:bg-sage-50 transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  )
}
