import { Link } from 'react-router-dom'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { listings } from '../data'

function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="no-underline">
      <Card className="overflow-hidden group">
        {/* Image placeholder */}
        <div className="h-40 bg-gradient-to-br from-sage-100 to-forest-100 flex items-center justify-center text-4xl relative">
          {listing.category === 'Metal Scrap' ? '🔩' :
           listing.category === 'Plastic Waste' ? '♳' :
           listing.category === 'Chemical Byproducts' ? '🧪' :
           listing.category === 'Textile Waste' ? '🧵' :
           listing.category === 'Electronic Waste' ? '💻' : '🏭'}
          <div className="absolute top-3 left-3">
            <Badge color={listing.hazard === 'Non-hazardous' ? 'green' : listing.hazard === 'Low' ? 'sage' : 'red'}>
              {listing.hazard}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge color="brown">{listing.bids} bids</Badge>
          </div>
        </div>
        <CardBody>
          <p className="text-xs text-earth-400 mb-1">{listing.company} · {listing.location}</p>
          <h3 className="font-medium text-sm text-bark group-hover:text-forest-700 transition-colors line-clamp-2">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-sage-100">
            <div>
              <span className="text-sm font-display text-forest-700">{listing.price}</span>
              <span className="text-xs text-earth-400 block">{listing.quantity}</span>
            </div>
            <span className="text-xs text-earth-400">{listing.postedAt}</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export default function BuyerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Buyer Dashboard</h1>
          <p className="text-sm text-earth-500 mt-1">Recommended materials based on your purchase history and alerts.</p>
        </div>
        <Link to="/marketplace">
          <Button variant="outline">
            🔍 Browse Marketplace
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-forest-200 bg-forest-50 p-4">
          <div className="text-xs text-earth-500">Active Alerts</div>
          <div className="text-xl font-display text-bark mt-1">3</div>
        </div>
        <div className="rounded-xl border border-earth-200 bg-earth-50 p-4">
          <div className="text-xs text-earth-500">Bids Placed</div>
          <div className="text-xl font-display text-bark mt-1">12</div>
        </div>
        <div className="rounded-xl border border-sage-200 bg-sage-50 p-4">
          <div className="text-xs text-earth-500">Deals Closed</div>
          <div className="text-xl font-display text-bark mt-1">4</div>
        </div>
        <div className="rounded-xl border border-terra-200 bg-terra-100 p-4">
          <div className="text-xs text-earth-500">Total Saved</div>
          <div className="text-xl font-display text-bark mt-1">₹6.8L</div>
        </div>
      </div>

      {/* Recommended listings */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg text-forest-900">Recommended for You</h2>
        <div className="flex gap-2">
          {['All', 'Metal', 'Plastic', 'Chemical'].map(f => (
            <button
              key={f}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                f === 'All' ? 'bg-forest-600 text-white border-forest-600' : 'bg-white text-earth-600 border-sage-200 hover:border-forest-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
