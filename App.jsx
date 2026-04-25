import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './UserContext.jsx'
import SetupName from './SetupName.jsx'
import Layout from './Layout.jsx'
import Dashboard from './Dashboard.jsx'
import Events from './Events.jsx'
import EventDetail from './EventDetail.jsx'
import EventForm from './EventForm.jsx'
import Guests from './Guests.jsx'

function AppContent() {
  const { user, saveUser } = useUser()
  
  if (!user) {
    return <SetupName onSave={saveUser} />
  }
  
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}