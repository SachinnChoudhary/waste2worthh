import { Outlet, Link, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Logo } from './Logo'
import { Badge } from './Badge'
import { ShieldCheck, HeartHandshake, Leaf, ArrowRight } from 'lucide-react'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg-primary relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient background mesh */}
      <div className="bg-ambient-mesh" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* Main App Navigation */}
      <Navbar />

      {/* Page Content Viewport */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* SaaS Production Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-zinc-950/90 backdrop-blur-2xl text-fg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Column 1: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <Logo size="md" />
              <p className="text-xs text-fg-secondary leading-relaxed max-w-sm">
                The next-generation circular economy marketplace connecting industrial manufacturers, refineries, and recyclers to monetize secondary waste streams and cut scope 3 carbon footprints.
              </p>

            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 className="font-semibold text-fg-primary text-xs uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/marketplace" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Browse All Materials
                  </Link>
                </li>
                <li>
                  <Link to="/seller" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Seller Command Center
                  </Link>
                </li>
                <li>
                  <Link to="/buyer" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Buyer Procurement
                  </Link>
                </li>
                <li>
                  <Link to="/listing/new" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    AI Listing Engine
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Standards & AI */}
            <div>
              <h4 className="font-semibold text-fg-primary text-xs uppercase tracking-wider mb-4">
                Governance
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#compliance" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    CPCB / SPCB Guidelines
                  </a>
                </li>
                <li>
                  <a href="#audit" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    CO₂ Carbon Credits
                  </a>
                </li>
                <li>
                  <a href="#hazmat" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Hazmat Transport MSDS
                  </a>
                </li>
                <li>
                  <a href="#escrow" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Smart Escrow Settlement
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Security */}
            <div>
              <h4 className="font-semibold text-fg-primary text-xs uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#security" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Security & Trust
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#api" className="text-fg-secondary hover:text-emerald-400 transition-colors no-underline">
                    Developer API Docs
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fg-muted">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Waste2Worth   |    All rights reserved.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted font-medium">B2B Platform</span>
              <span className="text-white/10">•</span>
              <span className="text-emerald-400 font-medium">Encrypted & Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
