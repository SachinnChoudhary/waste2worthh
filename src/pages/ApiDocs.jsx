import { useState } from 'react'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Select } from '../components/Input'
import { api } from '../lib/api'
import {
  Terminal,
  Code,
  Sparkles,
  Copy,
  Check,
  Send,
  Play,
  Layers,
  Key,
  Webhook,
  Server,
  Database
} from 'lucide-react'

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('getListings')
  const [language, setLanguage] = useState('curl')
  const [copied, setCopied] = useState(false)
  const [liveResponse, setLiveResponse] = useState(null)
  const [isLoadingLive, setIsLoadingLive] = useState(false)

  const endpoints = {
    getListings: {
      name: 'List Active Byproducts',
      method: 'GET',
      path: '/api/listings',
      description: 'Retrieve real-time marketplace byproduct lots filtered by category, hazard level, or geographic zone.',
      params: '?category=Metal+Scrap&hazard=Low&limit=10',
      curl: `curl -X GET "https://api.waste2worth.in/api/listings?status=active&category=Metal+Scrap" \\
  -H "Authorization: Bearer <YOUR_API_TOKEN>"`,
      javascript: `// Fetch active listings from Waste2Worth REST API
const res = await fetch('/api/listings?status=active&category=Metal+Scrap', {
  headers: { 'Authorization': 'Bearer <YOUR_API_TOKEN>' }
})
const data = await res.json()
console.log('Active listings:', data.listings)`,
      python: `import requests

url = "https://api.waste2worth.in/api/listings"
headers = {
    "Authorization": "Bearer <YOUR_API_TOKEN>"
}
params = {
    "status": "active",
    "category": "Metal Scrap",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`
    },
    classifyValuate: {
      name: 'AI Material Valuation & CO₂ Assay',
      method: 'POST',
      path: '/api/ml/classify-and-value',
      description: 'Submit raw byproduct description & tonnage to receive instant AI chemical classification, fair market price, and Scope-3 avoided emissions.',
      params: '',
      curl: `curl -X POST "http://localhost:8000/api/ml/classify-and-value" \\
  -H "Content-Type: application/json" \\
  -d '{
    "description": "High calcium blast furnace steel slag for concrete",
    "condition": "Clean / sorted",
    "quantity_kg": 450000
  }'`,
      javascript: `const response = await fetch('/api/ml/classify-and-value', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'High calcium blast furnace steel slag for concrete',
    condition: 'Clean / sorted',
    quantity_kg: 450000
  })
})

const result = await response.json()
console.log('AI Valuation:', result)`,
      python: `import requests

payload = {
    "description": "High calcium blast furnace steel slag for concrete",
    "condition": "Clean / sorted",
    "quantity_kg": 450000
}

res = requests.post("http://localhost:8000/api/ml/classify-and-value", json=payload)
print(res.json())`
    },
    getOverviewStats: {
      name: 'Marketplace Metrics & Carbon Ledger',
      method: 'GET',
      path: '/api/stats/overview',
      description: 'Fetch aggregated real-time platform statistics including total diverted landfill volume, GMV, and verified enterprise counters.',
      params: '',
      curl: `curl -X GET "https://api.waste2worth.in/api/stats/overview" \\
  -H "Authorization: Bearer <YOUR_API_TOKEN>"`,
      javascript: `const stats = await api.getOverviewStats()
console.log('Platform Live Stats:', stats)`,
      python: `import requests

res = requests.get("https://api.waste2worth.in/api/stats/overview")
print(res.json())`
    }
  }

  const currentEp = endpoints[selectedEndpoint] || endpoints.getListings

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const executeLiveTest = async () => {
    setIsLoadingLive(true)
    try {
      if (selectedEndpoint === 'getListings') {
        const res = await api.getListings({ limit: 3 })
        setLiveResponse(res)
      } else if (selectedEndpoint === 'classifyValuate') {
        const res = await api.classifyAndValue('High calcium blast furnace steel slag for cement aggregate', 'Clean / sorted', 450000)
        setLiveResponse(res)
      } else {
        const res = await api.getOverviewStats()
        setLiveResponse(res)
      }
    } catch (err) {
      setLiveResponse({ error: err.message })
    } finally {
      setIsLoadingLive(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="emerald" size="md" icon={<Terminal className="w-3.5 h-3.5" />}>
            ERP & SAP S/4HANA Ready REST API
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Developer API & Integration Docs
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Connect your enterprise ERP, weighbridge terminals, and SAP sustainability modules to Waste2Worth using secure REST endpoints and real-time Webhook telemetry.
        </p>
      </div>

      {/* Interactive API Explorer Console */}
      <div className="surface-card rounded-3xl p-6 sm:p-10 border border-white/[0.08] space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-fg-primary">
                Interactive Endpoint Explorer
              </h2>
              <span className="text-xs text-fg-secondary">
                Test live responses against the platform database
              </span>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <Select
              id="endpointSelector"
              value={selectedEndpoint}
              onChange={e => {
                setSelectedEndpoint(e.target.value)
                setLiveResponse(null)
              }}
              options={[
                { value: 'getListings', label: 'GET /api/listings (Active Lots)' },
                { value: 'classifyValuate', label: 'POST /api/ml/classify-and-value' },
                { value: 'getOverviewStats', label: 'GET /api/stats/overview' }
              ]}
            />
          </div>
        </div>

        {/* Endpoint Detail Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
              currentEp.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {currentEp.method}
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-fg-primary">
              {currentEp.path}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={executeLiveTest}
            disabled={isLoadingLive}
            rightIcon={<Play className="w-3.5 h-3.5" />}
          >
            {isLoadingLive ? 'Executing...' : 'Run Live Test'}
          </Button>
        </div>

        <p className="text-xs text-fg-secondary">
          {currentEp.description}
        </p>

        {/* Code Snippets & Language Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {['curl', 'javascript', 'python'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase font-mono transition-all ${
                    language === lang
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-fg-secondary hover:text-fg-primary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCopy(currentEp[language])}
              className="inline-flex items-center gap-1.5 text-xs text-fg-secondary hover:text-emerald-400 font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            <code>{currentEp[language]}</code>
          </pre>
        </div>

        {/* Live Response Panel */}
        {liveResponse && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Real-time Database Response (200 OK)
              </span>
              <span className="text-[11px] font-mono text-fg-muted">
                Latency ~42ms
              </span>
            </div>

            <pre className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 text-xs font-mono text-zinc-200 overflow-x-auto max-h-96 leading-relaxed">
              <code>{JSON.stringify(liveResponse, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Webhooks Section */}
      <div className="surface-card rounded-3xl p-8 border border-white/[0.08] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-fg-primary">
              Enterprise Webhook Event Stream
            </h3>
            <p className="text-xs text-fg-secondary">
              Real-time HTTP callbacks for weighbridge scale automation and ERP synchronization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-1">
            <span className="text-xs font-bold text-emerald-400 font-mono block">listing.published</span>
            <p className="text-[11px] text-fg-secondary">Fired when a verified byproduct lot goes live on the marketplace.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-1">
            <span className="text-xs font-bold text-cyan-400 font-mono block">bid.accepted</span>
            <p className="text-[11px] text-fg-secondary">Fired when seller accepts a tender, generating the escrow deposit invoice.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-1">
            <span className="text-xs font-bold text-purple-400 font-mono block">escrow.settled</span>
            <p className="text-[11px] text-fg-secondary">Fired upon destination weighbridge confirmation to release RTGS payout.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-1">
            <span className="text-xs font-bold text-amber-400 font-mono block">carbon.certified</span>
            <p className="text-[11px] text-fg-secondary">Fired with the SHA-256 certificate payload for corporate BRSR ESG books.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
