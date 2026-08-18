import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Logo } from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-2/5 bg-forest-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-forest-700 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-forest-600 rounded-full opacity-20 blur-3xl" />
        
        <div className="relative">
          <Logo size="lg" />
          <h2 className="font-display text-3xl mt-12 leading-snug">
            Welcome back to the circular economy.
          </h2>
          <p className="text-forest-300 mt-4 leading-relaxed">
            Track your listings, review bids, and close deals that reduce waste and recover value.
          </p>
        </div>
        <p className="text-sm text-forest-400 relative">
          "We saved ₹12 lakhs in raw material costs in our first quarter on Waste2Worth."
          <br />
          <span className="text-forest-300 mt-1 inline-block">— Priya Mehta, Procurement Head, GreenBuild Materials</span>
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="font-display text-2xl text-forest-900 mb-1">Log in to your account</h1>
          <p className="text-sm text-earth-500 mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-forest-600 font-medium hover:text-forest-700 no-underline">Sign up free</Link>
          </p>

          {/* ponytail: placeholder form, replace with Clerk <SignIn /> */}
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <Input
              label="Email address"
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-earth-600 cursor-pointer">
                <input type="checkbox" className="rounded border-sage-300 text-forest-600 focus:ring-forest-400" />
                Remember me
              </label>
              <a href="#" className="text-forest-600 hover:text-forest-700 no-underline">Forgot password?</a>
            </div>
            <Link to="/seller">
              <Button className="w-full mt-2" size="lg">Log in</Button>
            </Link>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-200" /></div>
            <div className="relative flex justify-center"><span className="bg-cream px-3 text-xs text-earth-400">or continue with</span></div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-sage-200 bg-white text-sm font-medium text-earth-700 hover:bg-sage-50 transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
