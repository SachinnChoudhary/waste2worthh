import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<Signup />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/buyer" element={<BuyerDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/new" element={<CreateListing />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
