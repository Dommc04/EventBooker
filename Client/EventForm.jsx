import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, Input, Textarea, Select, Button, Spinner, useToast } from '../components/ui'

const EMOJIS = ['🎉', '🎂', '🌊', '🌸', '🍸', '🎵', '🏖️', '🍕', '🎈', '🥳', '🌙', '🎊']

const DEFAULTS = { title: '', description: '', host_name: '', date: '', time: '', venue: '', capacity: 20, emoji: '🎉', status: 'open' }

export default function EventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULTS)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const { show, ToastEl } = useToast()

  useEffect(() => {
    if (!isEdit) return
    api.getEvent(id).then(e => {
      setForm({ title: e.title, description: e.description, host_name: e.host_name, date: e.date, time: e.time, venue: e.venue, capacity: e.capacity, emoji: e.emoji, status: e.status })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.host_name.trim()) e.host_name = 'Host name is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.time) e.time = 'Time is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.capacity || form.capacity < 1) e.capacity = 'Capacity must be at least 1'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const data = { ...form, capacity: Number(form.capacity) }
      if (isEdit) {
        await api.updateEvent(id, data)
        show('Event updated!')
        setTimeout(() => navigate(`/events/${id}`), 800)
      } else {
        const event = await api.createEvent(data)
        navigate(`/events/${event.id}`)
      }
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div style={{ padding: '1.5rem', maxWidth: 600 }}>
      {ToastEl}
      <button onClick={() => navigate(isEdit ? `/events/${id}` : '/events')} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13,
        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
      }}>← Back</button>

      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>
        {isEdit ? 'Edit event' : 'Create a new event'}
      </h1>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Emoji picker */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>Event vibe</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => set('emoji', e)} style={{
                  width: 38, height: 38, border: `1.5px solid ${form.emoji === e ? 'var(--purple)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', background: form.emoji === e ? 'var(--purple-light)' : 'transparent',
                  fontSize: 18, cursor: 'pointer', transition: 'all 0.1s',
                }}>{e}</button>
              ))}
            </div>
          </div>

          <Input label="Event title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Mia's Birthday Bash" error={errors.title} />
          <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What's the vibe? Tell your guests what to expect..." />
          <Input label="Host name *" value={form.host_name} onChange={e => set('host_name', e.target.value)} placeholder="Your name or organization" error={errors.host_name} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Date *" type="date" value={form.date} onChange={e => set('date', e.target.value)} error={errors.date} />
            <Input label="Time *" type="time" value={form.time} onChange={e => set('time', e.target.value)} error={errors.time} />
          </div>

          <Input label="Venue *" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="The Rooftop, NYC" error={errors.venue} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Capacity *" type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} error={errors.capacity} />
            <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '0.5px solid var(--border)' }}>
            <Button variant="ghost" onClick={() => navigate(isEdit ? `/events/${id}` : '/events')}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}