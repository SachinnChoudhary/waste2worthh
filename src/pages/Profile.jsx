import { useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import { Badge } from '../components/Badge'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'settings', label: 'Account Settings' },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl text-forest-900 mb-6">Profile & Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-sage-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-forest-600 text-forest-700'
                : 'border-transparent text-earth-500 hover:text-bark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Company header card */}
          <Card hover={false} className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-forest-200 flex items-center justify-center text-forest-700 text-3xl font-display flex-shrink-0">
                SC
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-xl text-bark">SteelCycle Industries Pvt. Ltd.</h2>
                    <p className="text-sm text-earth-500 mt-0.5">Mumbai, Maharashtra · Steel & Metal Recycling</p>
                  </div>
                  <Badge color="green">Verified</Badge>
                </div>
                <p className="text-sm text-earth-500 mt-3 leading-relaxed">
                  SteelCycle is a leading secondary steel processor based in Maharashtra. We convert industrial 
                  slag, mill scale, and metal scrap into construction-grade aggregates and recycled steel billets. 
                  ISO 14001:2015 certified with 12 years in circular metal economy.
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-earth-400">
                  <span>🏭 50+ employees</span>
                  <span>📦 34 completed deals</span>
                  <span>⭐ 4.8 rating</span>
                  <span>🌱 42t CO₂ saved</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Edit form */}
          <Card hover={false} className="p-6">
            <h3 className="font-display text-lg text-forest-900 mb-4">Company Information</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Company Name" id="company-name" defaultValue="SteelCycle Industries Pvt. Ltd." />
                <Input label="GSTIN" id="gstin" defaultValue="27AABCS1234A1Z5" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Industry" id="industry" defaultValue="Steel & Metal Recycling" />
                <Input label="Employee Count" id="employees" defaultValue="50-100" />
              </div>
              <Input label="Address" id="address" defaultValue="Plot 42, MIDC Taloja, Navi Mumbai, Maharashtra 410208" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Website" id="website" defaultValue="https://steelcycle.in" />
                <Input label="Phone" id="phone" defaultValue="+91 22 2740 8888" />
              </div>
              <Textarea
                label="Company Description"
                id="bio"
                rows={3}
                defaultValue="SteelCycle is a leading secondary steel processor converting industrial slag, mill scale, and metal scrap into construction-grade aggregates and recycled steel billets."
              />
              <div className="flex justify-end pt-2">
                <Button>Save Changes</Button>
              </div>
            </form>
          </Card>

          {/* Certifications */}
          <Card hover={false} className="p-6">
            <h3 className="font-display text-lg text-forest-900 mb-4">Certifications & Compliance</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'ISO 14001:2015', status: 'Valid', desc: 'Environmental Management System' },
                { name: 'CPCB Authorization', status: 'Valid', desc: 'Central Pollution Control Board' },
                { name: 'SPCB Consent', status: 'Renewal pending', desc: 'Maharashtra State PCB' },
                { name: 'R2 Certification', status: 'In progress', desc: 'Responsible Recycling Standard' },
              ].map(cert => (
                <div key={cert.name} className="bg-sage-50 rounded-lg p-3 border border-sage-100 flex items-start gap-3">
                  <span className="text-lg mt-0.5">{cert.status === 'Valid' ? '✅' : '⏳'}</span>
                  <div>
                    <div className="text-sm font-medium text-bark">{cert.name}</div>
                    <div className="text-xs text-earth-400">{cert.desc}</div>
                    <Badge color={cert.status === 'Valid' ? 'green' : 'brown'} className="mt-1">{cert.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card hover={false} className="p-6">
            <h3 className="font-display text-lg text-forest-900 mb-4">Account Settings</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" id="full-name" defaultValue="Sachin Chaudhary" />
                <Input label="Email" id="email" type="email" defaultValue="sachin@steelcycle.in" />
              </div>
              <Input label="Role" id="role" defaultValue="Admin — Seller & Buyer" disabled />
              <div className="pt-4 border-t border-sage-200">
                <h4 className="text-sm font-medium text-bark mb-3">Change Password</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Current password" id="current-pw" type="password" />
                  <Input label="New password" id="new-pw" type="password" />
                </div>
              </div>
              <div className="flex justify-end pt-2 gap-3">
                <Button variant="secondary">Cancel</Button>
                <Button>Update Account</Button>
              </div>
            </form>
          </Card>

          <Card hover={false} className="p-6 border-terra-200">
            <h3 className="font-display text-lg text-terra-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-earth-500 mb-4">Once you delete your account, there is no going back.</p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card hover={false} className="p-6">
          <h3 className="font-display text-lg text-forest-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'New bids on your listings', desc: 'Email + in-app notification when someone bids', on: true },
              { label: 'Material match alerts', desc: 'When new listings match your saved search criteria', on: true },
              { label: 'Deal status updates', desc: 'When a deal moves to accepted, shipped, or completed', on: true },
              { label: 'Weekly market digest', desc: 'Summary of new listings and price trends in your categories', on: false },
              { label: 'Platform announcements', desc: 'New features, policy changes, and maintenance notices', on: false },
            ].map(pref => (
              <div key={pref.label} className="flex items-start justify-between py-3 border-b border-sage-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-bark">{pref.label}</div>
                  <div className="text-xs text-earth-400 mt-0.5">{pref.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" defaultChecked={pref.on} className="sr-only peer" />
                  <div className="w-9 h-5 bg-sage-200 peer-focus:ring-2 peer-focus:ring-forest-400 rounded-full peer peer-checked:bg-forest-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button>Save Preferences</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
