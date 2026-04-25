import { useState } from 'react'

// ── Badge ──────────────────────────────────────────────
const badgeStyles = {
  open:      { background: 'var(--green-light)',  color: 'var(--green-dark)' },
  full:      { background: 'var(--red-light)',    color: 'var(--red-dark)' },
  draft:     { background: 'var(--gray-light)',   color: 'var(--gray-mid)' },
  cancelled: { background: 'var(--red-light)',    color: 'var(--red-dark)' },
  upcoming:  { background: 'var(--purple-light)', color: 'var(--purple-dark)' },
}

export function Badge({ status }) {
  const style = badgeStyles[status] || badgeStyles.upcoming
  return (
    <span style={{
      ...style,
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 500,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

// ── Button ─────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', style: s, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', borderRadius: 'var(--radius)', fontWeight: 500,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 10px' : '8px 16px',
    transition: 'all 0.15s',
  }
  const variants = {
    primary: { background: 'var(--purple)', color: '#fff' },
    ghost:   { background: 'transparent', color: 'var(--text)', border: '0.5px solid var(--border-strong)' },
    danger:  { background: 'var(--red-light)', color: 'var(--red-dark)' },
  }
  return <button style={{ ...base, ...variants[variant], ...s }} {...props}>{children}</button>
}

// ── Input ──────────────────────────────────────────────
export function Input({ label, error, style: s, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</label>}
      <input
        style={{
          padding: '9px 12px',
          border: `0.5px solid ${error ? 'var(--red)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 13,
          background: 'var(--surface)',
          color: 'var(--text)',
          outline: 'none',
          width: '100%',
          ...s,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Textarea ───────────────────────────────────────────
export function Textarea({ label, error, style: s, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <textarea
        rows={3}
        style={{
          padding: '9px 12px',
          border: `0.5px solid ${error ? 'var(--red)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 13,
          background: 'var(--surface)',
          color: 'var(--text)',
          outline: 'none',
          resize: 'vertical',
          width: '100%',
          ...s,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Select ─────────────────────────────────────────────
export function Select({ label, children, style: s, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <select
        style={{
          padding: '9px 12px',
          border: '0.5px solid var(--border-strong)',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          background: 'var(--surface)',
          color: 'var(--text)',
          outline: 'none',
          width: '100%',
          ...s,
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────
export function Card({ children, style: s, ...props }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      ...s,
    }} {...props}>
      {children}
    </div>
  )
}

// ── Capacity Bar ───────────────────────────────────────
export function CapacityBar({ spotsLeft, capacity }) {
  const filled = capacity - spotsLeft
  const pct = capacity > 0 ? Math.round((filled / capacity) * 100) : 0
  const color = pct === 100 ? 'var(--red)' : pct > 80 ? 'var(--amber-dark)' : 'var(--purple)'
  return (
    <div style={{ height: 4, background: 'var(--surface-secondary)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────
const avatarColors = [
  { bg: 'var(--purple-light)', color: 'var(--purple-dark)' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#E6F1FB', color: '#185FA5' },
]

export function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const idx = name.charCodeAt(0) % avatarColors.length
  const { bg, color } = avatarColors[idx]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────
export function EmptyState({ emoji = '📭', title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, marginBottom: 16 }}>{subtitle}</p>}
      {action}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--border)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: 28, height: 28, border: '2.5px solid var(--border)',
        borderTopColor: 'var(--purple)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  const ToastEl = toast ? (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      background: toast.type === 'error' ? 'var(--red-dark)' : '#1a1a1a',
      color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius)',
      fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.2s ease',
    }}>
      {toast.message}
      <style>{`@keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  ) : null
  return { show, ToastEl }
}