import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Avatar, Card, Spinner, EmptyState } from '../components/ui'

export default function Guests() {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getRecentRsvps(100).then(setRsvps).finally(() => setLoading(false))
  }, [])

  const filtered = rsvps.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    r.guest_email.toLowerCase().includes(search.toLowerCase()) ||
    r.event_title.toLowerCase().includes(search.toLowerCase())
  )

  const totalGuests = filtered.reduce((sum, r) => sum + r.guest_count, 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 780 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>Guests</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {filtered.length} RSVPs · {totalGuests} total guests
        </p>
      </div>

      <input
        placeholder="Search by name, email or event..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '1.25rem',
          border: '0.5px solid var(--border-strong)', borderRadius: 'var(--radius)',
          fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none',
        }}
      />

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="No guests found" subtitle={search ? 'Try a different search.' : 'No RSVPs yet across any events.'} />
      ) : (
        <Card>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
            padding: '8px 1.25rem',
            borderBottom: '0.5px solid var(--border)',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Guest</span><span>Event</span><span>Guests</span><span>RSVPed</span>
          </div>
          {filtered.map((r, i) => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
              padding: '11px 1.25rem', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={r.guest_name} size={30} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{r.guest_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.guest_email}</div>
                </div>
              </div>
              <button onClick={() => navigate(`/events/${r.event_id}`)} style={{
                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                fontSize: 13, color: 'var(--purple)', fontFamily: 'inherit',
              }}>
                {r.event_emoji} {r.event_title}
              </button>
              <span style={{ fontSize: 13 }}>{r.guest_count}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}