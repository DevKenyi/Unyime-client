import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CountryProvider } from './contexts/CountryContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage         from './pages/LandingPage'
import LoginPage           from './pages/LoginPage'
import RegisterPage        from './pages/RegisterPage'
import DiscoverPage        from './pages/DiscoverPage'
import PropertyDetailPage  from './pages/PropertyDetailPage'
import BookingPage         from './pages/BookingPage'
import BookingTrackerPage  from './pages/BookingTrackerPage'
import GuestLoginPage      from './pages/GuestLoginPage'
import GuestVerifyPage     from './pages/GuestVerifyPage'
import TermsPage           from './pages/TermsPage'

import HostDashboard       from './pages/host/HostDashboard'
import HostProperties      from './pages/host/HostProperties'
import HostPropertyForm    from './pages/host/HostPropertyForm'
import HostBookings        from './pages/host/HostBookings'
import HostCleaning        from './pages/host/HostCleaning'
import HostEarnings        from './pages/host/HostEarnings'
import HostKyc              from './pages/host/HostKyc'

import AdminDashboard      from './pages/admin/AdminDashboard'
import AdminUsers          from './pages/admin/AdminUsers'
import AdminProperties     from './pages/admin/AdminProperties'
import AdminKyc            from './pages/admin/AdminKyc'
import AdminGuestKyc       from './pages/admin/AdminGuestKyc'
import AdminPayouts        from './pages/admin/AdminPayouts'
import AdminBookings       from './pages/admin/AdminBookings'

export default function App() {
  return (
    <CountryProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / guest */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/properties" element={<DiscoverPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/properties/:slug/book" element={<BookingPage />} />
          <Route path="/booking/:bookingId/status" element={<BookingTrackerPage />} />
          <Route path="/guest/login" element={<GuestLoginPage />} />
          <Route path="/guest/verify" element={<GuestVerifyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Host dashboard */}
          <Route path="/host" element={<Navigate to="/host/dashboard" replace />} />
          <Route path="/host/dashboard" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostDashboard />
            </ProtectedRoute>
          } />
          <Route path="/host/properties" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostProperties />
            </ProtectedRoute>
          } />
          <Route path="/host/properties/new" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostPropertyForm />
            </ProtectedRoute>
          } />
          <Route path="/host/properties/:propertyId/edit" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostPropertyForm />
            </ProtectedRoute>
          } />
          <Route path="/host/bookings" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostBookings />
            </ProtectedRoute>
          } />
          <Route path="/host/cleaning" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostCleaning />
            </ProtectedRoute>
          } />
          <Route path="/host/earnings" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostEarnings />
            </ProtectedRoute>
          } />
          <Route path="/host/kyc" element={
            <ProtectedRoute allowedRoles={['HOST', 'ADMIN']}>
              <HostKyc />
            </ProtectedRoute>
          } />

          {/* Admin dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminProperties />
            </ProtectedRoute>
          } />
          <Route path="/admin/kyc" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminKyc />
            </ProtectedRoute>
          } />
          <Route path="/admin/guest-kyc" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminGuestKyc />
            </ProtectedRoute>
          } />
          <Route path="/admin/payouts" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPayouts />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBookings />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </CountryProvider>
  )
}
