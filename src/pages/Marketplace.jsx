import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { listings, wasteCategories, hazardLevels } from '../data'

function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="no-underline">
      <Card className="overflow-hidden group">
        <div className="h-36 bg-gradient-to-br from-sage-100 to-forest-100 flex items-center justify-center text-4xl relative">
          {listing.category === 'Metal Scrap' ? '🔩' :
           listing.category === 'Plastic Waste' ? '♳' :
           listing.category === 'Chemical Byproducts' ? '🧪' :
           listing.category === 'Textile Waste' ? '🧵' :
           listing.category === 'Electronic Waste' ? '💻' : '🏭'}
          <div className="absolute top-2 left-2">
            <Badge color={listing.hazard === 'Non-hazardous' ? 'green' : listing.hazard === 'Low' ? 'sage' : 'red'}>
              {listing.hazard}
            </Badge>
          </div>
        </div>
        <CardBody>
          <p className="text-xs text-earth-400 mb-1">{listing.company}</p>
          <h3 className="font-medium text-sm text-bark group-hover:text-forest-700 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-display text-forest-700">{listing.price}</span>
            <span className="text-xs text-earth-400">{listing.quantity}</span>
          </div>
          <p className="text-xs text-earth-400 mt-1">📍 {listing.location}</p>
        </CardBody>
      </Card>
    </Link>
  )
}

export default function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [hazard, setHazard] = useState('')

  const filtered = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.company.toLowerCase().includes(search.toLowerCase())) return false
    if (category && l.category !== category) return false
    if (hazard && l.hazard !== hazard) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-forest-900">Marketplace</h1>
        <p className="text-sm text-earth-500 mt-1">Browse {listings.length} listings from verified industrial sellers across India.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card hover={false} className="p-5 space-y-5 sticky top-20">
            <div>
              <h3 className="text-sm font-medium text-bark mb-2">Search</h3>
              <Input
                id="market-search"
                placeholder="Search materials..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-bark mb-2">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCategory('')}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                    !category ? 'bg-forest-100 text-forest-700 font-medium' : 'text-earth-600 hover:bg-sage-50'
                  }`}
                >
                  All Categories
                </button>
                {wasteCategories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      category === c ? 'bg-forest-100 text-forest-700 font-medium' : 'text-earth-600 hover:bg-sage-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-bark mb-2">Hazard Level</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setHazard('')}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                    !hazard ? 'bg-forest-100 text-forest-700 font-medium' : 'text-earth-600 hover:bg-sage-50'
                  }`}
                >
                  Any
                </button>
                {hazardLevels.map(h => (
                  <button
                    key={h}
                    onClick={() => setHazard(h)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      hazard === h ? 'bg-forest-100 text-forest-700 font-medium' : 'text-earth-600 hover:bg-sage-50'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-bark mb-2">Location</h3>
              <Input id="location-filter" placeholder="City or state..." />
            </div>

            <Button variant="secondary" className="w-full" onClick={() => { setSearch(''); setCategory(''); setHazard('') }}>
              Clear Filters
            </Button>
          </Card>
        </aside>

        {/* Results grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-earth-500">{filtered.length} results</p>
            <select className="text-sm border border-sage-200 rounded-lg px-3 py-1.5 bg-white text-earth-600">
              <option>Newest first</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most bids</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-earth-500">No listings match your filters.</p>
              <Button variant="ghost" className="mt-2" onClick={() => { setSearch(''); setCategory(''); setHazard('') }}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
