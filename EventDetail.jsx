import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from './api'
import { Card, Badge, CapacityBar, Avatar, Button, Input, Textarea, Modal, Spinner, EmptyState, useToast } from './ui'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [rsvpModal, setRsvpModal] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const { show, ToastEl } = useToast()

  const load = () => Promise.all([api.getEvent(id), api.getRsvps(id)])
    .then(([e, r]) => { setEvent(e); setRsvps(r) })
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleDeleteRsvp = async (rsvpId) => {
    if (!confirm('Remove this RSVP?')) return
    setDeleting(rsvpId)
    try {
      await api.deleteRsvp(rsvpId)
      await load()
      show('RSVP removed')
    } catch (e) {
      show(e.message, 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    try {
      await api.deleteEvent(id)
      navigate('/events')
    } catch (e) {
      show(e.message, 'error')
    }
  }

  if (loading) return <Spinner />
  if (!event) return <EmptyState emoji="❓" title="Event not found" action={<Button onClick={() => navigate('/events')}>Back to events</Button>} />

  const filled = event.capacity - event.spots_left

  return (
    <div style={{ padding: '1.5rem', maxWidth: 780 }}>
      {ToastEl}

      {/* Back */}
      <button onClick={() => navigate('/events')} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13,
        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 4,
      }}>← Back to events</button>

      {/* Event header */}
      <Card style={{ padding: '1.5rem', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>{event.emoji} {event.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Hosted by {event.host_name}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge status={event.status} />
            <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${id}/edit`)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteEvent}>Delete</Button>
          </div>
        </div>

        {event.description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>{event.description}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Date & time', value: `${formatDate(event.date)} at ${event.time}` },
            { label: 'Venue', value: event.venue },
            { label: 'Spots', value: `${filled} / ${event.capacity} filled` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface-secondary)', borderRadius: 'var(--radius)', padding: '0.875rem' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        <CapacityBar spotsLeft={event.spots_left} capacity={event.capacity} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{filled} attending</span>
          <span>{event.spots_left} spots left</span>
        </div>
      </Card>

      {/* Guest list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 500 }}>Guest list <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({rsvps.length})</span></h2>
        {event.status !== 'full' && event.status !== 'cancelled' && (
          <Button size="sm" onClick={() => setRsvpModal(true)}>+ Add RSVP</Button>
        )}
      </div>

      <Card>
        {rsvps.length === 0 ? (
          <EmptyState emoji="👋" title="No RSVPs yet" subtitle="Share the event link so guests can RSVP." />
        ) : (
          rsvps.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 1.25rem',
              borderBottom: i < rsvps.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <Avatar name={r.guest_name} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{r.guest_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.guest_email} · {r.guest_count} {r.guest_count === 1 ? 'guest' : 'guests'}</div>
                {r.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>"{r.note}"</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</div>
              <button
                onClick={() => handleDeleteRsvp(r.id)}
                disabled={deleting === r.id}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, padding: '0 4px', opacity: deleting === r.id ? 0.4 : 1 }}
              >×</button>
            </div>
          ))
        )}
      </Card>

      <RsvpModal open={rsvpModal} onClose={() => setRsvpModal(false)} eventId={id} onSuccess={async () => { setRsvpModal(false); await load(); show('RSVP added!') }} onError={(msg) => show(msg, 'error')} />
    </div>
  )
}

function RsvpModal({ open, onClose, eventId, onSuccess, onError }) {
  const [form, setForm] = useState({ guest_name: '', guest_email: '', guest_count: 1, note: '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.guest_name.trim()) e.guest_name = 'Name is required'
    if (!form.guest_email.trim()) e.guest_email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.guest_email)) e.guest_email = 'Invalid email'
    if (form.guest_count < 1) e.guest_count = 'Must be at least 1'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await api.createRsvp({ ...form, event_id: eventId, guest_count: Number(form.guest_count) })
      setForm({ guest_name: '', guest_email: '', guest_count: 1, note: '' })
      onSuccess()
    } catch (err) {
      onError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add RSVP">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Guest name" value={form.guest_name} onChange={e => set('guest_name', e.target.value)} placeholder="Jane Smith" error={errors.guest_name} />
        <Input label="Email" type="email" value={form.guest_email} onChange={e => set('guest_email', e.target.value)} placeholder="jane@email.com" error={errors.guest_email} />
        <Input label="Number of guests" type="number" min={1} max={20} value={form.guest_count} onChange={e => set('guest_count', e.target.value)} error={errors.guest_count} />
        <Textarea label="Note (optional)" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any special notes..." />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Adding...' : 'Add RSVP'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}