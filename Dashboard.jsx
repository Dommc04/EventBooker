import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { Card, Badge, CapacityBar, Avatar, Spinner, Button } from './ui'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [recentRsvps, setRecentRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.getStats(), api.getEvents(), api.getRecentRsvps(5)])
      .then(([s, e, r]) => { setStats(s); setEvents(e.slice(0, 4)); setRecentRsvps(r) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Here's what's happening with your events.</p>
        </div>
        <Button onClick={() => navigate('/events/new')}>+ New event</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total RSVPs', value: stats?.totalRsvps ?? 0 },
          { label: 'Active events', value: stats?.activeEvents ?? 0 },
          { label: 'Total events hosted', value: stats?.totalEvents ?? 0 },
        ].map(({ label, value }) => (
          <Card key={label} style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 600 }}>{value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <h2 style={{ fontSize: 14, fontWeight: 500 }}>Upcoming events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>See all</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(event => (
              <Card key={event.id} style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
                onClick={() => navigate(`/events/${event.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{event.emoji} {event.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {event.host_name} · {formatDate(event.date)} at {event.time}
                    </div>
                  </div>
                  <Badge status={event.status} />
                </div>
                <CapacityBar spotsLeft={event.spots_left} capacity={event.capacity} />
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text)' }}>{event.capacity - event.spots_left}</strong> / {event.capacity} spots filled
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{event.venue}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent RSVPs */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: '0.875rem' }}>Recent RSVPs</h2>
          <Card>
            {recentRsvps.length === 0 ? (
              <p style={{ padding: '1rem', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No RSVPs yet.</p>
            ) : (
              recentRsvps.map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  padding: '10px 1.25rem',
                  borderBottom: i < recentRsvps.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <Avatar name={r.guest_name} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.guest_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.event_emoji} {r.event_title} · {r.guest_count} {r.guest_count === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(r.created_at)}</div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}