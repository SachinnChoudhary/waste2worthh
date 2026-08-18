import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-sage-200 bg-forest-900 text-forest-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <span className="font-display text-xl text-white">Waste<span className="text-forest-400">2</span>Worth</span>
              <p className="mt-3 text-sm text-forest-300 leading-relaxed">
                Turning industrial waste into valuable resources. The circular economy marketplace for forward-thinking businesses.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-forest-300">
                <li><a href="/marketplace" className="hover:text-white transition-colors no-underline text-forest-300">Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-forest-300">
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-forest-300">
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors no-underline text-forest-300">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-forest-800 text-center text-xs text-forest-400">
            © 2026 Waste2Worth. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
