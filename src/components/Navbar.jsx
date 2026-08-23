import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Logo } from './Logo'
import { Button } from './Button'
import { Badge } from './Badge'
import { useWasteAuth, isClerkConfigured } from '../lib/auth'
import { UserButton } from '@clerk/clerk-react'
import {
  Store,
  Layers,
  PlusCircle,
  Bell,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
  Factory,
  Shield,
  Repeat
} from 'lucide-react'

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const { user, role, setRole, isLoggedIn, logout } = useWasteAuth()

  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  // Dynamic Navigation Links based on active role
  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { to: '/marketplace', label: 'Marketplace', icon: Store },
      ]
    }

    if (role === 'seller') {
      return [
        { to: '/seller', label: 'Seller Command Center', icon: TrendingUp, isPrimary: true },
        { to: '/marketplace', label: 'Marketplace', icon: Store },
      ]
    }

    if (role === 'buyer') {
      return [
        { to: '/buyer', label: 'Buyer Procurement Hub', icon: Layers, isPrimary: true },
        { to: '/marketplace', label: 'Marketplace', icon: Store },
      ]
    }

    if (role === 'admin') {
      return [
        { to: '/admin', label: 'Admin Command', icon: ShieldCheck, badge: 'PRO', isPrimary: true },
        { to: '/seller', label: 'Seller View', icon: TrendingUp },
        { to: '/buyer', label: 'Buyer View', icon: Layers },
        { to: '/marketplace', label: 'Marketplace', icon: Store },
      ]
    }

    // Default or 'both'
    return [
      { to: '/seller', label: 'Seller Dashboard', icon: TrendingUp },
      { to: '/buyer', label: 'Buyer Hub', icon: Layers },
      { to: '/marketplace', label: 'Marketplace', icon: Store },
    ]
  }

  const navLinks = getNavLinks()

  const handleRoleSwitch = (newRole) => {
    setRole(newRole)
    setRoleMenuOpen(false)
    if (newRole === 'seller') navigate('/seller')
    else if (newRole === 'buyer') navigate('/buyer')
    else if (newRole === 'admin') navigate('/admin')
  }

  return (
    <header className="sticky top-0 z-50 surface-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/[0.08]">
              {navLinks.map(({ to, label, icon: Icon, badge, isPrimary }) => {
                const isActive = pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 no-underline
                      ${
                        isActive
                          ? 'bg-white/[0.08] text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_-2px_rgba(52,211,153,0.25)]'
                          : isPrimary
                          ? 'text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10'
                          : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                    {badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Search Trigger Shortcut Bar (SaaS Style) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <Link
              to="/marketplace"
              className="w-full h-9 px-3 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-between text-xs text-fg-muted hover:border-white/20 hover:text-fg-secondary transition-all no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search live Supabase lots...</span>
              </div>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-fg-muted">
                ⌘K
              </kbd>
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoggedIn && !isAuthRoute ? (
              <>
                {/* Role Switcher Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      role === 'seller' ? 'bg-emerald-400' :
                      role === 'buyer' ? 'bg-cyan-400' :
                      role === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'
                    }`} />
                    <span className="capitalize text-fg-primary text-[11px] font-mono">
                      Role: {role}
                    </span>
                    <ChevronDown className="w-3 h-3 text-fg-muted" />
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-2xl">
                      <div className="px-2.5 py-1.5 text-[10px] font-mono text-fg-muted uppercase tracking-wider">
                        Switch Active Role
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('seller')}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                          role === 'seller' ? 'bg-emerald-500/20 text-emerald-300' : 'text-fg-secondary hover:bg-white/[0.04]'
                        }`}
                      >
                        <Factory className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Seller Dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('buyer')}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                          role === 'buyer' ? 'bg-cyan-500/20 text-cyan-300' : 'text-fg-secondary hover:bg-white/[0.04]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Buyer Procurement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('admin')}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                          role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'text-fg-secondary hover:bg-white/[0.04]'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        <span>SuperAdmin Control</span>
                      </button>
                    </div>
                  )}
                </div>

                {role !== 'buyer' && (
                  <Link to="/listing/new" className="no-underline">
                    <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                      List Waste
                    </Button>
                  </Link>
                )}

                <div className="w-px h-6 bg-white/[0.08]" />

                {/* Notifications icon */}
                <button
                  type="button"
                  className="relative p-2 rounded-xl text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
                  title="Real-time Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </button>

                {isClerkConfigured ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  /* User Profile Capsule */
                  <div className="flex items-center gap-2">
                    <Link to="/profile" className="no-underline">
                      <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-emerald-950 font-bold text-xs shadow-sm">
                          {user?.company ? user.company.slice(0, 2).toUpperCase() : 'SC'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-semibold text-fg-primary leading-tight">
                            {user?.company || 'Northgate Steelworks Ltd.'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 leading-none">
                            <ShieldCheck className="w-2.5 h-2.5" /> {role?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={logout}
                      className="p-2 rounded-xl text-fg-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="no-underline">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="no-underline">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              className="p-2 rounded-xl text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06] border border-white/[0.08]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in duration-200">
          <div className="space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors
                  ${
                    pathname.startsWith(to)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.04]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {isLoggedIn && !isAuthRoute ? (
              <>
                <Link to="/listing/new" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button fullWidth size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    + Create New Listing
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button fullWidth variant="secondary" size="md" leftIcon={<User className="w-4 h-4" />}>
                    View Profile & Settings
                  </Button>
                </Link>
                <Button fullWidth variant="ghost" size="md" onClick={logout} leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}>
                  Log Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button fullWidth variant="secondary" size="md">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="no-underline">
                  <Button fullWidth variant="primary" size="md">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
