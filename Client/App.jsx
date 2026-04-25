import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './Dashboard'
import Events from './Events'
import EventDetail from './EventDetail'
import EventForm from './EventForm'
import Guests from './Guests'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route path="/guests" element={<Guests />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}