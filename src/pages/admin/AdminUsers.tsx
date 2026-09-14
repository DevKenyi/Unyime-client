import { useEffect, useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { AdminUser } from '../../types'

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState('')

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

  const sendInvite = async (e: FormEvent) => {
    e.preventDefault()
    setInviteError('')
    setInviteSent('')
    setInviting(true)
    try {
      await api.post('/api/admin/invite-admin', { email: inviteEmail })
      setInviteSent(inviteEmail)
      setInviteEmail('')
    } catch (err: any) {
      setInviteError(err.response?.data?.error ?? 'Could not send the invite.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Suspend or reactivate guest and host accounts.</p>
        </div>

        <div className="surface-card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Invite a sub-admin</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            They'll be able to approve hosts and view revenue, but nothing else in the admin dashboard.
          </p>
          <form onSubmit={sendInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="email" required placeholder="email@example.com"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="input" style={{ width: '100%', paddingLeft: 38, boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-md" disabled={inviting}>
              {inviting ? 'Sending…' : 'Send invite'}
            </button>
          </form>
          {inviteError && <p style={{ color: '#DC2626', fontSize: 12.5, marginTop: 10 }}>{inviteError}</p>}
          {inviteSent && !inviteError && <p style={{ color: '#095C46', fontSize: 12.5, marginTop: 10 }}>Invite sent to {inviteSent}.</p>}
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
