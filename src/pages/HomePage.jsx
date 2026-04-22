import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './HomePage.css'

const HOW_IT_WORKS_STEPS = [
    { icon: 'location_on', step: '01', title: 'Find Nearby', desc: 'Browse messes and home chefs in your neighborhood with live location data.' },
    { icon: 'restaurant_menu', step: '02', title: 'Check Menus', desc: 'View current daily menus, timings, and authentic reviews from other foodies.' },
    { icon: 'call', step: '03', title: 'Contact & Eat', desc: 'Get directions, call the owner, and visit directly for a healthy meal.' }
]

export default function HomePage() {
    return (
        <div className="home-page">
            <Navbar />
            
            <section className="hero">
                {/* ── Background Mesh & Gradients ── */}
                <div className="elite-mesh-bg">
                    <div className="mesh-gradient"></div>
                    <div className="grain-overlay"></div>
                </div>

                <div className="container hero-content">
                    <div className="hero-badge reveal-1">
                        <span className="badge-elite">
                          <span className="dot"></span>
                          NOW LIVE IN PUNE
                        </span>
                    </div>
                    
                    <h1 className="hero-title reveal-2">
                        Your Trusted <span className="gradient-highlight">Mess Partner</span><br />
                        At Every Corner.
                    </h1>
                    
                    <p className="hero-subtitle reveal-3">
                        Find the perfect home-style meal nearby. Explore daily menus, timings, and locations at a glance.
                    </p>
                    <div className="hero-actions reveal-4">
                        <Link to="/messes" className="btn-elite-primary full-width">
                            Search Nearby Messes
                            <span className="icon" style={{ marginLeft: '12px', fontSize: '20px' }}>arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section how-it-works" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="section-header center" style={{margin:'10px 10px 10px 40px'}}>
                        <h2 className="section-title">How it Works</h2>
                        <p className="section-subtitle">Get started with TiffO in 3 simple steps</p>
                    </div>
                    <div className="steps-grid">
                        {HOW_IT_WORKS_STEPS.map((step, idx) => (
                            <div className={`step-card-elite reveal-${idx + 1}`} key={step.step}>
                                <div className="step-glow"></div>
                                <div className="step-icon-elite">
                                    <span className="icon">{step.icon}</span>
                                </div>
                                <div className="step-number-elite">{step.step}</div>
                                <h3 className="step-title-elite">{step.title}</h3>
                                <p className="step-desc-elite">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    )
}
