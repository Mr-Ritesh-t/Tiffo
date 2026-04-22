import { createContext, useContext, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import './DashboardLayout.css'

/* ── Sidebar context so child pages can toggle it ── */
const SidebarContext = createContext({ open: false, toggle: () => {}, close: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(v => !v)
  const close  = () => setOpen(false)

  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

/**
 * Owner portal layout — Sidebar + main content area
 * @param {{ children: React.ReactNode, user?: import('../types').User }} props
 */
export default function DashboardLayout({ children }) {
  const { open, close } = useSidebar()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name ?? 'Ritesh Tayade'
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dl-root">

        {/* ── Sidebar ── */}
        <aside className={`dl-sidebar ${open ? 'open' : ''}`}>

          {/* Logo */}
          <div className="dl-logo">
            <span className="dl-logo-emoji">🍱</span>
            <div>
              <div className="dl-logo-title">
                <span className="dl-logo-tiffo">Tiffo</span>
              </div>
              <div className="dl-logo-sub">Mess Management Portal</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="dl-nav">
            <NavLink to={ROUTES.OWNER_DASHBOARD} className="dl-nav-link" end onClick={close}>
              <span className="icon dl-nav-icon">grid_view</span>
              Dashboard
            </NavLink>
            <NavLink to={ROUTES.OWNER_MANAGE_MESS} className="dl-nav-link" onClick={close}>
              <span className="icon dl-nav-icon">storefront</span>
              Edit Mess Info
            </NavLink>
          </nav>

          {/* User card */}
          <div className="dl-user">
            <div className="dl-user-main">
              <div className="dl-user-avatar-wrap">
                <div className="dl-user-avatar">{initials}</div>
                <div className="dl-user-avatar-ring"></div>
              </div>
              <div className="dl-user-info">
                <div className="dl-user-name">{displayName}</div>
                <div className="dl-user-role">
                  Mess Owner
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="dl-logout-btn" aria-label="Logout">
              <span className="icon">logout</span>
            </button>
          </div>
        </aside>

        {/* ── Mobile overlay ── */}
        {open && (
          <div className="dl-overlay visible" onClick={close} />
        )}

        {/* ── Main ── */}
        <main className="dl-main">
          {children}
        </main>
      </div>
  )
}
