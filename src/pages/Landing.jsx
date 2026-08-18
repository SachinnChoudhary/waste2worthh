import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-50 via-cream to-earth-50 -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-forest-200 rounded-full opacity-20 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-earth-200 rounded-full opacity-30 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="font-display text-5xl lg:text-6xl text-forest-900 leading-[1.1] mb-6 text-balance">
                Your waste is someone else's{' '}
                <span className="text-forest-500 italic">raw material</span>
              </h1>
              <p className="text-lg text-earth-600 leading-relaxed mb-8 max-w-lg">
                Waste2Worth connects manufacturers, refineries, and industrial operations 
                with buyers who can transform their byproducts into valuable inputs — 
                cutting costs, reducing landfill, and closing the loop.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg">List your waste — it's free</Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" size="lg">Browse marketplace</Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8 text-sm text-earth-500">
                <div><span className="text-2xl font-display text-forest-700">2,400+</span><br />tonnes matched</div>
                <div className="w-px h-10 bg-sage-200" />
                <div><span className="text-2xl font-display text-forest-700">340+</span><br />companies</div>
                <div className="w-px h-10 bg-sage-200" />
                <div><span className="text-2xl font-display text-forest-700">₹4.2Cr</span><br />waste value recovered</div>
              </div>
            </div>

            {/* Right side visual — abstract illustration using CSS */}
            <div className="hidden lg:block relative">
              <div className="w-full aspect-square max-w-md ml-auto relative">
                {/* Circles representing circular economy */}
                <div className="absolute inset-8 rounded-full border-2 border-dashed border-forest-300 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-20 rounded-full border-2 border-dashed border-earth-300 animate-[spin_40s_linear_infinite_reverse]" />
                
                {/* Floating cards */}
                <div className="absolute top-8 right-4 bg-white rounded-xl shadow-lg p-4 border border-sage-200 transform rotate-3 w-56">
                  <div className="text-xs text-earth-400 mb-1">New listing</div>
                  <div className="font-medium text-sm text-bark">Steel Slag — 450t</div>
                  <div className="text-xs text-forest-600 mt-1">₹8,200/tonne</div>
                </div>
                <div className="absolute bottom-16 left-0 bg-white rounded-xl shadow-lg p-4 border border-sage-200 transform -rotate-2 w-52">
                  <div className="text-xs text-earth-400 mb-1">Matched</div>
                  <div className="font-medium text-sm text-bark">HDPE Regrind → Pipe Co.</div>
                  <div className="text-xs text-forest-600 mt-1">12 tonnes diverted</div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-forest-600 text-white rounded-2xl shadow-xl p-5 w-44 text-center">
                  <div className="text-3xl font-display">♻️</div>
                  <div className="text-sm font-medium mt-2">890 kg CO₂</div>
                  <div className="text-xs text-forest-200 mt-0.5">saved this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-sage-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl text-forest-900 mb-3">How it works</h2>
            <p className="text-earth-500 max-w-lg mx-auto">
              Three steps to turn your waste streams into revenue — or find the raw materials you need at a fraction of the cost.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'List or Search',
                desc: 'Sellers describe their waste — type, quantity, condition, location. Buyers browse or set alerts for specific materials. Our AI auto-classifies and estimates market value.',
                icon: '📋',
              },
              {
                step: '02',
                title: 'Match & Bid',
                desc: 'The platform suggests matches based on material compatibility, logistics proximity, and pricing. Buyers place bids. Sellers review and negotiate directly.',
                icon: '🤝',
              },
              {
                step: '03',
                title: 'Close & Track',
                desc: 'Agree on terms, arrange logistics, and complete the transaction. Track your environmental impact — CO₂ saved, landfill diverted, circular economy contribution.',
                icon: '📊',
              },
            ].map(item => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-sage-50 border border-sage-100 group hover:border-forest-200 transition-colors">
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <span className="text-xs font-medium text-forest-400 tracking-widest uppercase">Step {item.step}</span>
                <h3 className="font-display text-xl text-forest-900 mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-earth-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl text-forest-900 mb-2">Waste categories</h2>
            <p className="text-earth-500">Find or list materials across major industrial waste streams.</p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm">View all →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Metal Scrap', icon: '🔩', count: 124 },
            { name: 'Plastics', icon: '♳', count: 89 },
            { name: 'Chemicals', icon: '🧪', count: 56 },
            { name: 'Textiles', icon: '🧵', count: 43 },
            { name: 'Fly Ash', icon: '🏭', count: 78 },
            { name: 'E-Waste', icon: '💻', count: 65 },
            { name: 'Wood & Paper', icon: '🪵', count: 37 },
            { name: 'Glass', icon: '🫙', count: 22 },
            { name: 'Rubber', icon: '🛞', count: 31 },
            { name: 'Organics', icon: '🌿', count: 48 },
          ].map(cat => (
            <Link
              key={cat.name}
              to="/marketplace"
              className="group flex flex-col items-center p-4 rounded-xl bg-white border border-sage-200 hover:border-forest-300 hover:shadow-sm transition-all no-underline"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-medium text-bark">{cat.name}</span>
              <span className="text-xs text-earth-400 mt-0.5">{cat.count} listings</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Ready to turn waste into worth?
          </h2>
          <p className="text-forest-300 max-w-lg mx-auto mb-8">
            Join 340+ companies already trading industrial byproducts on the platform. 
            Free to list, no commission on your first 5 deals.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="!bg-white !text-forest-900 hover:!bg-forest-50">
                Get started free
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" size="lg" className="!border-forest-400 !text-forest-200 hover:!bg-forest-800">
                Explore listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
