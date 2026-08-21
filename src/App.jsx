import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SellerDashboard from './pages/SellerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import Marketplace from './pages/Marketplace'
import CreateListing from './pages/CreateListing'
import ListingDetail from './pages/ListingDetail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { useWasteAuth, isClerkConfigured } from './lib/auth'

function RoleBasedRedirect() {
  const { role, isLoggedIn } = useWasteAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role === 'buyer') return <Navigate to="/buyer" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/seller" replace />
}

function SSOCallbackHandler() {
  if (isClerkConfigured) {
    return <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard" />
  }
  return <Navigate to="/dashboard" replace />
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, role, isLoading } = useWasteAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role) && role !== 'admin' && role !== 'both') {
    // If buyer tries to open seller, or seller tries to open buyer, redirect to their role dashboard
    return <Navigate to={role === 'buyer' ? '/buyer' : '/seller'} replace />
  }

  return children
}

function AuthRouteGuard({ children }) {
  const { isLoggedIn, role } = useWasteAuth()
  if (isLoggedIn) {
    if (role === 'buyer') return <Navigate to="/buyer" replace />
    if (role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/seller" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetail />} />

        {/* SSO OAuth Callbacks */}
        <Route path="/login/sso-callback" element={<SSOCallbackHandler />} />
        <Route path="/sso-callback" element={<SSOCallbackHandler />} />

        {/* Auth Routes with Auto-Redirect if Already Authenticated */}
        <Route path="/login/*" element={<AuthRouteGuard><Login /></AuthRouteGuard>} />
        <Route path="/signup/*" element={<AuthRouteGuard><Signup /></AuthRouteGuard>} />

        {/* Role-Based Hub Direct Redirect */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* Role-Protected Dashboards */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={['seller', 'both', 'admin']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'both', 'admin']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Operations */}
        <Route
          path="/listing/new"
          element={
            <ProtectedRoute allowedRoles={['seller', 'both', 'admin']}>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
