import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import UserMenu from '../components/UserMenu'
import './MainLayout.css'

function Footer() {
  return (
    <footer className="ml-footer">
      <div className="container ml-footer-inner">
        <div className="ml-footer-brand">
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🍱</span>
          <span className="ml-footer-name">Tiffo</span>
        </div>
        <p className="ml-footer-copy">© 2024 Tiffo. Connecting you with homestyle mess food.</p>
        <div className="ml-footer-links">
          <Link to="/messes">Find Mess</Link>
          <Link to="/login">List Your Mess</Link>
        </div>
      </div>
    </footer>
  )
}

/**
 * Public layout — Navbar + page content + Footer
 * @param {{ children: React.ReactNode }} props
 */
export default function MainLayout({ children }) {
  const location = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="ml-root">
      {/* ── Navbar ── */}
      <nav className="ml-navbar">
        <div className="container ml-navbar-inner">
          <Link to="/" className="ml-brand">
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🍱</span>
            <span className="ml-brand-text">Tiffo</span>
          </Link>

          {/* Desktop links */}
          <div className="ml-nav-links">
            <Link to="/messes"
              className={`ml-nav-link ${location.pathname.startsWith('/mess') ? 'active' : ''}`}>
              Find Mess
            </Link>
          </div>

          {/* Desktop action buttons */}
          <div className="ml-nav-actions">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link to="/login" className="ui-btn ui-btn-ghost ui-btn-sm">Log In</Link>
                <Link to="/owner/dashboard" className="ui-btn ui-btn-primary ui-btn-sm">
                  <span className="icon" style={{ fontSize: '15px' }}>storefront</span>
                  Owner Portal
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="icon" style={{ fontSize: '22px' }}>
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile nav dropdown */}
        <div className={`ml-mobile-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/messes"        className="ml-nav-link" onClick={() => setMenuOpen(false)}>Find Mess</Link>
          <div className="ml-mobile-nav-actions">
            {user ? (
              <div style={{ padding: '0 1rem' }}>
                <UserMenu user={user} />
              </div>
            ) : (
              <>
                <Link to="/login"            className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/owner/dashboard"  className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setMenuOpen(false)}>Owner Portal</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="ml-main">{children}</main>

      <Footer />
    </div>
  )
}
