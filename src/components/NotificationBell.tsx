import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import type { Notification } from '../types'

const POLL_INTERVAL_MS = 30000

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const base = user?.role === 'ADMIN' ? '/api/admin' : '/api/host'

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUnreadCount = () => {
      api.get<number>(`${base}/notifications/unread-count`)
        .then(({ data }) => setUnreadCount(data))
        .catch(() => {})
    }
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [base])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get<Notification[]>(`${base}/notifications`)
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, base])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.patch(`${base}/notifications/${n.id}/read`)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch {
        // ignore — read state will re-sync on next open
      }
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch(`${base}/notifications/read-all`)
      setNotifications(prev => prev.map(x => ({ ...x, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore — next poll will re-sync
    }
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280',
          padding: 6, position: 'relative', display: 'flex', alignItems: 'center',
        }}
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#EF4444', color: '#fff',
            borderRadius: '50%', minWidth: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderBottom: '1px solid #F3F4F6',
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#095C46', fontSize: 12, fontWeight: 600 }}
              >
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No notifications yet</div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 14px', border: 'none', borderBottom: '1px solid #F9FAFB',
                  background: n.read ? '#fff' : '#F5F3EE', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {!n.read && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#095C46', marginTop: 5, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{n.title}</p>
                    {n.message && (
                      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{n.message}</p>
                    )}
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
