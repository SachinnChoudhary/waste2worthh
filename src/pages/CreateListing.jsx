import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input, Textarea, Select } from '../components/Input'
import { wasteCategories, hazardLevels } from '../data'

export default function CreateListing() {
  const [form, setForm] = useState({
    title: '', category: '', quantity: '', unit: 'tonnes', price: '',
    condition: '', hazard: '', location: '', description: '',
  })

  const update = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to="/seller" className="text-sm text-forest-600 hover:text-forest-700 no-underline">← Back to dashboard</Link>
        <h1 className="font-display text-2xl text-forest-900 mt-3">Create a New Listing</h1>
        <p className="text-sm text-earth-500 mt-1">Describe your waste material. Our AI will help classify and value it.</p>
      </div>

      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-sage-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-forest-900 mb-2">Material Details</h2>
          
          <Input label="Listing title" id="title" placeholder="e.g., Steel Mill Slag — Grade A" value={form.title} onChange={update('title')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              id="category"
              options={[{ value: '', label: 'Select category' }, ...wasteCategories.map(c => ({ value: c, label: c }))]}
              value={form.category}
              onChange={update('category')}
            />
            <Select
              label="Hazard Level"
              id="hazard"
              options={[{ value: '', label: 'Select level' }, ...hazardLevels.map(h => ({ value: h, label: h }))]}
              value={form.hazard}
              onChange={update('hazard')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Quantity" id="quantity" type="number" placeholder="450" value={form.quantity} onChange={update('quantity')} />
            <Select
              label="Unit"
              id="unit"
              options={[
                { value: 'tonnes', label: 'Tonnes' },
                { value: 'kg', label: 'Kilograms' },
                { value: 'litres', label: 'Litres' },
                { value: 'KL', label: 'Kilolitres' },
                { value: 'units', label: 'Units' },
              ]}
              value={form.unit}
              onChange={update('unit')}
            />
            <Input label="Asking price" id="price" placeholder="₹8,200/tonne" value={form.price} onChange={update('price')} />
          </div>

          <Select
            label="Condition"
            id="condition"
            options={[
              { value: '', label: 'Select condition' },
              { value: 'Unprocessed', label: 'Unprocessed / As-is' },
              { value: 'Ground / Shredded', label: 'Ground / Shredded' },
              { value: 'Sorted', label: 'Sorted / Cleaned' },
              { value: 'Baled', label: 'Baled / Compressed' },
              { value: 'Liquid', label: 'Liquid — tanker' },
              { value: 'Decommissioned', label: 'Decommissioned' },
            ]}
            value={form.condition}
            onChange={update('condition')}
          />

          <Textarea
            label="Description"
            id="description"
            rows={5}
            placeholder="Describe the material composition, purity, test reports available, potential uses, pickup/delivery terms..."
            value={form.description}
            onChange={update('description')}
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-sage-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-forest-900 mb-2">Pickup Location</h2>
          <Input label="Address / City" id="location" placeholder="e.g., Jamshedpur, Jharkhand" value={form.location} onChange={update('location')} />
          {/* ponytail: placeholder for Google Maps integration */}
          <div className="w-full h-48 rounded-lg bg-sage-100 border border-sage-200 flex items-center justify-center text-earth-400 text-sm">
            📍 Map preview — Google Maps API integration pending
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-white rounded-xl border border-sage-200 p-6">
          <h2 className="font-display text-lg text-forest-900 mb-3">Photos</h2>
          <div className="border-2 border-dashed border-sage-300 rounded-xl p-8 text-center hover:border-forest-400 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-sm font-medium text-bark">Drop images here or click to upload</p>
            <p className="text-xs text-earth-400 mt-1">PNG, JPG up to 10MB · Max 5 images</p>
          </div>
        </div>

        {/* AI preview */}
        <div className="bg-forest-50 rounded-xl border border-forest-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h2 className="font-display text-lg text-forest-800">AI Classification Preview</h2>
          </div>
          <p className="text-sm text-earth-500 mb-4">Fill in the details above and our AI will auto-classify your waste and suggest a market valuation.</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-forest-200">
              <div className="text-xs text-earth-400 mb-1">Classification</div>
              <div className="font-medium text-bark">Waiting for input...</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-forest-200">
              <div className="text-xs text-earth-400 mb-1">Estimated Value</div>
              <div className="font-medium text-bark">—</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-forest-200">
              <div className="text-xs text-earth-400 mb-1">CO₂ Impact</div>
              <div className="font-medium text-bark">—</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link to="/seller">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <div className="flex gap-3">
            <Button variant="secondary">Save as Draft</Button>
            <Button>Publish Listing</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
