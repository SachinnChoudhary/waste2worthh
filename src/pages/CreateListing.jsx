import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Textarea, Select } from '../components/Input'
import { wasteCategories, hazardLevels } from '../data'
import { api } from '../lib/api'
import { useWasteAuth } from '../lib/auth'
import {
  ArrowLeft,
  Sparkles,
  UploadCloud,
  FileText,
  MapPin,
  ShieldAlert,
  Info,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Scale,
  Cpu,
} from 'lucide-react'

export default function CreateListing() {
  const navigate = useNavigate()
  const { user } = useWasteAuth()
  const [form, setForm] = useState({
    title: '',
    category: '',
    quantity: '450',
    unit: 'tonnes',
    price: '',
    condition: 'Clean / sorted',
    hazard: 'Non-hazardous',
    location: 'Jamshedpur Industrial Zone, Jharkhand',
    description: '',
  })

  const [aiData, setAiData] = useState({
    category: '',
    hazard_level: 'Low',
    confidence: 0,
    estimated_value_usd: 0,
    disposal_cost_saved_usd: 0,
    co2_reduction_kg: 0,
    pricing_model: 'ML Model Active',
    isAnalyzing: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceTimer = useRef(null)

  const update = field => e => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
  }

  // Real-time AI classification & valuation hook
  useEffect(() => {
    const textToAnalyze = `${form.title} ${form.description}`.trim()
    if (textToAnalyze.length < 5) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    setAiData(prev => ({ ...prev, isAnalyzing: true }))

    debounceTimer.current = setTimeout(async () => {
      const qtyNum = parseFloat(form.quantity) || 10
      const qtyKg = form.unit.toLowerCase().includes('tonne') || form.unit.toLowerCase().includes('ton')
        ? qtyNum * 1000
        : qtyNum

      const res = await api.classifyAndValue(textToAnalyze, form.condition, qtyKg)
      if (res) {
        setAiData({
          category: res.category || '',
          hazard_level: res.hazard_level || 'Low',
          confidence: Math.round((res.classification_confidence || 0.85) * 100),
          estimated_value_usd: res.estimated_value_usd || 0,
          disposal_cost_saved_usd: res.disposal_cost_saved_usd || 0,
          co2_reduction_kg: res.co2_reduction_kg || 0,
          pricing_model: res.pricing_model || 'Random Forest ML',
          isAnalyzing: false,
        })

        // Auto-select category and hazard if empty
        setForm(prev => ({
          ...prev,
          category: prev.category || res.category,
          hazard: prev.hazard === 'Non-hazardous' && res.hazard_level ? res.hazard_level : prev.hazard,
          price: prev.price || `₹${Math.round(res.estimated_value_usd * 83).toLocaleString('en-IN')}`,
        }))
      }
    }, 600)

    return () => clearTimeout(debounceTimer.current)
  }, [form.title, form.description, form.condition, form.quantity, form.unit])

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.createListing({
        ...form,
        seller_id: user?.id,
        company_name: user?.company || 'Enterprise Seller',
      })
      setTimeout(() => {
        setIsSubmitting(false)
        navigate('/seller')
      }, 500)
    } catch (err) {
      setIsSubmitting(false)
      navigate('/seller')
    }
  }

  const hasInput = form.title.length > 3 || form.description.length > 5

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ─── Breadcrumb & Title ─── */}
      <div className="space-y-2">
        <Link
          to="/seller"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-secondary hover:text-emerald-400 transition-colors no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Seller Command Center</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary tracking-tight">
              Post Industrial Byproduct Lot
            </h1>
            <p className="text-xs sm:text-sm text-fg-secondary mt-0.5">
              Publish secondary raw materials to 340+ verified buyers with real-time AI valuation and carbon audit scoring.
            </p>
          </div>
          <Badge variant="purple" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Auto-Classification & Valuation Active
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left 2 Columns: Main Form Fields ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Core Specifications */}
          <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                1
              </span>
              <h2 className="text-sm font-bold text-fg-primary uppercase tracking-wider">
                Material Identification & Classification
              </h2>
            </div>

            <Input
              label="Listing Title"
              id="title"
              placeholder="e.g., Surplus HDPE Plastic Regrind from Packaging Line"
              value={form.title}
              onChange={update('title')}
              required
              helperText="Describe material, purity, or process. AI will auto-detect category & fair valuation."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Stream Category"
                id="category"
                options={[
                  { value: '', label: 'Select material category...' },
                  ...wasteCategories.map(c => ({ value: c, label: c })),
                ]}
                value={form.category}
                onChange={update('category')}
                required
              />

              <Select
                label="Hazard Rating (MSDS)"
                id="hazard"
                options={hazardLevels.map(h => ({ value: h, label: h }))}
                value={form.hazard}
                onChange={update('hazard')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Batch Volume"
                id="quantity"
                type="number"
                placeholder="450"
                value={form.quantity}
                onChange={update('quantity')}
                required
              />

              <Select
                label="Unit of Measure"
                id="unit"
                options={[
                  { value: 'tonnes', label: 'Metric Tonnes (MT)' },
                  { value: 'kg', label: 'Kilograms (KG)' },
                  { value: 'KL', label: 'Kilolitres (KL)' },
                  { value: 'litres', label: 'Litres (L)' },
                  { value: 'barrels', label: 'Barrels' },
                ]}
                value={form.unit}
                onChange={update('unit')}
              />

              <Input
                label="Asking Base Price"
                id="price"
                placeholder="₹8,200/tonne"
                value={form.price}
                onChange={update('price')}
                required
              />
            </div>

            <Select
              label="Processing State / Condition"
              id="condition"
              options={[
                { value: 'Clean / sorted', label: 'Clean / Sorted & Segregated' },
                { value: 'Mixed / unsorted', label: 'Mixed / Unsorted Stream' },
                { value: 'Baled', label: 'Baled / Compressed Blocks' },
                { value: 'Loose', label: 'Loose Bulk Material' },
                { value: 'Contaminated', label: 'Contaminated / Chemical Residue' },
              ]}
              value={form.condition}
              onChange={update('condition')}
            />

            <Textarea
              label="Technical Composition & Extraction Details"
              id="description"
              rows={4}
              placeholder="Detail the chemical composition, moisture percentage, ash content, testing reports available on request, and pickup terms (e.g. regular supply of PET bottle scrap generated from our bottling line)..."
              value={form.description}
              onChange={update('description')}
              helperText="The ML model extracts chemical descriptors in real-time to benchmark pricing."
            />
          </div>

          {/* Section 2: Logistics & Dispatch Location */}
          <div className="surface-card rounded-2xl p-6 border border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                2
              </span>
              <h2 className="text-sm font-bold text-fg-primary uppercase tracking-wider">
                Logistics & Dispatch Facility
              </h2>
            </div>

            <Input
              label="Plant Dispatch Location / City"
              id="location"
              placeholder="e.g., Jamshedpur Industrial Zone, Jharkhand"
              leftIcon={<MapPin className="w-4 h-4" />}
              value={form.location}
              onChange={update('location')}
              required
            />

            {/* Upload Zone */}
            <div>
              <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider block mb-2">
                Lab Test Certificates & Material Photos
              </label>
              <div className="border border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:bg-white/[0.02] transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-fg-muted group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-fg-primary">
                  Click to browse or drag & drop MSDS reports or photos
                </p>
                <p className="text-[11px] text-fg-muted mt-1 font-mono">
                  PDF, PNG, JPG up to 25MB • Up to 8 files
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column: AI Co-Pilot & Publishing Actions ─── */}
        <div className="space-y-6">
          {/* AI Valuation Card */}
          <div className="surface-card rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-zinc-950/90 space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-fg-primary uppercase tracking-wider">
                  Python ML Co-Pilot
                </span>
              </div>
              <Badge variant={aiData.isAnalyzing ? 'cyan' : 'emerald'} size="sm">
                {aiData.isAnalyzing ? 'Analyzing ML...' : 'ML Synced'}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Category Classification */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[11px] text-fg-muted font-medium block">
                  Predicted Category & Hazard
                </span>
                <span className="text-sm font-bold text-emerald-300 font-sans mt-0.5 block">
                  {aiData.category || form.category || 'Awaiting description...'}
                </span>
                <div className="flex items-center justify-between text-[10px] text-fg-secondary font-mono mt-1">
                  <span>Confidence: {aiData.confidence > 0 ? `${aiData.confidence}%` : '—'}</span>
                  <span>Hazard: {aiData.hazard_level}</span>
                </div>
              </div>

              {/* Valuation */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[11px] text-fg-muted font-medium block">
                  Projected Fair Market Value (ML)
                </span>
                <span className="text-xl font-bold text-emerald-400 font-sans mt-0.5 block">
                  {aiData.estimated_value_usd > 0
                    ? `₹${Math.round(aiData.estimated_value_usd * 83).toLocaleString('en-IN')}`
                    : form.price || '₹8,200 / tonne'}
                </span>
                <span className="text-[10px] text-fg-secondary font-mono mt-0.5 block">
                  Landfill fee savings: ${aiData.disposal_cost_saved_usd} USD
                </span>
              </div>

              {/* Carbon Factor */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[11px] text-fg-muted font-medium block">
                  Scope-3 Carbon Abatement Score
                </span>
                <span className="text-lg font-bold text-cyan-400 font-sans mt-0.5 block">
                  {aiData.co2_reduction_kg > 0
                    ? `${(aiData.co2_reduction_kg / 1000).toFixed(2)} tonnes CO₂e prevented`
                    : '~1.45 tonnes CO₂e / tonne'}
                </span>
                <span className="text-[10px] text-fg-secondary font-mono mt-0.5 block">
                  Eligible for CPCB / BRSR green audit credits
                </span>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
              <Button
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isLoading={isSubmitting}
              >
                Publish Lot to Marketplace
              </Button>

              <Button
                type="button"
                fullWidth
                size="md"
                variant="secondary"
                onClick={() => navigate('/seller')}
              >
                Cancel & Return
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
