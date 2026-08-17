import { useEffect, useState } from 'react'
import { Sparkles, Clock, CheckCircle2, User } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { Cleaner, CleaningTask, CleaningTaskStatus } from '../../types'

const FILTERS: { label: string; value: CleaningTaskStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
]

const STATUS_CFG: Record<CleaningTaskStatus, { label: string; cls: string }> = {
  PENDING:     { label: 'Needs cleaning', cls: 'status-pending' },
  ASSIGNED:    { label: 'Assigned',       cls: 'status-preparing' },
  SCHEDULED:   { label: 'Scheduled',      cls: 'status-ready' },
  IN_PROGRESS: { label: 'In progress',    cls: 'status-preparing' },
  COMPLETED:   { label: 'Completed',      cls: 'status-delivered' },
}

const WINDOWS = ['10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM']

export default function HostCleaning() {
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<CleaningTaskStatus | 'ALL'>('ALL')
  const [busyId, setBusyId] = useState<string | null>(null)

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [selectedCleanerId, setSelectedCleanerId] = useState('')
  const [newCleanerName, setNewCleanerName] = useState('')
  const [newCleanerPhone, setNewCleanerPhone] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleWindow, setScheduleWindow] = useState(WINDOWS[0])
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<CleaningTask[]>('/api/host/cleaning-tasks'),
      api.get<Cleaner[]>('/api/host/cleaners'),
    ])
      .then(([t, c]) => { setTasks(t.data); setCleaners(c.data) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const visibleTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  const openAssign = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
    setActionError('')
    setSelectedCleanerId('')
    setNewCleanerName('')
    setNewCleanerPhone('')
  }

  const handleAssign = async (taskId: string) => {
    setBusyId(taskId)
    setActionError('')
    try {
      let cleanerId = selectedCleanerId
      if (!cleanerId && newCleanerName.trim()) {
        const { data } = await api.post<Cleaner>('/api/host/cleaners', { name: newCleanerName.trim(), phone: newCleanerPhone.trim() || null })
        cleanerId = data.id
        setCleaners(prev => [...prev, data])
      }
      if (!cleanerId) { setActionError('Pick an existing cleaner or add a new one.'); setBusyId(null); return }

      await api.post(`/api/host/cleaning-tasks/${taskId}/assign`, { cleanerId })
      setExpandedTaskId(null)
      load()
    } catch (err: any) {
      setActionError(err.response?.data?.error ?? 'Could not assign a cleaner.')
    } finally {
      setBusyId(null)
    }
  }

  const handleSchedule = async (taskId: string) => {
    if (!scheduleDate) { setActionError('Pick a date.'); return }
    setBusyId(taskId)
    setActionError('')
    try {
      const [startTime, endTime] = scheduleWindow.split(' – ')
      await api.post(`/api/host/cleaning-tasks/${taskId}/schedule`, { scheduledDate: scheduleDate, startTime, endTime })
      setExpandedTaskId(null)
      load()
    } catch (err: any) {
      setActionError(err.response?.data?.error ?? 'Could not schedule this cleaning.')
    } finally {
      setBusyId(null)
    }
  }

  const handleStart = async (taskId: string) => {
    setBusyId(taskId)
    try {
      await api.post(`/api/host/cleaning-tasks/${taskId}/start`)
      load()
    } finally {
      setBusyId(null)
    }
  }

  const handleComplete = async (taskId: string) => {
    setBusyId(taskId)
    try {
      await api.post(`/api/host/cleaning-tasks/${taskId}/complete`)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Cleaning</h1>
          <p className="page-subtitle">Turnover cleaning is created automatically when a guest checks out.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={f.value === filter ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && visibleTasks.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Sparkles size={28} color="#9CA3AF" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No cleaning tasks here.</p>
          </div>
        )}

        {!loading && visibleTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleTasks.map(task => {
              const cfg = STATUS_CFG[task.status]
              const expanded = expandedTaskId === task.id
              return (
                <div key={task.id} className="surface-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{task.propertyTitle}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
                        {task.guestName && <span>Guest: {task.guestName}</span>}
                        {task.checkedOutAt && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={13} /> Checked out {new Date(task.checkedOutAt).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                        {task.cleanerName && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={13} /> {task.cleanerName}
                          </span>
                        )}
                        {task.scheduledDate && (
                          <span>{task.scheduledDate} · {task.startTime}–{task.endTime}</span>
                        )}
                      </div>
                    </div>
                    <span className={`status-pill ${cfg.cls}`}><span className="status-dot" />{cfg.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {task.status === 'PENDING' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => openAssign(task.id)}>Assign cleaner</button>
                    )}
                    {task.status === 'ASSIGNED' && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}>Schedule</button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleStart(task.id)} disabled={busyId === task.id}>
                          {busyId === task.id ? <span className="spinner" /> : 'Start now'}
                        </button>
                      </>
                    )}
                    {task.status === 'SCHEDULED' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStart(task.id)} disabled={busyId === task.id}>
                        {busyId === task.id ? <span className="spinner" /> : 'Mark started'}
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleComplete(task.id)} disabled={busyId === task.id}>
                        {busyId === task.id ? <span className="spinner" /> : <><CheckCircle2 size={14} /> Mark completed</>}
                      </button>
                    )}
                    {task.status === 'COMPLETED' && task.completedAt && (
                      <span style={{ fontSize: 12.5, color: '#6B7280' }}>
                        Completed {new Date(task.completedAt).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} — property is ready.
                      </span>
                    )}
                  </div>

                  {expanded && task.status === 'PENDING' && (
                    <div className="surface-muted" style={{ padding: 14, marginTop: 12 }}>
                      <div className="form-group">
                        <label>Existing cleaner</label>
                        <select className="input" value={selectedCleanerId} onChange={e => setSelectedCleanerId(e.target.value)}>
                          <option value="">— Select —</option>
                          {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 10px' }}>Or add a new cleaner:</p>
                      <div className="form-row-2" style={{ display: 'grid', gap: 12, marginBottom: 4 }}>
                        <input className="input" placeholder="Name" value={newCleanerName} onChange={e => setNewCleanerName(e.target.value)} />
                        <input className="input" placeholder="Phone (optional)" value={newCleanerPhone} onChange={e => setNewCleanerPhone(e.target.value)} />
                      </div>
                      {actionError && <p style={{ color: '#DC2626', fontSize: 13, margin: '8px 0' }}>{actionError}</p>}
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => handleAssign(task.id)} disabled={busyId === task.id}>
                        {busyId === task.id ? <span className="spinner" /> : 'Assign'}
                      </button>
                    </div>
                  )}

                  {expanded && task.status === 'ASSIGNED' && (
                    <div className="surface-muted" style={{ padding: 14, marginTop: 12 }}>
                      <div className="form-row-2" style={{ display: 'grid', gap: 12 }}>
                        <div className="form-group">
                          <label>Date</label>
                          <input type="date" className="input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Window</label>
                          <select className="input" value={scheduleWindow} onChange={e => setScheduleWindow(e.target.value)}>
                            {WINDOWS.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                        </div>
                      </div>
                      {actionError && <p style={{ color: '#DC2626', fontSize: 13, margin: '8px 0' }}>{actionError}</p>}
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }} onClick={() => handleSchedule(task.id)} disabled={busyId === task.id}>
                        {busyId === task.id ? <span className="spinner" /> : 'Confirm schedule'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
