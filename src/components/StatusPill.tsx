import type { BookingStatus } from '../types'

const CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', cls: 'status-pending'   },
  CONFIRMED:       { label: 'Confirmed',       cls: 'status-paid'      },
  CHECKED_IN:      { label: 'Checked In',      cls: 'status-preparing' },
  COMPLETED:       { label: 'Completed',       cls: 'status-delivered' },
  CANCELLED:       { label: 'Cancelled',       cls: 'status-cancelled' },
  FAILED:          { label: 'Failed',          cls: 'status-failed'    },
  EXPIRED:         { label: 'Expired',         cls: 'status-cancelled' },
}

export default function StatusPill({ status }: { status: BookingStatus | string }) {
  const cfg = CONFIG[status] ?? { label: status, cls: '' }
  return (
    <span className={`status-pill ${cfg.cls}`}>
      <span className="status-dot" />
      {cfg.label}
    </span>
  )
}
