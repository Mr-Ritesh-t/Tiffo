import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import './OwnerRegisterMessPage.css'

/* ── Step definitions ── */
const STEPS = [
  { id: 1, label: 'Your Details',   icon: 'person'          },
  { id: 2, label: 'Mess Info',      icon: 'storefront'      },
  { id: 3, label: 'Service Setup',  icon: 'build_circle'    },
]

const MESS_TYPES    = ['Full Meal', 'Tiffin Service', 'Chapati Only', 'Bhaji Only', 'Multi-Option']
const CUISINE_TYPES = ['North Indian', 'South Indian', 'Gujarati', 'Rajasthani', 'Bengali', 'Mixed']
const SERVICE_OPTS  = ['Delivery', 'Dine-In', 'Takeaway']

export default function OwnerRegisterMessPage() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [done, setDone]     = useState(false)
  const [errors, setErrors] = useState({})

  /* ── Form state ── */
  const [owner, setOwner] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
  })
  const [mess, setMess] = useState({
    messName: '', messType: 'Full Meal', cuisineType: 'North Indian',
    address: '', city: '', area: '', pincode: '',
  })
  const [service, setService] = useState({
    services: ['Delivery', 'Dine-In'],
    pricePerMeal: '',
    vegOnly: false,
  })

  const setO = (k, v) => setOwner(p => ({ ...p, [k]: v }))
  const setM = (k, v) => setMess(p => ({ ...p, [k]: v }))
  const setS = (k, v) => setService(p => ({ ...p, [k]: v }))

  const toggleSvc = t =>
    setService(p => ({
      ...p,
      services: p.services.includes(t) ? p.services.filter(x => x !== t) : [...p.services, t],
    }))

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    if (step === 1) {
      if (!owner.name.trim())        e.name = 'Full name is required'
      if (!/^\d{10}$/.test(owner.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit phone'
      if (!/\S+@\S+\.\S+/.test(owner.email)) e.email = 'Enter a valid email'
      if (owner.password.length < 6) e.password = 'Password must be at least 6 characters'
      if (owner.password !== owner.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (step === 2) {
      if (!mess.messName.trim()) e.messName = 'Mess name is required'
      if (!mess.address.trim())  e.address  = 'Address is required'
      if (!mess.city.trim())     e.city     = 'City is required'
    }
    if (step === 3) {
      if (service.services.length === 0) e.services = 'Select at least one service type'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => { setErrors({}); setStep(s => s - 1) }
  const submit = () => { if (validate()) setDone(true) }

  /* ── Success screen ── */
  if (done) {
    return (
      <MainLayout>
        <div className="rmr-success-screen">
          <div className="rmr-success-card">
            <div className="rmr-success-icon">🎉</div>
            <h1 className="rmr-success-title">You're all set!</h1>
            <p className="rmr-success-sub">
              <strong>{mess.messName}</strong> has been registered successfully.<br />
              Your owner portal is ready.
            </p>
            <div className="rmr-success-actions">
              <Link to="/owner/dashboard" className="ui-btn ui-btn-primary ui-btn-lg">
                <span className="icon" style={{ fontSize: '18px' }}>grid_view</span>
                Go to Dashboard
              </Link>
              <Link to="/owner/manage-mess" className="ui-btn ui-btn-secondary ui-btn-md">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="rmr-page">

        {/* ── Left panel ── */}
        <aside className="rmr-left">
          <div className="rmr-left-brand">
            <span className="rmr-brand-emoji">🍱</span>
            <span className="rmr-brand-name">Tiffo</span>
          </div>
          <h2 className="rmr-left-heading">List your mess.<br />Grow your business.</h2>
          <p className="rmr-left-sub">
            Join 500+ mess owners already using Tiffo to grow their business every month.
          </p>

          <ul className="rmr-perks">
            {[
              { icon: 'trending_up', text: 'Get discovered by 10,000+ students & working professionals' },
              { icon: 'notifications_active', text: 'Daily menu broadcast to subscribers instantly' },
              { icon: 'payments', text: 'Secure digital payment collection' },
              { icon: 'star', text: 'Build ratings and reviews automatically' },
            ].map(p => (
              <li key={p.text} className="rmr-perk">
                <span className="rmr-perk-icon"><span className="icon">{p.icon}</span></span>
                <span className="rmr-perk-text">{p.text}</span>
              </li>
            ))}
          </ul>

          <div className="rmr-testimonial">
            <p className="rmr-testimonial-text">
              "After listing on Tiffo, I went from 20 to 80 daily orders in just 3 months!"
            </p>
            <div className="rmr-testimonial-author">
              <div className="rmr-t-avatar" style={{ background: '#5d4037' }}>RT</div>
              <div>
                <div className="rmr-t-name">Ritesh Tayade</div>
                <div className="rmr-t-mess">Annapurna Mess, Pune</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="rmr-right">

          {/* Stepper */}
          <div className="rmr-stepper">
            {STEPS.map((s, i) => (
              <div key={s.id} className="rmr-step-item">
                <div className={`rmr-step-circle ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
                  {step > s.id
                    ? <span className="icon" style={{ fontSize: '16px' }}>check</span>
                    : <span className="icon" style={{ fontSize: '16px' }}>{s.icon}</span>
                  }
                </div>
                <span className={`rmr-step-label ${step === s.id ? 'active' : ''}`}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`rmr-step-bar ${step > s.id ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Personal Details ── */}
          {step === 1 && (
            <div className="rmr-form-block">
              <div className="rmr-form-header">
                <h2 className="rmr-form-title">Your Details</h2>
                <p className="rmr-form-sub">Create your owner account</p>
              </div>

              <div className="rmr-field">
                <label className="rmr-label">Full Name *</label>
                <input className={`rmr-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Ritesh Tayade" value={owner.name}
                  onChange={e => setO('name', e.target.value)} />
                {errors.name && <span className="rmr-err">{errors.name}</span>}
              </div>

              <div className="rmr-grid-2">
                <div className="rmr-field">
                  <label className="rmr-label">Phone Number *</label>
                  <div className="rmr-input-prefix-wrap">
                    <span className="rmr-prefix">+91</span>
                    <input className={`rmr-input rmr-input-prefixed ${errors.phone ? 'error' : ''}`}
                      placeholder="98765 43210" value={owner.phone} type="tel"
                      onChange={e => setO('phone', e.target.value)} />
                  </div>
                  {errors.phone && <span className="rmr-err">{errors.phone}</span>}
                </div>
                <div className="rmr-field">
                  <label className="rmr-label">Email Address *</label>
                  <input className={`rmr-input ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com" value={owner.email} type="email"
                    onChange={e => setO('email', e.target.value)} />
                  {errors.email && <span className="rmr-err">{errors.email}</span>}
                </div>
              </div>

              <div className="rmr-grid-2">
                <div className="rmr-field">
                  <label className="rmr-label">Password *</label>
                  <input className={`rmr-input ${errors.password ? 'error' : ''}`}
                    placeholder="Min. 6 characters" type="password" value={owner.password}
                    onChange={e => setO('password', e.target.value)} />
                  {errors.password && <span className="rmr-err">{errors.password}</span>}
                </div>
                <div className="rmr-field">
                  <label className="rmr-label">Confirm Password *</label>
                  <input className={`rmr-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Repeat password" type="password" value={owner.confirmPassword}
                    onChange={e => setO('confirmPassword', e.target.value)} />
                  {errors.confirmPassword && <span className="rmr-err">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Mess Info ── */}
          {step === 2 && (
            <div className="rmr-form-block">
              <div className="rmr-form-header">
                <h2 className="rmr-form-title">Mess Information</h2>
                <p className="rmr-form-sub">Tell us about your mess</p>
              </div>

              <div className="rmr-field">
                <label className="rmr-label">Mess Name *</label>
                <input className={`rmr-input ${errors.messName ? 'error' : ''}`}
                  placeholder="e.g. Annapurna Mess" value={mess.messName}
                  onChange={e => setM('messName', e.target.value)} />
                {errors.messName && <span className="rmr-err">{errors.messName}</span>}
              </div>

              <div className="rmr-grid-2">
                <div className="rmr-field">
                  <label className="rmr-label">Mess Type</label>
                  <div className="rmr-select-wrap">
                    <select className="rmr-input rmr-select" value={mess.messType}
                      onChange={e => setM('messType', e.target.value)}>
                      {MESS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className="icon rmr-select-arrow">expand_more</span>
                  </div>
                </div>
                <div className="rmr-field">
                  <label className="rmr-label">Cuisine Type</label>
                  <div className="rmr-select-wrap">
                    <select className="rmr-input rmr-select" value={mess.cuisineType}
                      onChange={e => setM('cuisineType', e.target.value)}>
                      {CUISINE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className="icon rmr-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="rmr-field">
                <label className="rmr-label">Full Address *</label>
                <textarea className={`rmr-input rmr-textarea ${errors.address ? 'error' : ''}`}
                  rows={2} placeholder="Plot no., Street, Locality"
                  value={mess.address} onChange={e => setM('address', e.target.value)} />
                {errors.address && <span className="rmr-err">{errors.address}</span>}
              </div>

              <div className="rmr-grid-3">
                <div className="rmr-field">
                  <label className="rmr-label">City *</label>
                  <input className={`rmr-input ${errors.city ? 'error' : ''}`}
                    placeholder="e.g. Pune" value={mess.city}
                    onChange={e => setM('city', e.target.value)} />
                  {errors.city && <span className="rmr-err">{errors.city}</span>}
                </div>
                <div className="rmr-field">
                  <label className="rmr-label">Area / Landmark</label>
                  <input className="rmr-input" placeholder="e.g. Koregaon Park"
                    value={mess.area} onChange={e => setM('area', e.target.value)} />
                </div>
                <div className="rmr-field">
                  <label className="rmr-label">PIN Code</label>
                  <input className="rmr-input" placeholder="411001" type="text" maxLength={6}
                    value={mess.pincode} onChange={e => setM('pincode', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Service Setup ── */}
          {step === 3 && (
            <div className="rmr-form-block">
              <div className="rmr-form-header">
                <h2 className="rmr-form-title">Service Setup</h2>
                <p className="rmr-form-sub">How do you serve your customers?</p>
              </div>

              <div className="rmr-field">
                <label className="rmr-label">Service Types *</label>
                <div className="rmr-chip-row">
                  {SERVICE_OPTS.map(t => (
                    <button key={t} type="button"
                      className={`rmr-chip ${service.services.includes(t) ? 'active' : ''}`}
                      onClick={() => toggleSvc(t)}>
                      {service.services.includes(t) && <span className="icon" style={{ fontSize: '14px' }}>check</span>}
                      {t}
                    </button>
                  ))}
                </div>
                {errors.services && <span className="rmr-err">{errors.services}</span>}
              </div>

              <div className="rmr-grid-2">
                <div className="rmr-field">
                  <label className="rmr-label">Price per Meal (₹)</label>
                  <div className="rmr-input-prefix-wrap">
                    <span className="rmr-prefix">₹</span>
                    <input className="rmr-input rmr-input-prefixed" type="number" min={30}
                      placeholder="e.g. 120" value={service.pricePerMeal}
                      onChange={e => setS('pricePerMeal', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rmr-grid-2">
                <div className="rmr-field">
                  <label className="rmr-label">Food Type</label>
                  <div className="rmr-chip-row">
                    <button type="button"
                      className={`rmr-chip ${!service.vegOnly ? 'active' : ''}`}
                      onClick={() => setS('vegOnly', false)}>
                      🌿 Veg + Non-Veg
                    </button>
                    <button type="button"
                      className={`rmr-chip rmr-chip-veg ${service.vegOnly ? 'active' : ''}`}
                      onClick={() => setS('vegOnly', true)}>
                      🥦 Veg Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Nav buttons ── */}
          <div className="rmr-nav-row">
            {step > 1
              ? <button className="ui-btn ui-btn-ghost ui-btn-md" onClick={back}>
                  <span className="icon" style={{ fontSize: '16px' }}>arrow_back</span> Back
                </button>
              : <Link to="/login" className="ui-btn ui-btn-ghost ui-btn-md">
                  Already have an account?
                </Link>
            }
            {step < 3
              ? <button className="rmr-next-btn" onClick={next}>
                  Continue <span className="icon" style={{ fontSize: '16px' }}>arrow_forward</span>
                </button>
              : <button className="rmr-next-btn" onClick={submit}>
                  <span className="icon" style={{ fontSize: '16px' }}>check_circle</span> Register Mess
                </button>
            }
          </div>

          <p className="rmr-terms">
            By registering you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </main>
      </div>
    </MainLayout>
  )
}
