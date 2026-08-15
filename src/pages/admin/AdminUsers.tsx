import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { AdminUser } from '../../types'

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<AdminUser[]>('/api/admin/users')
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggle = async (user: AdminUser) => {
    setBusyId(user.id)
    try {
      const endpoint = user.enabled ? 'suspend' : 'activate'
      const { data } = await api.patch<AdminUser>(`/api/admin/users/${user.id}/${endpoint}`)
      setUsers(prev => prev.map(u => u.id === user.id ? data : u))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Suspend or reactivate guest and host accounts.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && (
          <div className="surface-card" style={{ padding: 0 }}>
            {users.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: i < users.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{u.email}</p>
                  <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>{u.role} · joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`status-pill ${u.enabled ? 'status-delivered' : 'status-cancelled'}`}>
                    <span className="status-dot" />{u.enabled ? 'Active' : 'Suspended'}
                  </span>
                  <button
                    className={u.enabled ? 'btn btn-danger btn-sm' : 'btn btn-success btn-sm'}
                    disabled={busyId === u.id}
                    onClick={() => toggle(u)}
                  >
                    {u.enabled ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
