const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Events
  getEvents: (status) => request(`/events${status ? `?status=${status}` : ''}`),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: data }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PATCH', body: data }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // RSVPs
  getRsvps: (eventId) => request(`/rsvps?eventId=${eventId}`),
  getRecentRsvps: (limit = 10) => request(`/rsvps/recent?limit=${limit}`),
  createRsvp: (data) => request('/rsvps', { method: 'POST', body: data }),
  deleteRsvp: (id) => request(`/rsvps/${id}`, { method: 'DELETE' }),

  // Stats
  getStats: () => request('/stats'),
}