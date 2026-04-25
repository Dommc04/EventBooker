import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',        label: 'Dashboard', icon: IconGrid },
  { to: '/events',  label: 'My Events', icon: IconCalendar },
  { to: '/guests',  label: 'Guests',    icon: IconUser },
]

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 210, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px' }}>
            Mixer<span style={{ color: 'var(--purple)' }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Event Booking</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.75rem 0', flex: 1 }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 1.25rem',
                fontSize: 13,
                color: isActive ? 'var(--purple)' : 'var(--text-muted)',
                borderLeft: `2px solid ${isActive ? 'var(--purple)' : 'transparent'}`,
                background: isActive ? 'var(--purple-light)' : 'transparent',
                transition: 'all 0.15s',
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--purple-light)', color: 'var(--purple-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500,
            }}>AM</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Alex Morgan</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Host</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}

function IconGrid({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1"/>
      <rect x="9.5" y="1" width="5.5" height="5.5" rx="1"/>
      <rect x="1" y="9.5" width="5.5" height="5.5" rx="1"/>
      <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1"/>
    </svg>
  )
}

function IconCalendar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="11" rx="1.5"/>
      <path d="M5 3V1.5M11 3V1.5M1 7h14"/>
    </svg>
  )
}

function IconUser({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3"/>
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
    </svg>
  )
}