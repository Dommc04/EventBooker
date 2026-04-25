import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import { Card, Badge, CapacityBar, Button, Spinner, EmptyState } from './ui'

const STATUSES = ['all', 'open', 'full', 'draft', 'cancelled']

export default function Events() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.getEvents(filter === 'all' ? undefined : filter)
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div style={{ padding: '1.5rem', maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>My Events</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => navigate('/events/new')}>+ New event</Button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-secondary)', padding: 4, borderRadius: 'var(--radius)', marginBottom: '1.25rem', width: 'fit-content' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13,
            background: filter === s ? 'var(--surface)' : 'transparent',
            color: filter === s ? 'var(--text)' : 'var(--text-muted)',
            fontWeight: filter === s ? 500 : 400,
            cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : events.length === 0 ? (
        <EmptyState emoji="🗓️" title="No events found" subtitle="Try a different filter or create a new event."
          action={<Button onClick={() => navigate('/events/new')}>+ New event</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {events.map(event => (
            <Card key={event.id} style={{ padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onClick={() => navigate(`/events/${event.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{event.emoji} {event.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{event.host_name}</div>
                </div>
                <Badge status={event.status} />
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span>📅 {formatDate(event.date)} at {event.time}</span>
                <span>📍 {event.venue}</span>
              </div>

              <CapacityBar spotsLeft={event.spots_left} capacity={event.capacity} />
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{event.capacity - event.spots_left}</strong> / {event.capacity} spots filled
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}