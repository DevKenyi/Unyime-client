import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard, ClipboardList, Home, Wallet,
  Users, ShieldCheck, Banknote, LogOut, Menu, X, BadgeCheck,
} from 'lucide-react'

interface NavItem { label: string; to: string; icon: ReactNode }

const HOST_NAV: NavItem[] = [
  { label: 'Dashboard',  to: '/host/dashboard',  icon: <LayoutDashboard size={17} /> },
  { label: 'Properties', to: '/host/properties', icon: <Home size={17} /> },
  { label: 'Bookings',   to: '/host/bookings',   icon: <ClipboardList size={17} /> },
  { label: 'Earnings',   to: '/host/earnings',   icon: <Wallet size={17} /> },
  { label: 'Verification', to: '/host/kyc',      icon: <BadgeCheck size={17} /> },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',   to: '/admin/dashboard',  icon: <LayoutDashboard size={17} /> },
  { label: 'Properties',  to: '/admin/properties', icon: <Home size={17} /> },
  { label: 'Bookings',    to: '/admin/bookings',   icon: <ClipboardList size={17} /> },
  { label: 'Users',       to: '/admin/users',      icon: <Users size={17} /> },
  { label: 'Verification', to: '/admin/kyc',       icon: <ShieldCheck size={17} /> },
  { label: 'Payouts',     to: '/admin/payouts',    icon: <Banknote size={17} /> },
]

interface Props { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : HOST_NAV

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: '20px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            background: '#095C46', color: '#fff', fontWeight: 800,
            fontSize: 18, padding: '7px 14px', borderRadius: 10,
            letterSpacing: '-0.3px',
          }}>Unyimi</div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', padding: 4,
            }}
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {user?.role === 'ADMIN' ? 'Admin Portal' : 'Host Portal'}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px 0' }}>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid #E5E7EB', marginTop: 12 }}>
        <div style={{
          background: '#F5F3EE', borderRadius: 10, padding: '10px 12px', marginBottom: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#E8F5F1', color: '#095C46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, marginBottom: 6,
          }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{user?.email}</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3EE' }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-backdrop"
        />
      )}

      {/* Sidebar — desktop: always visible; mobile: slide-in overlay */}
      <aside style={{
        width: 232,
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top navbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
          >
            <Menu size={20} />
          </button>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
