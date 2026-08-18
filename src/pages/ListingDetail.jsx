import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import { listings } from '../data'

export default function ListingDetail() {
  const { id } = useParams()
  const listing = listings.find(l => l.id === id) || listings[0]
  const [bidAmount, setBidAmount] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/marketplace" className="text-sm text-forest-600 hover:text-forest-700 no-underline">← Back to marketplace</Link>

      <div className="grid lg:grid-cols-5 gap-8 mt-4">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image */}
          <div className="h-64 sm:h-80 bg-gradient-to-br from-sage-100 to-forest-100 rounded-2xl flex items-center justify-center text-6xl border border-sage-200 relative">
            {listing.category === 'Metal Scrap' ? '🔩' :
             listing.category === 'Plastic Waste' ? '♳' :
             listing.category === 'Chemical Byproducts' ? '🧪' :
             listing.category === 'Textile Waste' ? '🧵' :
             listing.category === 'Electronic Waste' ? '💻' : '🏭'}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Badge color={listing.hazard === 'Non-hazardous' ? 'green' : listing.hazard === 'Low' ? 'sage' : 'red'}>
                {listing.hazard}
              </Badge>
              <Badge color="brown">{listing.bids} bids</Badge>
            </div>
          </div>

          {/* Title & meta */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl text-forest-900">{listing.title}</h1>
                <p className="text-sm text-earth-500 mt-1">
                  by <span className="font-medium text-bark">{listing.company}</span> · {listing.postedAt}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-display text-forest-700">{listing.price}</div>
                <div className="text-xs text-earth-400">{listing.quantity}</div>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Category', value: listing.category },
              { label: 'Condition', value: listing.condition },
              { label: 'Quantity', value: listing.quantity },
              { label: 'Location', value: listing.location },
            ].map(d => (
              <div key={d.label} className="bg-sage-50 rounded-lg p-3 border border-sage-100">
                <div className="text-xs text-earth-400">{d.label}</div>
                <div className="text-sm font-medium text-bark mt-0.5">{d.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-lg text-forest-900 mb-3">Description</h2>
            <p className="text-sm text-earth-600 leading-relaxed">{listing.description}</p>
          </div>

          {/* Location map placeholder */}
          <div>
            <h2 className="font-display text-lg text-forest-900 mb-3">Pickup Location</h2>
            <div className="w-full h-48 rounded-xl bg-sage-100 border border-sage-200 flex items-center justify-center text-earth-400 text-sm">
              📍 {listing.location} — Map integration pending
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Classification */}
          <Card hover={false} className="overflow-hidden">
            <div className="bg-forest-700 text-white px-5 py-3 flex items-center gap-2">
              <span>🤖</span>
              <span className="font-medium text-sm">AI Analysis</span>
              <Badge color="green" className="ml-auto !bg-forest-500 !text-white !border-forest-400">{listing.aiConfidence}% confidence</Badge>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs text-earth-400 mb-1">Material Classification</div>
                <div className="text-sm font-medium text-bark">{listing.aiClassification}</div>
              </div>
              <div>
                <div className="text-xs text-earth-400 mb-1">Market Valuation</div>
                <div className="text-sm font-display text-forest-700">{listing.aiValuation}</div>
              </div>
              <div>
                <div className="text-xs text-earth-400 mb-1">Environmental Impact</div>
                <div className="text-sm text-forest-600">🌱 {listing.co2Saved}</div>
              </div>
              <div className="pt-2 border-t border-sage-100">
                <div className="text-xs text-earth-400">Confidence Score</div>
                <div className="mt-1.5 bg-sage-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-forest-500 transition-all duration-500"
                    style={{ width: `${listing.aiConfidence}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Bid section */}
          <Card hover={false} className="p-5">
            <h3 className="font-display text-lg text-forest-900 mb-3">Place a Bid</h3>
            {!showBidForm ? (
              <div>
                <p className="text-sm text-earth-500 mb-4">
                  Asking price: <span className="font-medium text-bark">{listing.price}</span>
                </p>
                <Button className="w-full" onClick={() => setShowBidForm(true)}>
                  💬 Make an Offer
                </Button>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={e => e.preventDefault()}>
                <Input
                  label="Your bid"
                  id="bid-amount"
                  placeholder="₹8,000/tonne"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
                <Textarea
                  label="Message to seller"
                  id="bid-note"
                  rows={3}
                  placeholder="Interested in regular monthly supply. Can arrange own transport from Jamshedpur..."
                  value={bidNote}
                  onChange={e => setBidNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button className="flex-1">Submit Bid</Button>
                  <Button variant="ghost" onClick={() => setShowBidForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </Card>

          {/* Seller info */}
          <Card hover={false} className="p-5">
            <h3 className="text-sm font-medium text-bark mb-3">Seller</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-200 flex items-center justify-center text-forest-700 font-medium text-sm">
                {listing.company.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-bark">{listing.company}</div>
                <div className="text-xs text-earth-400">Verified seller · Member since 2024</div>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="w-full mt-3">View Profile</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
