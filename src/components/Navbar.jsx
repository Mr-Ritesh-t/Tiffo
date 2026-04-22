import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import UserMenu from './UserMenu'
import './Navbar.css'

export default function Navbar({ variant = 'default' }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, isOwner } = useAuth()
    const isDashboard = variant === 'dashboard'

    return (
        <nav className={`navbar ${isDashboard ? 'navbar-dashboard' : ''}`}>
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span className="navbar-logo-icon">🍱</span>
                    <span className="navbar-brand-text">Tiffo</span>
                </Link>

                {!isDashboard && (
                    <div className="navbar-links">
                        <Link to="/messes" className={`navbar-link ${location.pathname === '/messes' ? 'active' : ''}`}>Find Mess</Link>
                    </div>
                )}

                <div className="navbar-actions">
                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
