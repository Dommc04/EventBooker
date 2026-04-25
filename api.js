const BASE = 'http://localhost:3001/api'

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Request failed')
    }
    
    return await res.json()
  } catch (error) {
    console.error(`API Error (${path}):`, error)
    throw error
  }
}

export const api = {
  getEvents: (status) => request(`/events${status && status !== 'all' ? `?status=${status}` : ''}`),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: data }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PATCH', body: data }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  getRsvps: (eventId) => request(`/rsvps?eventId=${eventId}`),
  getRecentRsvps: (limit = 10) => request(`/rsvps/recent?limit=${limit}`),
  createRsvp: (data) => request('/rsvps', { method: 'POST', body: data }),
  deleteRsvp: (id) => request(`/rsvps/${id}`, { method: 'DELETE' }),
  getStats: () => request('/stats'),
}