import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Textarea, Select } from '../components/Input'
import { wasteCategories, hazardLevels } from '../data'
import { api } from '../lib/api'
import { useWasteAuth } from '../lib/auth'
import { supabase, isSupabaseLive } from '../lib/supabaseClient'
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
  X,
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
} from 'lucide-react'

const MAX_FILES = 8
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

export default function CreateListing() {
  const navigate = useNavigate()
  const { user } = useWasteAuth()
  const fileInputRef = useRef(null)

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

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceTimer = useRef(null)

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
    }
  }, [selectedFiles])

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
          pricing_model: res.pricing_model || 'ML Active',
          isAnalyzing: false,
        })

        if (!form.category && res.category) {
          setForm(prev => ({ ...prev, category: res.category }))
        }
      } else {
        setAiData(prev => ({ ...prev, isAnalyzing: false }))
      }
    }, 450)
  }, [form.title, form.description, form.quantity, form.unit, form.condition])

  // File handling helpers
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid format for "${file.name}". Allowed types: PNG, JPG, WEBP, PDF.`
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    }
    return null
  }

  const handleFiles = (incomingFileList) => {
    setFileError('')
    const incoming = Array.from(incomingFileList)

    if (selectedFiles.length + incoming.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files.`)
      return
    }

    const validNewItems = []
    for (const file of incoming) {
      const err = validateFile(file)
      if (err) {
        setFileError(err)
        return
      }

      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      const previewUrl = isImage ? URL.createObjectURL(file) : null

      validNewItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        sizeFormatted: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        isImage,
        isPdf,
        previewUrl,
      })
    }

    setSelectedFiles(prev => [...prev, ...validNewItems])
  }

  const removeFile = (id, e) => {
    e.stopPropagation()
    setSelectedFiles(prev => {
      const item = prev.find(f => f.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter(f => f.id !== id)
    })
  }

  const handleDragOver = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Upload files to Supabase Storage
  const uploadAllFiles = async () => {
    const images = []
    let msds_document_url = null
    const total = selectedFiles.length

    if (total === 0) return { images, msds_document_url }

    for (let i = 0; i < total; i++) {
      const item = selectedFiles[i]
      const progressPercent = Math.round(((i + 1) / total) * 100)
      setUploadProgress(progressPercent)
      setUploadStatus(`Uploading ${item.name} (${i + 1}/${total})...`)

      if (isSupabaseLive && supabase) {
        try {
          const userId = user?.id || 'anon'
          const fileExt = item.name.split('.').pop()
          const sanitizedBase = item.name.replace(/[^a-zA-Z0-9_-]/g, '_')
          const storagePath = `listings/${userId}/${Date.now()}_${sanitizedBase}`

          const { data, error } = await supabase.storage
            .from('listing-media')
            .upload(storagePath, item.file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (error) {
            console.warn(`Storage upload failed for ${item.name}:`, error.message)
          } else if (data?.path) {
            const { data: pubData } = supabase.storage
              .from('listing-media')
              .getPublicUrl(data.path)

            const publicUrl = pubData?.publicUrl || ''
            if (item.isImage) {
              images.push(publicUrl)
            } else if (item.isPdf && !msds_document_url) {
              msds_document_url = publicUrl
            }
          }
        } catch (err) {
          console.warn(`Upload error for ${item.name}:`, err.message)
        }
      } else {
        // Mock / local mode fallback
        await new Promise(r => setTimeout(r, 120))
        if (item.isImage) {
          images.push(item.previewUrl || `https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80`)
        }
        if (item.isPdf && !msds_document_url) {
          msds_document_url = `https://waste2worth.internal/docs/msds_${Date.now()}.pdf`
        }
      }
    }

    return { images, msds_document_url }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    setFileError('')

    try {
      // 1. Upload files to Supabase Storage
      const { images, msds_document_url } = await uploadAllFiles()

      setUploadStatus('Persisting listing lot to registry...')

      // 2. Submit listing payload with image URLs and MSDS URL
      await api.createListing({
        ...form,
        images,
        msds_document_url,
        seller_id: user?.id,
        company_name: user?.company || 'Northgate Steelworks Ltd.',
      })

      setIsSubmitting(false)
      navigate('/seller')
    } catch (err) {
      console.error('Failed to create listing:', err)
      setFileError(err.message || 'Failed to publish listing. Please check form fields and try again.')
      setIsSubmitting(false)
    }
  }

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
              Post Industrial Byproduct Stream
            </h1>
            <p className="text-xs sm:text-sm text-fg-secondary mt-0.5">
              Publish secondary raw materials to verified buyers with live database persistence and carbon audit scoring.
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
              placeholder="e.g., Surplus Blast Furnace Slag from Primary Smelting"
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
              placeholder="Detail the chemical composition, moisture percentage, ash content, testing reports available on request, and pickup terms..."
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

            {/* ─── Interactive Upload Dropzone ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider block">
                  Lab Test Certificates & Material Photos
                </label>
                <span className="text-[11px] text-fg-muted font-mono">
                  {selectedFiles.length}/{MAX_FILES} files selected
                </span>
              </div>

              {/* Hidden Real File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />

              {/* Drag and Drop Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                    : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-fg-muted group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-fg-primary">
                  {isDragging ? 'Drop files here to upload' : 'Click to browse or drag & drop MSDS reports or photos'}
                </p>
                <p className="text-[11px] text-fg-muted mt-1 font-mono">
                  PDF, PNG, JPG, WEBP up to 25MB • Up to {MAX_FILES} files
                </p>
              </div>

              {/* Error Message */}
              {fileError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Selected Files Thumbnail Preview List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-fg-secondary uppercase tracking-wider block">
                    Selected Uploads ({selectedFiles.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedFiles.map(fileItem => (
                      <div
                        key={fileItem.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all group"
                      >
                        {/* Thumbnail or File Icon */}
                        {fileItem.isImage && fileItem.previewUrl ? (
                          <img
                            src={fileItem.previewUrl}
                            alt={fileItem.name}
                            className="w-12 h-12 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}

                        {/* File Meta */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-fg-primary truncate" title={fileItem.name}>
                            {fileItem.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-fg-muted font-mono">
                              {fileItem.sizeFormatted}
                            </span>
                            {fileItem.isPdf && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase">
                                MSDS / PDF
                              </span>
                            )}
                            {fileItem.isImage && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                                Photo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove File Button */}
                        <button
                          type="button"
                          onClick={e => removeFile(fileItem.id, e)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-fg-muted hover:text-red-400 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            {/* Upload Progress Bar if submitting */}
            {isSubmitting && selectedFiles.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <span>{uploadStatus}</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submission Actions */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
              <Button
                type="submit"
                fullWidth
                size="lg"
                variant="primary"
                isLoading={isSubmitting}
              >
                {isSubmitting ? (uploadStatus || 'Publishing Lot...') : 'Publish Lot to Marketplace'}
              </Button>

              <Button
                type="button"
                fullWidth
                size="md"
                variant="secondary"
                disabled={isSubmitting}
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
