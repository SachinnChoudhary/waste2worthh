import { useState } from 'react'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Select } from '../components/Input'
import {
  ShieldAlert,
  Flame,
  Droplet,
  Truck,
  FileText,
  AlertTriangle,
  Search,
  CheckCircle2,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react'

export default function HazmatMsds() {
  const [selectedChemical, setSelectedChemical] = useState('spent-caustic')
  const [searchQuery, setSearchQuery] = useState('')

  const chemicalDatabase = {
    'spent-caustic': {
      id: 'spent-caustic',
      name: 'Spent Sulfidic Caustic Liquor (8-12% NaOH)',
      unNumber: 'UN 1824 / UN 1719',
      hazardClass: 'Class 8: Corrosive Substance',
      packingGroup: 'PG II',
      hazchemCode: '2R (Water Fog / Full Evacuation)',
      nfpa: { health: 3, flammability: 1, instability: 1, special: 'COR / ALK' },
      cpcbSchedule: 'Schedule II — Class B (Chemical Waste)',
      firstAid: 'Flush skin with copious water for 20 mins. For inhalation, remove to fresh air. Do not induce vomiting if ingested.',
      fireFighting: 'Use water spray or fog, dry chemical, or alcohol-resistant foam. Wear self-contained breathing apparatus (SCBA).',
      storageRules: 'Store in carbon steel or nickel-lined ISO tanks. Keep vent lines clear with caustic scrubber to capture H₂S vapors.',
      transportRequirements: 'Form 9 TREMCARD mandatory in driver cabin. CPCB GPS-tracked rubber-lined or stainless steel 316L road tankers.'
    },
    'waste-solvent': {
      id: 'waste-solvent',
      name: 'Industrial Waste Solvent (IPA & Acetone Blend)',
      unNumber: 'UN 1993',
      hazardClass: 'Class 3: Flammable Liquid',
      packingGroup: 'PG II (Flash Point 12°C)',
      hazchemCode: '3YE (Foam / Breathing Apparatus)',
      nfpa: { health: 2, flammability: 3, instability: 0, special: 'None' },
      cpcbSchedule: 'Schedule I — Item 20 (Spent Solvents)',
      firstAid: 'Wash exposed skin with mild soap and water. Move subject to ventilated space. Rinse eyes thoroughly.',
      fireFighting: 'Alcohol-resistant foam, carbon dioxide (CO₂), or dry chemical extinguisher. Cool closed drums with water spray.',
      storageRules: 'Explosion-proof grounding required. Store below 30°C in flameproof bunded warehouse.',
      transportRequirements: 'Spark-arrested exhaust tailpipes, dual earthing cables, dry powder fire extinguishers mounted on vehicle chassis.'
    },
    'pickling-liquor': {
      id: 'pickling-liquor',
      name: 'Spent Hydrochloric Acid Pickling Liquor (Ferrous Chloride)',
      unNumber: 'UN 1789',
      hazardClass: 'Class 8: Corrosive Liquid',
      packingGroup: 'PG II',
      hazchemCode: '2X (Fine Water Spray / SCBA)',
      nfpa: { health: 3, flammability: 0, instability: 1, special: 'ACID' },
      cpcbSchedule: 'Schedule I — Item 12 (Spent Acid)',
      firstAid: 'Immediate eye irrigation with neutralizing saline. Seek immediate medical attention.',
      fireFighting: 'Non-combustible liquid. Emits toxic hydrogen chloride fumes when heated; use water fog to absorb fumes.',
      storageRules: 'FRP (Fiberglass Reinforced Plastic) or Rubber Lined Tanks only. Strict avoidance of zinc or aluminum fittings.',
      transportRequirements: 'Approved acid-proof rubber lined road tankers with vacuum-breaker valves and spill containment kit.'
    },
    'lead-slurry': {
      id: 'lead-slurry',
      name: 'Spent Lead-Acid Battery Paste / Slurry',
      unNumber: 'UN 2794',
      hazardClass: 'Class 8 & Class 6.1 (Toxic / Corrosive)',
      packingGroup: 'PG III',
      hazchemCode: '2W (Water Fog / Chemical Protection)',
      nfpa: { health: 3, flammability: 0, instability: 1, special: 'TOX' },
      cpcbSchedule: 'Schedule I — Item 17 (Battery Slurry)',
      firstAid: 'Remove contaminated clothing immediately. Rinse skin with soap and warm water. Ingestion requires emergency gastric lavage.',
      fireFighting: 'Toxic lead oxide and sulfur dioxide fumes may evolve. Use dry chemical or water spray with SCBA.',
      storageRules: 'Impermeable HDPE leak-proof bins with secondary containment to capture acidic runoff.',
      transportRequirements: 'Authorized hazardous battery recyclers only. GPS geo-fenced transport with live driver panic button.'
    }
  }

  const currentChem = chemicalDatabase[selectedChemical] || chemicalDatabase['spent-caustic']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="rose" size="md" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
            UN GHS & CPCB Hazmat Protocol
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-fg-primary tracking-tight">
          Hazardous Material Transport & MSDS Safety
        </h1>
        <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
          Comprehensive Material Safety Data Sheets (MSDS), UN Dangerous Goods classifications, Transport Emergency Cards (TREMCARD), and GPS-monitored vehicle compliance for heavy industrial byproducts.
        </p>
      </div>

      {/* Safety Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/20 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg-primary">HAZCHEM Compliance</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Standardized emergency action codes (EAC) displayed on all multi-compartment tankers.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg-primary">Digital Form 9 TREMCARD</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Driver-accessible multi-lingual emergency instructions for police and fire responders.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/20 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Truck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg-primary">GPS Fleet Telemetry</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            Real-time route speed, geofence adherence, and electronic lock verification during transit.
          </p>
        </div>

        <div className="surface-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-fg-primary">16-Section GHS Spec</h3>
          <p className="text-xs text-fg-secondary leading-relaxed">
            OSHA and ISO 11014-1 compatible Safety Data Sheets for every traded chemical stream.
          </p>
        </div>
      </div>

      {/* Interactive MSDS Chemical Spec Explorer */}
      <div className="surface-card rounded-3xl p-6 sm:p-10 border border-white/[0.08] space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <Badge variant="rose" size="sm">
              Live Material Safety Inspector
            </Badge>
            <h2 className="text-2xl font-bold text-fg-primary mt-1">
              {currentChem.name}
            </h2>
          </div>

          <div className="w-full sm:w-72">
            <Select
              id="chemSelector"
              value={selectedChemical}
              onChange={e => setSelectedChemical(e.target.value)}
              options={[
                { value: 'spent-caustic', label: 'Spent Caustic Soda (NaOH)' },
                { value: 'waste-solvent', label: 'Waste Solvents (IPA/Acetone)' },
                { value: 'pickling-liquor', label: 'Spent Acid Pickling Liquor (HCl)' },
                { value: 'lead-slurry', label: 'Spent Lead-Acid Battery Slurry' }
              ]}
            />
          </div>
        </div>

        {/* Chemical Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-fg-muted font-medium block">UN Number</span>
            <span className="text-base font-bold text-cyan-400 font-mono block">{currentChem.unNumber}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-fg-muted font-medium block">Hazard Class</span>
            <span className="text-base font-bold text-rose-400 block">{currentChem.hazardClass.split(':')[0]}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-fg-muted font-medium block">HAZCHEM EAC Code</span>
            <span className="text-base font-bold text-amber-400 font-mono block">{currentChem.hazchemCode.split(' ')[0]}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[11px] text-fg-muted font-medium block">CPCB Schedule</span>
            <span className="text-base font-bold text-emerald-400 block">{currentChem.cpcbSchedule.split('—')[0]}</span>
          </div>
        </div>

        {/* Detailed MSDS Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: First Aid & Fire Fighting */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6 border border-white/[0.06] bg-zinc-900/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Section 4: First-Aid Measures</span>
              </div>
              <p className="text-xs text-fg-secondary leading-relaxed">
                {currentChem.firstAid}
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 border border-white/[0.06] bg-zinc-900/60 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>Section 5: Fire-Fighting Measures</span>
              </div>
              <p className="text-xs text-fg-secondary leading-relaxed">
                {currentChem.fireFighting}
              </p>
            </div>
          </div>

          {/* Right Column: Storage & Transport */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6 border border-white/[0.06] bg-zinc-900/60 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Section 7: Handling & Bulk Storage Protocols</span>
              </div>
              <p className="text-xs text-fg-secondary leading-relaxed">
                {currentChem.storageRules}
              </p>
            </div>

            <div className="surface-card rounded-2xl p-6 border border-white/[0.06] bg-zinc-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>Section 14: Transport Information & Form 9 TREMCARD</span>
              </div>
              <p className="text-xs text-fg-secondary leading-relaxed">
                {currentChem.transportRequirements}
              </p>
            </div>
          </div>
        </div>

        {/* NFPA 704 Diamond Visual Representation */}
        <div className="surface-card rounded-2xl p-6 border border-white/[0.08] bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-fg-primary">NFPA 704 Standard Hazard Rating</h4>
            <p className="text-xs text-fg-secondary">
              Standardized rating for emergency responder recognition during industrial byproduct transit.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-center">
              <span className="block font-bold text-base">{currentChem.nfpa.health}</span>
              <span className="text-[10px] uppercase">Health</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-center">
              <span className="block font-bold text-base">{currentChem.nfpa.flammability}</span>
              <span className="text-[10px] uppercase">Flammable</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-center">
              <span className="block font-bold text-base">{currentChem.nfpa.instability}</span>
              <span className="text-[10px] uppercase">Instability</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-fg-primary text-center">
              <span className="block font-bold text-base">{currentChem.nfpa.special}</span>
              <span className="text-[10px] uppercase">Special</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
