import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../constants/routes'
import './UserMenu.css'

export default function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { logout, isOwner } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className={`user-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="user-avatar-premium">
          <div className="user-avatar-inner">{initials}</div>
          <div className="user-avatar-ring"></div>
        </div>
        <span className="icon user-menu-chevron">expand_more</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className="user-dropdown-name">{user.name}</div>
            <div className="user-dropdown-email">{user.email}</div>
            <div className={`user-role-badge ${user.role}`}>{user.role}</div>
          </div>
          
          <div className="user-dropdown-divider"></div>
          
          <div className="user-dropdown-links">
            {isOwner ? (
              <>
                <Link to={ROUTES.OWNER_DASHBOARD} className="user-dropdown-item" onClick={() => setIsOpen(false)}>
                  <span className="icon">grid_view</span>
                  Dashboard
                </Link>
                <Link to={ROUTES.OWNER_MANAGE_MESS} className="user-dropdown-item" onClick={() => setIsOpen(false)}>
                  <span className="icon">storefront</span>
                  Manage Mess
                </Link>
              </>
            ) : (
              <Link to="/messes" className="user-dropdown-item" onClick={() => setIsOpen(false)}>
                <span className="icon">restaurant</span>
                Explore Messes
              </Link>
            )}
          </div>

          <div className="user-dropdown-divider"></div>

          <button className="user-dropdown-item logout-item" onClick={handleLogout}>
            <span className="icon">logout</span>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
