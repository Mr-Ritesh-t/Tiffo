import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <Link to="/" className="footer-logo" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                        <span>🍱</span> Tiffo
                    </Link>
                    <p>© 2024 Tiffo Technologies. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
