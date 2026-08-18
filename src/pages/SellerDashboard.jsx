import { Link } from 'react-router-dom'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { sellerStats, recentActivity, listings } from '../data'

const statCards = [
  { label: 'Active Listings', value: sellerStats.activeListings, icon: '📦', color: 'bg-forest-50 border-forest-200' },
  { label: 'Bids Received', value: sellerStats.totalBids, icon: '💬', color: 'bg-earth-50 border-earth-200' },
  { label: 'CO₂ Saved', value: sellerStats.co2Saved, icon: '🌱', color: 'bg-sage-50 border-sage-200' },
  { label: 'Revenue', value: sellerStats.revenue, icon: '💰', color: 'bg-terra-100 border-terra-200' },
]

export default function SellerDashboard() {
  const myListings = listings.slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl text-forest-900">Seller Dashboard</h1>
          <p className="text-sm text-earth-500 mt-1">Welcome back, Sachin. Here's your overview.</p>
        </div>
        <Link to="/listing/new">
          <Button>
            <span>+</span> New Listing
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(stat => (
          <div key={stat.label} className={`rounded-xl border p-5 ${stat.color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <Badge color="sage" className="text-xs">This month</Badge>
            </div>
            <div className="text-2xl font-display text-bark">{stat.value}</div>
            <div className="text-xs text-earth-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent listings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-forest-900">Your Listings</h2>
            <Button variant="ghost" size="sm">View all →</Button>
          </div>
          <div className="space-y-3">
            {myListings.map(listing => (
              <Link key={listing.id} to={`/listing/${listing.id}`} className="no-underline">
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-sage-100 flex items-center justify-center text-xl flex-shrink-0">
                        {listing.category === 'Metal Scrap' ? '🔩' :
                         listing.category === 'Plastic Waste' ? '♳' :
                         listing.category === 'Chemical Byproducts' ? '🧪' :
                         listing.category === 'Textile Waste' ? '🧵' :
                         listing.category === 'Electronic Waste' ? '💻' : '🏭'}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-bark">{listing.title}</h3>
                        <p className="text-xs text-earth-400 mt-0.5">{listing.quantity} · {listing.price}</p>
                        <p className="text-xs text-earth-400">{listing.location}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge color={listing.bids > 5 ? 'green' : 'brown'}>{listing.bids} bids</Badge>
                      <p className="text-xs text-earth-400 mt-1">{listing.postedAt}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="font-display text-lg text-forest-900 mb-4">Recent Activity</h2>
          <Card hover={false} className="p-4">
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className={`${i !== 0 ? 'pt-4 border-t border-sage-100' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      item.action.includes('bid') ? 'bg-forest-500' :
                      item.action.includes('approved') ? 'bg-forest-400' :
                      item.action.includes('closed') ? 'bg-earth-500' : 'bg-earth-300'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-bark">{item.action}</p>
                      <p className="text-xs text-earth-400 mt-0.5">{item.detail}</p>
                      <p className="text-xs text-earth-300 mt-1">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CO₂ impact card */}
          <Card hover={false} className="mt-4 p-5 bg-gradient-to-br from-forest-700 to-forest-900 border-forest-600 text-white">
            <div className="text-3xl mb-2">🌍</div>
            <div className="font-display text-2xl">{sellerStats.co2Saved}</div>
            <p className="text-sm text-forest-200 mt-1">CO₂ emissions prevented through your waste recovery this month.</p>
            <p className="text-xs text-forest-300 mt-3">Equivalent to planting ~62 trees 🌳</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
