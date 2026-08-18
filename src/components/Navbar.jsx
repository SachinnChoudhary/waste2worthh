import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Logo } from './Logo'
import { Button } from './Button'

const navLinks = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/seller', label: 'Seller Dashboard' },
  { to: '/buyer', label: 'Buyer Dashboard' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  // ponytail: fake auth state, replace with Clerk useUser() when integrating
  const isLoggedIn = pathname !== '/' && pathname !== '/login' && pathname !== '/signup'

  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  pathname.startsWith(link.to)
                    ? 'bg-forest-100 text-forest-700'
                    : 'text-earth-600 hover:text-forest-700 hover:bg-forest-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="no-underline">
                  <div className="w-9 h-9 rounded-full bg-forest-200 flex items-center justify-center text-forest-700 font-medium text-sm hover:bg-forest-300 transition-colors">
                    SC
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/signup"><Button size="sm">Sign up free</Button></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-earth-600 hover:bg-forest-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <path d="M6 6l12 12M18 6L6 18" />
                : <path d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sage-200 bg-cream px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium no-underline ${
                pathname.startsWith(link.to)
                  ? 'bg-forest-100 text-forest-700'
                  : 'text-earth-600 hover:bg-forest-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-sage-200 flex gap-2">
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}>
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
