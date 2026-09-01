import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Database,
  Cpu,
  TrendingUp,
  Store,
  DollarSign,
  Leaf,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Download,
  Terminal,
  Settings,
  ChevronRight,
  Eye,
  Sliders,
  Award,
  FileText,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Ban,
  Check,
  X
} from 'lucide-react'
import { api } from '../lib/api'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Input, Textarea, Select } from '../components/Input'
import { wasteCategories, hazardLevels } from '../data'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'listings' | 'bids' | 'users' | 'mllab' | 'settings'
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Data states
  const [overviewStats, setOverviewStats] = useState(null)
  const [systemHealth, setSystemHealth] = useState(null)
  const [listings, setListings] = useState([])
  const [bids, setBids] = useState([])
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [settings, setSettings] = useState({
    aiAutoApproval: true,
    maintenanceMode: false,
    emailNotifications: true,
    highValueAuditThresholdInr: 1000000
  })

  // Filters & Search
  const [listingSearch, setListingSearch] = useState('')
  const [listingCategoryFilter, setListingCategoryFilter] = useState('all')
  const [listingStatusFilter, setListingStatusFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [bidFilter, setBidFilter] = useState('all')

  // Modals / Drawer states
  const [editingListing, setEditingListing] = useState(null)
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)

  // ML Lab states
  const [mlInputDesc, setMlInputDesc] = useState('High-grade copper scrap wire and busbar offcuts from electrical switchgear')
  const [mlInputCondition, setMlInputCondition] = useState('Clean / sorted')
  const [mlInputQty, setMlInputQty] = useState(2500)
  const [mlOutput, setMlOutput] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlMatchInterests, setMlMatchInterests] = useState('Looking for industrial grade copper wire and scrap metal')
  const [mlMatchResults, setMlMatchResults] = useState(null)
  const [mlMatchLoading, setMlMatchLoading] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load all platform data
  const loadPlatformData = async () => {
    setRefreshing(true)
    try {
      const [ovRes, healthRes, listRes, bidsRes, usersRes, logsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminSystemHealth(),
        api.getAdminListings(),
        api.getAdminBids(),
        api.getAdminUsers(),
        api.getAdminAuditLogs()
      ])

      if (ovRes) {
        setOverviewStats(ovRes.stats)
        if (ovRes.settings) setSettings(ovRes.settings)
      }
      if (healthRes) setSystemHealth(healthRes)
      if (listRes?.listings) setListings(listRes.listings)
      if (bidsRes?.bids) setBids(bidsRes.bids)
      if (usersRes?.users) setUsers(usersRes.users)
      if (logsRes?.logs) setAuditLogs(logsRes.logs)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      showToast('Error synchronizing admin platform data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadPlatformData()
  }, [])

  // Listing Handlers
  const handleUpdateListingStatus = async (id, status) => {
    try {
      await api.updateAdminListing(id, { status })
      setListings(prev => prev.map(l => String(l.id) === String(id) ? { ...l, status } : l))
      showToast(`Listing #${id} status changed to ${status.toUpperCase()}`)
      loadPlatformData()
    } catch (e) {
      showToast('Failed to update listing status')
    }
  }

  const handleSaveEditedListing = async (e) => {
    e.preventDefault()
    if (!editingListing) return
    try {
      await api.updateAdminListing(editingListing.id, editingListing)
      setListings(prev => prev.map(l => String(l.id) === String(editingListing.id) ? editingListing : l))
      setEditingListing(null)
      showToast(`Listing "${editingListing.title}" successfully updated`)
      loadPlatformData()
    } catch (e) {
      showToast('Failed to update listing details')
    }
  }

  const handleReEvaluateAI = async (id) => {
    try {
      showToast('Running live ML inference re-valuation...')
      const res = await api.reEvaluateAdminListing(id)
      if (res?.listing) {
        setListings(prev => prev.map(l => String(l.id) === String(id) ? res.listing : l))
        showToast(`AI Re-evaluation complete! Valuation: ${res.listing.aiValuation}`)
      }
    } catch (e) {
      showToast('AI re-evaluation failed')
    }
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm(`Are you sure you want to delete listing #${id}?`)) return
    try {
      await api.deleteAdminListing(id)
      setListings(prev => prev.filter(l => String(l.id) !== String(id)))
      showToast(`Listing #${id} removed from marketplace`)
      loadPlatformData()
    } catch (e) {
      showToast('Failed to delete listing')
    }
  }

  // Bid Handlers
  const handleOverrideBidStatus = async (id, status) => {
    try {
      await api.updateAdminBid(id, { status, overrideReason: 'Admin One-Click Action' })
      setBids(prev => prev.map(b => String(b.id) === String(id) ? { ...b, status } : b))
      showToast(`Bid #${id} marked as ${status.toUpperCase()}`)
      loadPlatformData()
    } catch (e) {
      showToast('Failed to update bid')
    }
  }

  // User / Enterprise Handlers
  const handleToggleUserKYC = async (user) => {
    const nextVerified = !user.verified
    try {
      await api.updateAdminUser(user.id, { verified: nextVerified })
      setUsers(prev => prev.map(u => String(u.id) === String(user.id) ? { ...u, verified: nextVerified } : u))
      showToast(`KYC for ${user.company_name} set to ${nextVerified ? 'VERIFIED' : 'PENDING'}`)
    } catch (e) {
      showToast('Failed to update user KYC')
    }
  }

  const handleToggleUserBan = async (user) => {
    const nextBanned = !user.isBanned
    try {
      await api.updateAdminUser(user.id, { isBanned: nextBanned })
      setUsers(prev => prev.map(u => String(u.id) === String(user.id) ? { ...u, isBanned: nextBanned } : u))
      showToast(`${user.company_name} account has been ${nextBanned ? 'SUSPENDED' : 'UNBANNED'}`)
    } catch (e) {
      showToast('Failed to update account status')
    }
  }

  const handleSaveEditedUser = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      await api.updateAdminUser(editingUser.id, editingUser)
      setUsers(prev => prev.map(u => String(u.id) === String(editingUser.id) ? editingUser : u))
      setEditingUser(null)
      showToast(`Profile for ${editingUser.company_name} updated`)
    } catch (e) {
      showToast('Failed to save profile changes')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = {
      company_name: formData.get('company_name'),
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      role: formData.get('role'),
      gstin: formData.get('gstin'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      state: formData.get('state'),
      credit_score: Number(formData.get('credit_score')) || 800,
      verified: true
    }
    try {
      await api.createAdminUser(payload)
      setIsNewUserModalOpen(false)
      showToast(`New enterprise "${payload.company_name}" enrolled`)
      loadPlatformData()
    } catch (e) {
      showToast('Failed to enroll new enterprise')
    }
  }

  // ML Playground Handlers
  const handleRunMlDiagnostic = async (e) => {
    e?.preventDefault()
    setMlLoading(true)
    try {
      const res = await api.classifyAndValue(mlInputDesc, mlInputCondition, Number(mlInputQty))
      setMlOutput(res)
      showToast('ML inference analysis computed successfully')
    } catch (err) {
      showToast('ML inference failed')
    } finally {
      setMlLoading(false)
    }
  }

  const handleRunBuyerMatch = async (e) => {
    e?.preventDefault()
    setMlMatchLoading(true)
    try {
      const res = await api.getBuyerRecommendations(mlMatchInterests, 5)
      setMlMatchResults(res)
      showToast('Buyer vector cosine similarity matching computed')
    } catch (err) {
      showToast('Buyer matching failed')
    } finally {
      setMlMatchLoading(false)
    }
  }

  // System Settings Handlers
  const handleToggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    try {
      await api.updateAdminSystemSettings(updated)
      showToast(`System setting "${key}" updated`)
    } catch (e) {
      showToast('Failed to update system setting')
    }
  }

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      platformStats: overviewStats,
      systemHealth,
      totalListings: listings.length,
      listings,
      totalBids: bids.length,
      bids,
      totalUsers: users.length,
      users,
      auditLogs
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waste2worth-admin-dump-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Platform data JSON archive downloaded!')
  }

  // Filtered lists
  const filteredListings = listings.filter(l => {
    const matchesSearch = !listingSearch ||
      l.title?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.company?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.category?.toLowerCase().includes(listingSearch.toLowerCase())
    const matchesCat = listingCategoryFilter === 'all' || l.category === listingCategoryFilter
    const matchesStatus = listingStatusFilter === 'all' || (l.status || 'active').toLowerCase() === listingStatusFilter.toLowerCase()
    return matchesSearch && matchesCat && matchesStatus
  })

  const filteredUsers = users.filter(u => {
    return !userSearch ||
      u.company_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.gstin?.toLowerCase().includes(userSearch.toLowerCase())
  })

  const filteredBids = bids.filter(b => {
    return bidFilter === 'all' || (b.status || 'pending').toLowerCase() === bidFilter.toLowerCase()
  })

  return (
    <div className="min-h-screen pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Control Header */}
      <div className="border-b border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-zinc-950" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-fg-primary tracking-tight flex items-center gap-2">
                    Waste2Worth Command Center
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SuperAdmin
                    </span>
                  </h1>
                  <p className="text-xs text-fg-muted">
                    Full lifecycle oversight • Material Listings • Escrow Bids • Industrial KYC • AI Telemetry
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Pills & Actions */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-fg-secondary font-mono text-[11px]">API Gateway</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs">
                <span className={`w-2 h-2 rounded-full ${systemHealth?.mlService?.status === 'offline' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-fg-secondary font-mono text-[11px]">AI Engine</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-fg-secondary font-mono text-[11px]">{systemHealth?.database?.provider || 'Database'}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={loadPlatformData}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
              >
                Sync
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportData}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export JSON
              </Button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 no-scrollbar border-t border-white/[0.06] pt-3">
            {[
              { id: 'overview', label: 'Command Overview', icon: Activity, count: null },
              { id: 'listings', label: 'Listings Control', icon: Store, count: listings.length },
              { id: 'bids', label: 'Bids & Deals', icon: DollarSign, count: bids.length },
              { id: 'users', label: 'Enterprise & KYC', icon: Users, count: users.length },
              { id: 'mllab', label: 'AI Inference Lab', icon: Cpu, count: null },
              { id: 'settings', label: 'Audit Logs & Settings', icon: Settings, count: auditLogs.length }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                    ${isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                      : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.04] border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/[0.06] text-fg-muted'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ---------------------------------------------------- */}
        {/* TAB 1: COMMAND OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Gross Platform Volume"
                value={`${overviewStats?.impact?.grossVolumeTonnes || '548.0'} T`}
                description="Industrial waste listed & diverted"
                icon={<Leaf className="w-5 h-5" />}
                accentColor="emerald"
              />
              <StatCard
                title="Platform GMV Traded"
                value={overviewStats?.impact?.totalGmvFormatted || '₹48,04,000'}
                description="Gross industrial marketplace valuation"
                icon={<DollarSign className="w-5 h-5" />}
                accentColor="cyan"
              />
              <StatCard
                title="Active Escrow Bids"
                value={`${overviewStats?.bids?.total || bids.length}`}
                description={`${overviewStats?.bids?.accepted || 0} accepted • ${overviewStats?.bids?.pending || 0} in negotiation`}
                icon={<TrendingUp className="w-5 h-5" />}
                accentColor="blue"
              />
              <StatCard
                title="Enterprise Directory"
                value={`${overviewStats?.users?.total || users.length}`}
                description={`${overviewStats?.users?.verified || 0} KYC verified manufacturers`}
                icon={<Users className="w-5 h-5" />}
                accentColor="purple"
              />
            </div>

            {/* Platform Health & AI Diagnostics Banner */}
            <div className="surface-card rounded-2xl p-6 relative overflow-hidden border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h2 className="text-base font-bold text-fg-primary">Live Microservices & Model Pipeline Telemetry</h2>
                  </div>
                  <p className="text-xs text-fg-secondary max-w-2xl">
                    All core components are synchronized. AI valuation regressor, category classifier, and Cloud Database persistence are operational.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="text-fg-secondary">AI Engine:</span>
                      <span className="font-mono text-emerald-400 font-bold">{systemHealth?.mlService?.status?.toUpperCase() || 'HEALTHY'}</span>
                      {systemHealth?.mlService?.latencyMs && (
                        <span className="text-fg-muted font-mono text-[10px]">({systemHealth.mlService.latencyMs}ms)</span>
                      )}
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span className="text-fg-secondary">DB Cluster:</span>
                      <span className="font-mono text-cyan-400 font-bold">{systemHealth?.database?.provider || 'Resilient Storage'}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-fg-secondary">AI Auto-Approval:</span>
                      <span className="font-mono text-amber-400 font-bold">{settings.aiAutoApproval ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('mllab')}
                    leftIcon={<Cpu className="w-4 h-4" />}
                  >
                    Open AI Sandbox
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('listings')}
                    leftIcon={<Store className="w-4 h-4" />}
                  >
                    Manage Listings
                  </Button>
                </div>
              </div>
            </div>

            {/* Two Column Grid: Recent Moderation Queue & Recent Bids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listings Moderation Queue */}
              <div className="surface-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-fg-primary">Recent Material Listings</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View all ({listings.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {listings.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-fg-primary truncate">{item.title}</span>
                          <Badge variant={item.status === 'active' ? 'success' : item.status === 'pending' ? 'warning' : 'neutral'} size="sm">
                            {item.status || 'active'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-fg-muted flex items-center gap-2 mt-0.5">
                          <span>{item.company}</span>
                          <span>•</span>
                          <span>{item.quantity}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-semibold">{item.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleReEvaluateAI(item.id)}
                          title="Re-run AI Valuation"
                          className="p-1.5 rounded-lg text-fg-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingListing(item)}
                          title="Edit Listing"
                          className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bids & Deal Escrow Pipeline */}
              <div className="surface-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-fg-primary">Live Bids & Escrow Negotiations</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bids')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View all ({bids.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {bids.slice(0, 4).map(bid => (
                    <div
                      key={bid.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-fg-primary truncate">{bid.buyer_company || 'Verified Buyer'}</span>
                          <Badge variant={bid.status === 'accepted' ? 'success' : bid.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                            {bid.status || 'pending'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-fg-muted flex items-center gap-2 mt-0.5">
                          <span>Lot: {bid.listingTitle || `Listing #${bid.listing_id}`}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-semibold">₹{(bid.bid_amount_inr || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {bid.status !== 'accepted' && (
                          <button
                            onClick={() => handleOverrideBidStatus(bid.id, 'accepted')}
                            title="Force Accept Deal"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {bid.status !== 'rejected' && (
                          <button
                            onClick={() => handleOverrideBidStatus(bid.id, 'rejected')}
                            title="Reject Offer"
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Platform Audit Trail */}
            <div className="surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-fg-primary">Live Platform Audit Trail & Events</h3>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-xs text-fg-muted hover:text-fg-secondary cursor-pointer"
                >
                  Full logs ({auditLogs.length})
                </button>
              </div>

              <div className="space-y-2">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-zinc-950/40 border border-white/[0.04] flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white/[0.06] text-fg-secondary uppercase">
                        {log.action}
                      </span>
                      <span className="font-semibold text-fg-primary truncate">{log.entity}</span>
                      <span className="text-fg-muted truncate">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-fg-muted font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: LISTINGS CONTROL */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Filter Toolbar */}
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-fg-primary">Material Listings Inventory</h2>
                  <p className="text-xs text-fg-muted">Approve, modify pricing, re-run AI valuations, or purge marketplace lots</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsNewListingModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    + Add New Listing
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.06]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-fg-muted" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={e => setListingSearch(e.target.value)}
                    placeholder="Search titles, enterprise, location..."
                    className="input-base pl-9 text-xs"
                  />
                </div>
                <div>
                  <select
                    value={listingCategoryFilter}
                    onChange={e => setListingCategoryFilter(e.target.value)}
                    className="input-base text-xs"
                  >
                    <option value="all">All Waste Categories</option>
                    {wasteCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <select
                    value={listingStatusFilter}
                    onChange={e => setListingStatusFilter(e.target.value)}
                    className="input-base text-xs"
                  >
                    <option value="all">All Lifecycle Statuses</option>
                    <option value="active">Active & Live</option>
                    <option value="pending">Pending Approval</option>
                    <option value="flagged">Flagged / Suspended</option>
                    <option value="completed">Completed / Sold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Data Table */}
            <div className="surface-card rounded-2xl overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02] text-fg-secondary">
                      <th className="py-3.5 px-4 font-semibold">Material Listing</th>
                      <th className="py-3.5 px-4 font-semibold">Enterprise</th>
                      <th className="py-3.5 px-4 font-semibold">Category & Hazard</th>
                      <th className="py-3.5 px-4 font-semibold">Quantity</th>
                      <th className="py-3.5 px-4 font-semibold">Asking Price</th>
                      <th className="py-3.5 px-4 font-semibold">AI Valuation</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-fg-muted">
                          No listings match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredListings.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-fg-primary">{item.title}</div>
                            <div className="text-[10px] text-fg-muted flex items-center gap-1 font-mono">
                              ID: {item.id} • {item.location || 'India'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-fg-secondary">
                            {item.company || 'Enterprise Seller'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-fg-primary font-medium">{item.category}</span>
                              <Badge variant={item.hazard === 'High' ? 'danger' : item.hazard === 'Moderate' ? 'warning' : 'neutral'} size="sm">
                                {item.hazard || 'Non-hazardous'}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-fg-primary">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                            {item.price}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-cyan-400 font-mono text-[11px] font-semibold">{item.aiValuation || '₹—'}</div>
                            <div className="text-[10px] text-fg-muted flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              {item.aiConfidence || 92}% confidence
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={item.status || 'active'}
                              onChange={e => handleUpdateListingStatus(item.id, e.target.value)}
                              className="input-base text-xs py-1 h-7 px-2 font-mono bg-zinc-900 border-white/10"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="flagged">Flagged</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReEvaluateAI(item.id)}
                                title="Re-run AI Valuation"
                                className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingListing(item)}
                                title="Edit Listing Details"
                                className="p-1.5 rounded-lg text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06] transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(item.id)}
                                title="Delete Listing"
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: BIDS & ESCROW MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'bids' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-fg-primary">Bids & Procurement Deal Escrow</h2>
                  <p className="text-xs text-fg-muted">Oversight of buyer offers, logistics commitments, and transaction overrides</p>
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'pending', 'accepted', 'rejected'].map(st => (
                    <button
                      key={st}
                      onClick={() => setBidFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                        bidFilter === st ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-white/[0.04] text-fg-secondary border border-transparent'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBids.map(bid => (
                <div key={bid.id} className="surface-card rounded-2xl p-5 space-y-4 flex flex-col justify-between border border-white/10 hover:border-cyan-500/30 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-fg-muted">BID REF #{bid.id}</span>
                        <h3 className="text-sm font-bold text-fg-primary">{bid.buyer_company || 'Verified Buyer'}</h3>
                      </div>
                      <Badge variant={bid.status === 'accepted' ? 'success' : bid.status === 'rejected' ? 'danger' : 'warning'}>
                        {bid.status || 'pending'}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-muted">Material Lot:</span>
                        <span className="font-semibold text-fg-primary truncate max-w-[160px]">{bid.listingTitle || `Listing #${bid.listing_id}`}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-muted">Total Offer:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">₹{(bid.bid_amount_inr || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-muted">Volume Offered:</span>
                        <span className="font-mono text-fg-secondary">{bid.bid_quantity} {bid.unit || 'tonnes'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-fg-muted">Logistics Mode:</span>
                        <span className="capitalize text-fg-secondary font-mono text-[11px]">{bid.proposed_logistics?.replace('_', ' ') || 'Buyer Pickup'}</span>
                      </div>
                    </div>

                    {bid.message && (
                      <p className="text-xs text-fg-muted italic bg-zinc-950/40 p-2.5 rounded-lg border border-white/[0.04]">
                        "{bid.message}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="text-[10px] text-fg-muted font-mono">
                      {new Date(bid.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={bid.status === 'accepted' ? 'secondary' : 'primary'}
                        onClick={() => handleOverrideBidStatus(bid.id, 'accepted')}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOverrideBidStatus(bid.id, 'rejected')}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: ENTERPRISE & KYC USERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="surface-card rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-fg-primary">Industrial Enterprise Directory & KYC</h2>
                  <p className="text-xs text-fg-muted">Verify GSTIN registrations, assign roles, calibrate credit ratings, and enforce compliance</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewUserModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  + Enroll Enterprise
                </Button>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-fg-muted" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search company name, GSTIN, person or email..."
                    className="input-base pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`surface-card rounded-2xl p-5 space-y-4 border transition-all ${
                    user.isBanned ? 'border-rose-500/40 bg-rose-950/10' : 'border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {user.company_name ? user.company_name.slice(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-fg-primary flex items-center gap-1.5">
                          {user.company_name}
                          {user.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </h3>
                        <p className="text-xs text-fg-muted">{user.full_name} • {user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === 'seller' ? 'primary' : user.role === 'buyer' ? 'info' : 'warning'} size="sm">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">GSTIN:</span>
                      <span className="font-mono text-fg-primary font-semibold">{user.gstin || '27AAACT0000A1Z5'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Credit Score:</span>
                      <span className="font-mono font-bold text-emerald-400">{user.credit_score || 850} / 1000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Location:</span>
                      <span className="text-fg-secondary">{user.city || 'Mumbai'}, {user.state || 'Maharashtra'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleUserKYC(user)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        user.verified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {user.verified ? 'KYC Verified' : 'Verify KYC'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingUser(user)}
                        title="Edit User Profile"
                        className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserBan(user)}
                        title={user.isBanned ? 'Unban Account' : 'Suspend Account'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.isBanned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: AI / ML INFERENCE LABORATORY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'mllab' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Telemetry */}
            <div className="surface-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-fg-primary flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    Waste2Worth Live AI Inference & Valuation Laboratory
                  </h2>
                  <p className="text-xs text-fg-muted">
                    Test classification algorithms, AI price estimators, CO₂ carbon formulas, and buyer vector matching in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live AI Inference Service
                  </span>
                </div>
              </div>

              {/* Models Loaded Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/[0.06]">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-fg-muted block text-[10px]">CLASSIFIER</span>
                  <span className="font-semibold text-fg-primary">TF-IDF + Random Forest</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-fg-muted block text-[10px]">VALUATION REGRESSOR</span>
                  <span className="font-semibold text-emerald-400">RandomForestRegressor (USD/kg)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-fg-muted block text-[10px]">ESG METRICS</span>
                  <span className="font-semibold text-cyan-400">Carbon & Landfill Formulas</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <span className="text-fg-muted block text-[10px]">BUYER MATCHING</span>
                  <span className="font-semibold text-purple-400">Cosine Similarity Vectors</span>
                </div>
              </div>
            </div>

            {/* Interactive Lab 1: Scrap Classification & Valuation Playground */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="surface-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-fg-primary">Interactive Material Classifier & Valuation Test</h3>
                </div>

                <form onSubmit={handleRunMlDiagnostic} className="space-y-3">
                  <div>
                    <label className="text-xs text-fg-secondary mb-1 block">Industrial Scrap Description</label>
                    <Textarea
                      rows={3}
                      value={mlInputDesc}
                      onChange={e => setMlInputDesc(e.target.value)}
                      placeholder="e.g. Spent lithium battery cells, crushed HDPE containers, blast furnace slag..."
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-fg-secondary mb-1 block">Material Condition</label>
                      <select
                        value={mlInputCondition}
                        onChange={e => setMlInputCondition(e.target.value)}
                        className="input-base text-xs"
                      >
                        <option value="Clean / sorted">Clean / sorted (1.15x)</option>
                        <option value="Baled">Baled (1.05x)</option>
                        <option value="Loose">Loose (0.95x)</option>
                        <option value="Mixed / unsorted">Mixed / unsorted (0.85x)</option>
                        <option value="Contaminated">Contaminated (0.55x)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-fg-secondary mb-1 block">Batch Quantity (kg)</label>
                      <Input
                        type="number"
                        value={mlInputQty}
                        onChange={e => setMlInputQty(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={mlLoading}
                    leftIcon={<Cpu className="w-4 h-4" />}
                  >
                    Run Live Model Inference
                  </Button>
                </form>
              </div>

              {/* ML Output Display Panel */}
              <div className="surface-card rounded-2xl p-6 flex flex-col justify-between border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-fg-primary flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Inference Engine Results
                    </h3>
                    {mlOutput && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {mlOutput.pricing_model || 'ML Active'}
                      </span>
                    )}
                  </div>

                  {mlOutput ? (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
                          <span className="text-[10px] text-fg-muted block">PREDICTED CATEGORY</span>
                          <span className="text-sm font-bold text-fg-primary">{mlOutput.category}</span>
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            {Math.round((mlOutput.classification_confidence || 0.95) * 100)}% Confidence
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
                          <span className="text-[10px] text-fg-muted block">HAZARD CLASSIFICATION</span>
                          <span className="text-sm font-bold text-fg-primary">{mlOutput.hazard_level || 'Low'}</span>
                          <div className="text-[10px] text-fg-muted mt-0.5">OSHA / CPCB Compliance</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-fg-secondary">Estimated Market Value:</span>
                          <span className="text-xl font-bold font-mono text-emerald-400">
                            ₹{Math.round((mlOutput.estimated_value_usd || 100) * 83).toLocaleString('en-IN')}
                            <span className="text-xs text-fg-muted font-normal"> (${mlOutput.estimated_value_usd} USD)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.08]">
                          <span className="text-fg-muted">CO₂e Prevented:</span>
                          <span className="font-mono text-cyan-400 font-semibold">{mlOutput.co2_reduction_kg || 0} kg CO₂e</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-fg-muted">Disposal Cost Avoided:</span>
                          <span className="font-mono text-fg-secondary">₹{Math.round((mlOutput.disposal_cost_saved_usd || 0) * 83).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-fg-muted space-y-2">
                      <Cpu className="w-8 h-8 mx-auto text-fg-muted opacity-40" />
                      <p className="text-xs">Click "Run Live Model Inference" to evaluate scrap input.</p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-fg-muted font-mono pt-4 border-t border-white/[0.06]">
                  Latency: 12ms • Feature Dimension: 128 • Vectorizer: TfidfVectorizer
                </div>
              </div>
            </div>

            {/* Interactive Lab 2: Buyer Matching Vector Engine */}
            <div className="surface-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-fg-primary">Buyer Sourcing Interest Vector Matcher (TF-IDF Cosine Similarity)</h3>
                </div>
              </div>

              <form onSubmit={handleRunBuyerMatch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={mlMatchInterests}
                  onChange={e => setMlMatchInterests(e.target.value)}
                  placeholder="Enter buyer requirement string..."
                  className="input-base text-xs flex-1"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  loading={mlMatchLoading}
                  leftIcon={<Search className="w-4 h-4" />}
                >
                  Find Matching Lots
                </Button>
              </form>

              {mlMatchResults && mlMatchResults.matches && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] animate-in fade-in">
                  {mlMatchResults.matches.map((match, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-fg-primary">{match.category}</span>
                        <span className="text-purple-400 font-mono font-bold">{Math.round(match.match_score * 100)}% Match</span>
                      </div>
                      <p className="text-fg-muted text-[11px] line-clamp-2">{match.description}</p>
                      <div className="text-[10px] font-mono text-emerald-400 pt-1">
                        Est. Val: ${match.market_value_usd}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: AUDIT LOGS & PLATFORM SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* System Configuration Controls */}
            <div className="surface-card rounded-2xl p-6 space-y-6 border border-white/10">
              <div>
                <h2 className="text-base font-bold text-fg-primary">Global Platform Switches & Controls</h2>
                <p className="text-xs text-fg-muted">Master toggles governing automation, compliance audits, and marketplace operational mode</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-fg-primary">AI Automated Listing Approval</h4>
                    <p className="text-[11px] text-fg-muted">Auto-publish listings when ML confidence exceeds 85%</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('aiAutoApproval')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.aiAutoApproval ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.aiAutoApproval ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-fg-primary">Maintenance Mode</h4>
                    <p className="text-[11px] text-fg-muted">Temporarily freeze bid submissions for planned migrations</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('maintenanceMode')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.maintenanceMode ? 'bg-rose-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-fg-primary">Enterprise Email & SMS Dispatch</h4>
                    <p className="text-[11px] text-fg-muted">Simulate outgoing alerts upon bid acceptance</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('emailNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.emailNotifications ? 'bg-cyan-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-fg-primary">Data Backup & Export Snapshot</h4>
                    <p className="text-[11px] text-fg-muted">Download entire database in JSON format</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={handleExportData} leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Complete Audit Log Stream */}
            <div className="surface-card rounded-2xl p-6 space-y-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-fg-primary flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Complete Immutable Platform Audit Log
                  </h3>
                  <p className="text-xs text-fg-muted">Chronological record of administrative interventions, transactions, and KYC modifications</p>
                </div>
                <Badge variant="neutral">{auditLogs.length} Total Events</Badge>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
                        log.type === 'user' ? 'bg-purple-500/20 text-purple-300' :
                        log.type === 'listing' ? 'bg-emerald-500/20 text-emerald-300' :
                        log.type === 'bid' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-zinc-800 text-fg-secondary'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-semibold text-fg-primary shrink-0">{log.entity}:</span>
                      <span className="text-fg-secondary truncate">{log.details}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-fg-muted font-mono">
                      <span>By: {log.performed_by || 'Admin'}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT LISTING */}
      {/* ---------------------------------------------------- */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 space-y-4 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-fg-primary">Edit Listing #{editingListing.id}</h3>
              <button onClick={() => setEditingListing(null)} className="text-fg-muted hover:text-fg-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedListing} className="space-y-3 text-xs">
              <div>
                <label className="text-fg-secondary mb-1 block">Title</label>
                <Input
                  value={editingListing.title || ''}
                  onChange={e => setEditingListing({ ...editingListing, title: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Category</label>
                  <select
                    value={editingListing.category || 'Metal Scrap'}
                    onChange={e => setEditingListing({ ...editingListing, category: e.target.value })}
                    className="input-base text-xs"
                  >
                    {wasteCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Hazard Level</label>
                  <select
                    value={editingListing.hazard || 'Non-hazardous'}
                    onChange={e => setEditingListing({ ...editingListing, hazard: e.target.value })}
                    className="input-base text-xs"
                  >
                    {hazardLevels.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Quantity</label>
                  <Input
                    value={editingListing.quantity || ''}
                    onChange={e => setEditingListing({ ...editingListing, quantity: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Price</label>
                  <Input
                    value={editingListing.price || ''}
                    onChange={e => setEditingListing({ ...editingListing, price: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block">Status</label>
                <select
                  value={editingListing.status || 'active'}
                  onChange={e => setEditingListing({ ...editingListing, status: e.target.value })}
                  className="input-base text-xs"
                >
                  <option value="active">Active & Live</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-fg-secondary mb-1 block">Description</label>
                <Textarea
                  rows={3}
                  value={editingListing.description || ''}
                  onChange={e => setEditingListing({ ...editingListing, description: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingListing(null)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT ENTERPRISE USER */}
      {/* ---------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 space-y-4 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-fg-primary">Edit Profile: {editingUser.company_name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-fg-muted hover:text-fg-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-3 text-xs">
              <div>
                <label className="text-fg-secondary mb-1 block">Company Name</label>
                <Input
                  value={editingUser.company_name || ''}
                  onChange={e => setEditingUser({ ...editingUser, company_name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Contact Person</label>
                  <Input
                    value={editingUser.full_name || ''}
                    onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Role</label>
                  <select
                    value={editingUser.role || 'seller'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="input-base text-xs"
                  >
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">GSTIN</label>
                  <Input
                    value={editingUser.gstin || ''}
                    onChange={e => setEditingUser({ ...editingUser, gstin: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Credit Rating (0-1000)</label>
                  <Input
                    type="number"
                    value={editingUser.credit_score || 800}
                    onChange={e => setEditingUser({ ...editingUser, credit_score: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userVerified"
                  checked={editingUser.verified || false}
                  onChange={e => setEditingUser({ ...editingUser, verified: e.target.checked })}
                  className="rounded border-white/20"
                />
                <label htmlFor="userVerified" className="text-fg-primary text-xs cursor-pointer">
                  KYC Verified & Certified Industrial Partner
                </label>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Update Profile</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ENROLL NEW ENTERPRISE USER */}
      {/* ---------------------------------------------------- */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 space-y-4 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-fg-primary">Enroll New Industrial Enterprise</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-fg-muted hover:text-fg-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-fg-secondary mb-1 block">Company Name</label>
                <Input name="company_name" required placeholder="e.g. JSW Steel Ltd." className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Full Name</label>
                  <Input name="full_name" required placeholder="e.g. Sandeep Patil" className="text-xs" />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Corporate Email</label>
                  <Input name="email" type="email" required placeholder="e.g. circular@jsw.in" className="text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Role</label>
                  <select name="role" className="input-base text-xs">
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                  </select>
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">GSTIN</label>
                  <Input name="gstin" placeholder="27AAACJ1234F1Z8" className="text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">City</label>
                  <Input name="city" defaultValue="Mumbai" className="text-xs" />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Credit Rating</label>
                  <Input name="credit_score" type="number" defaultValue="850" className="text-xs" />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsNewUserModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Enroll Enterprise</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE LISTING AS ADMIN */}
      {/* ---------------------------------------------------- */}
      {isNewListingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl max-w-lg w-full p-6 space-y-4 border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-fg-primary">Publish New Waste Listing (Admin Mode)</h3>
              <button onClick={() => setIsNewListingModalOpen(false)} className="text-fg-muted hover:text-fg-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const payload = {
                  title: formData.get('title'),
                  category: formData.get('category'),
                  hazard: formData.get('hazard'),
                  quantity: formData.get('quantity'),
                  price: formData.get('price'),
                  location: formData.get('location'),
                  company_name: formData.get('company_name'),
                  description: formData.get('description'),
                  condition: 'Clean / sorted'
                }
                try {
                  await api.createListing(payload)
                  setIsNewListingModalOpen(false)
                  showToast('New listing published to marketplace')
                  loadPlatformData()
                } catch (err) {
                  showToast('Failed to create listing')
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-fg-secondary mb-1 block">Listing Title</label>
                <Input name="title" required placeholder="e.g. Copper Cathode Scrap — Grade 1" className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Category</label>
                  <select name="category" className="input-base text-xs">
                    {wasteCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Hazard</label>
                  <select name="hazard" className="input-base text-xs">
                    {hazardLevels.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Quantity</label>
                  <Input name="quantity" required placeholder="e.g. 50 tonnes" className="text-xs" />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Price</label>
                  <Input name="price" placeholder="e.g. ₹5,20,000/tonne" className="text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-fg-secondary mb-1 block">Enterprise Name</label>
                  <Input name="company_name" defaultValue="Northgate Steelworks Ltd." className="text-xs" />
                </div>
                <div>
                  <label className="text-fg-secondary mb-1 block">Location</label>
                  <Input name="location" defaultValue="Jamshedpur, Jharkhand" className="text-xs" />
                </div>
              </div>
              <div>
                <label className="text-fg-secondary mb-1 block">Description</label>
                <Textarea name="description" rows={2} placeholder="Specification, purity, packaging..." className="text-xs" />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsNewListingModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Publish Listing</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
