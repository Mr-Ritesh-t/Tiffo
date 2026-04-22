import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout, { useSidebar } from '../layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import LocationPicker from '../components/LocationPicker'
import { getMessById, updateMess } from '../services/messService'
import * as storageService from '../services/storageService'
import './OwnerMessManagementPage.css'

const TABS = [
  { id: 'info',    icon: 'info',            label: 'General Info'    },
  { id: 'menu',    icon: 'restaurant_menu', label: 'Menu & Gallery'  },
  { id: 'hours',   icon: 'schedule',        label: 'Business Hours'  },
  { id: 'contact', icon: 'settings',        label: 'Contact Settings'},
]

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const SERVICE_OPTIONS = ['Delivery','Dine-In','Takeaway']

const defaultHours = Object.fromEntries(
  DAYS.map(d => [d, { open: d !== 'Sunday', from: '11:00', to: '22:00' }])
)

/* ── Service Icons Map ── */
const SERVICE_INFO = [
  { id: 'Delivery',  icon: 'moped',         desc: 'Doorstep delivery for customers' },
  { id: 'Dine-In',   icon: 'restaurant',    desc: 'Seating area at your establishment' },
  { id: 'Takeaway',  icon: 'shopping_bag',  desc: 'Self-pickup service for orders' },
]

export default function OwnerMessManagementPage() {
  const { toggle } = useSidebar()
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('info')
  const [messName, setMessName] = useState('')
  const [messType, setMessType] = useState('Full Meal')
  const [cuisineType, setCuisineType] = useState('North Indian')
  const [description, setDescription] = useState('')
  const [pricePerMeal, setPricePerMeal] = useState(100)
  const [services, setServices] = useState([])
  const [hours, setHours] = useState(defaultHours)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 })
  const [gallery, setGallery] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)

  // 🔄 Fetch Live Data on Load
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      try {
        const data = await getMessById(user.id)
        if (data) {
          setMessName(data.name || '')
          setMessType(data.type || 'Full Meal')
          setCuisineType(data.cuisine || 'North Indian')
          setDescription(data.description || '')
          setPricePerMeal(data.pricePerMeal || 100)
          setServices(data.services || [])
          setHours(data.businessHours || defaultHours)
          setAddress(data.location || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setMapLink(data.mapLink || '')
          setGallery(data.gallery || [])
          setImageUrl(data.imageUrl || '')
          if (data.lat && data.lng) {
            setCoords({ lat: data.lat, lng: data.lng })
          }
        }
      } catch (err) {
        console.error("Failed to load mess data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const toggleService = t =>
    setServices(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const updateHour = (day, field, val) =>
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }))

  const copyMondayToAll = () => {
    const mondayData = { ...hours['Monday'] }
    const newHours = {}
    DAYS.forEach(day => { newHours[day] = { ...mondayData } })
    setHours(newHours)
  }

  const handleSave = async () => {
    if (!user?.id) return
    try {
      const updateData = {
        name: messName,
        type: messType,
        cuisine: cuisineType,
        description,
        pricePerMeal,
        services,
        businessHours: hours,
        location: address,
        phone,
        email,
        mapLink,
        gallery,
        imageUrl,
        lat: coords.lat,
        lng: coords.lng,
        updatedAt: new Date().toISOString()
      }
      
      await updateMess(user.id, updateData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert("Failed to save changes. Please check your connection.")
    }
  }

  // 📸 Photo Management
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await storageService.uploadFile(file)
      const newGallery = [...gallery, url]
      setGallery(newGallery)
      
      // If first photo, make it featured
      if (!imageUrl) {
        setImageUrl(url)
      }
      
      // Auto-save to persistence
      await updateMess(user.id, { gallery: newGallery, imageUrl: imageUrl || url })
    } catch (err) {
      alert(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSetFeatured = async (url) => {
    setImageUrl(url)
    await updateMess(user.id, { imageUrl: url })
  }

  const handleRemovePhoto = async (urlToRemove) => {
    if (!window.confirm("Delete this photo?")) return
    
    try {
      await storageService.deleteFile(urlToRemove)
      const newGallery = gallery.filter(url => url !== urlToRemove)
      setGallery(newGallery)
      
      let nextImageUrl = imageUrl
      if (urlToRemove === imageUrl) {
        nextImageUrl = newGallery.length > 0 ? newGallery[0] : ''
        setImageUrl(nextImageUrl)
      }
      
      await updateMess(user.id, { gallery: newGallery, imageUrl: nextImageUrl })
    } catch (err) {
      alert("Failed to delete photo")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <DashboardLayout>
      {/* ── Top Bar (Sticky) ── */}
      <div className="dl-topbar-sticky">
        <div className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-hamburger" onClick={toggle} aria-label="Open sidebar">
              <span className="icon">menu</span>
            </button>
            <div className="dl-topbar-title-group">
              <h1 className="dl-topbar-title">Manage Mess</h1>
              <p className="dl-topbar-sub">Business Profile & Rules</p>
            </div>
          </div>
          
          <div className="dl-topbar-right">
            {saved && (
              <div className="mm-saved-pill">
                <span className="icon" style={{ fontSize: '14px' }}>check_circle</span>
                <span className="btn-text">Saved</span>
              </div>
            )}
            
            <div className="hide-mobile" style={{ display: 'flex', gap: '0.65rem' }}>
               <button className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-responsive" onClick={() => window.history.back()}>
                 <span className="icon" style={{ fontSize: '18px' }}>close</span>
                 <span className="btn-text">Cancel</span>
               </button>
               <button className="mm-save-btn ui-btn-responsive" onClick={handleSave}>
                 <span className="icon" style={{ fontSize: '18px' }}>save</span>
                 <span className="btn-text">Save Changes</span>
               </button>
            </div>

            <Link to="/owner/notifications" className="dl-icon-btn" aria-label="Notifications">
              <span className="icon">notifications</span>
              <span className="dl-notif-dot" />
            </Link>

            <button onClick={handleLogout} className="dl-icon-btn mm-logout-top-btn" aria-label="Logout">
              <span className="icon">logout</span>
            </button>
          </div>
        </div>

        {/* ── Tabs Container ── */}
        <div className="mm-tabs-container">
          <div className="mm-tabs-bar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`mm-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="icon mm-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mm-body">
        {loading ? (
          <div className="mm-loading-state">
            <span className="icon spinning">sync</span>
            <p>Loading your profile...</p>
          </div>
        ) : (
          <div className="mm-layout">
          {/* ── Form Column ── */}
          <div className="mm-form-col">

            {/* GENERAL INFO */}
            {activeTab === 'info' && (
              <>
                <div className="mm-card">
                  <h3 className="mm-card-title">
                    <span className="icon mm-card-icon">edit_note</span>
                    Basic Information
                  </h3>
                  <div className="mm-form-grid-2">
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="mess-name">Mess Name</label>
                      <input id="mess-name" className="mm-input" type="text" value={messName} onChange={e => setMessName(e.target.value)} />
                    </div>
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="mess-type">Mess Type</label>
                      <div className="mm-select-wrap">
                        <select id="mess-type" className="mm-input mm-select" value={messType} onChange={e => setMessType(e.target.value)}>
                          <option>Full Meal</option><option>Tiffin Service</option><option>Chapati Only</option><option>Bhaji Only</option>
                        </select>
                        <span className="icon mm-select-arrow">expand_more</span>
                      </div>
                    </div>
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="cuisine-type">Cuisine Type</label>
                      <div className="mm-select-wrap">
                        <select id="cuisine-type" className="mm-input mm-select" value={cuisineType} onChange={e => setCuisineType(e.target.value)}>
                          <option>North Indian</option><option>South Indian</option><option>Gujarati</option><option>Rajasthani</option><option>Bengali</option>
                        </select>
                        <span className="icon mm-select-arrow">expand_more</span>
                      </div>
                    </div>
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="price-per-meal">Price Per Meal (₹)</label>
                      <input id="price-per-meal" className="mm-input" type="number" min={50} max={500} value={pricePerMeal} onChange={e => setPricePerMeal(+e.target.value)} />
                    </div>
                  </div>
                  <div className="mm-field">
                    <label className="mm-label" htmlFor="mess-desc">Description</label>
                    <textarea id="mess-desc" className="mm-input mm-textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>

                <div className="mm-card">
                  <h3 className="mm-card-title">
                    <span className="icon mm-card-icon">delivery_dining</span>
                    Service &amp; Pricing
                  </h3>
                  <p className="mm-card-sub">Choose which services are active for your mess</p>
                  
                  <div className="mm-service-grid">
                    {SERVICE_INFO.map(item => (
                      <div 
                        key={item.id} 
                        className={`mm-service-card ${services.includes(item.id) ? 'active' : ''}`}
                        onClick={() => toggleService(item.id)}
                      >
                        <div className="mm-sc-icon">
                          <span className="icon">{item.icon}</span>
                        </div>
                        <div className="mm-sc-details">
                          <div className="mm-sc-name">{item.id}</div>
                          <div className="mm-sc-desc">{item.desc}</div>
                        </div>
                        <div className="mm-sc-check">
                          <span className="icon">
                            {services.includes(item.id) ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            )}

            {/* MENU & GALLERY */}
            {activeTab === 'menu' && (
              <>
                <div className="mm-card">
                  <div className="mm-card-header">
                    <div className="mm-card-title-group">
                      <h3 className="mm-card-title">
                        <span className="icon mm-card-icon">gallery_thumbnail</span>
                        Photo Gallery
                      </h3>
                      <p className="mm-card-sub">Showcase your establishment & food to customers</p>
                    </div>
                    
                    <label className={`ui-btn ui-btn-sm ${uploading ? 'disabled' : 'ui-btn-ghost'}`}>
                      <span className="icon">{uploading ? 'sync' : 'add_a_photo'}</span>
                      <span className="btn-text">{uploading ? 'Uploading...' : 'Add Photos'}</span>
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <div className="mm-gallery-layout">
                    {gallery.length === 0 && !uploading ? (
                      <div className="mm-empty-gallery">
                        <span className="icon">imagesmode</span>
                        <p>No photos yet. Add some to make your mess look attractive!</p>
                      </div>
                    ) : (
                      <>
                        {/* Featured Slot */}
                        {imageUrl && (
                          <div className="mm-photo-featured">
                            <img src={imageUrl} alt="Featured" />
                            <div className="mm-photo-badge">Cover Photo</div>
                            <div className="mm-photo-overlay">
                              <button className="mm-photo-action" onClick={() => handleRemovePhoto(imageUrl)} title="Delete Photo">
                                <span className="icon">delete</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Grid Slot (remaining images) */}
                        <div className="mm-photo-grid">
                          {gallery.filter(url => url !== imageUrl).map((url, i) => (
                            <div key={i} className="mm-photo-card">
                              <img src={url} alt={`Gallery ${i}`} />
                              <div className="mm-photo-overlay">
                                <button className="mm-photo-action" onClick={() => handleSetFeatured(url)} title="Set as Featured">
                                  <span className="icon">star</span>
                                </button>
                                <button className="mm-photo-action" onClick={() => handleRemovePhoto(url)} title="Delete Photo">
                                  <span className="icon">delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {uploading && (
                            <div className="mm-photo-slot loading">
                              <div className="mm-photo-slot-inner">
                                <span className="icon spinning">sync</span>
                                <span>Uploading...</span>
                              </div>
                            </div>
                          )}

                          {gallery.length < 10 && (
                            <label className="mm-photo-slot empty">
                              <div className="mm-photo-slot-inner">
                                <span className="icon">add_photo_alternate</span>
                                <span>Upload</span>
                                <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                              </div>
                            </label>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* BUSINESS HOURS */}
            {activeTab === 'hours' && (
              <div className="mm-card">
                <div className="mm-card-header">
                  <div className="mm-card-header-left">
                    <h3 className="mm-card-title">
                      <span className="icon mm-card-icon">schedule</span>Business Hours
                    </h3>
                    <p className="mm-card-sub">Set your operating hours for each day of the week</p>
                  </div>
                  <button className="mm-bulk-btn" onClick={copyMondayToAll}>
                    <span className="icon">content_copy</span>
                    Apply Monday to All
                  </button>
                </div>

                <div className="mm-hours-list">
                  {DAYS.map(day => (
                    <div key={day} className={`mm-hours-row ${hours[day].open ? 'is-open' : 'is-closed'}`}>
                      <div className="mm-hr-day-group">
                        <div className="mm-hr-icon-box">
                          <span className="icon">{day === 'Sunday' ? 'event_busy' : 'today'}</span>
                        </div>
                        <span className="mm-hr-day-name">{day}</span>
                      </div>

                      <div className="mm-hr-status-group">
                        <div 
                          className={`mm-elite-toggle ${hours[day].open ? 'active' : ''}`}
                          onClick={() => updateHour(day, 'open', !hours[day].open)}
                        >
                          <div className="mm-et-label left">Closed</div>
                          <div className="mm-et-track">
                            <div className="mm-et-thumb" />
                          </div>
                          <div className="mm-et-label right">Open</div>
                        </div>
                      </div>

                      <div className="mm-hr-time-group">
                        {hours[day].open ? (
                          <div className="mm-elite-time-range">
                            <div className="mm-time-box">
                              <span className="icon">login</span>
                              <input 
                                type="time" 
                                value={hours[day].from} 
                                onChange={e => updateHour(day, 'from', e.target.value)}
                              />
                            </div>
                            <div className="mm-time-divider"></div>
                            <div className="mm-time-box">
                              <span className="icon">logout</span>
                              <input 
                                type="time" 
                                value={hours[day].to} 
                                onChange={e => updateHour(day, 'to', e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="mm-closed-badge">
                            <span className="dot"></span>
                            Closed Today
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACT SETTINGS */}
            {activeTab === 'contact' && (
              <div className="mm-card">
                <h3 className="mm-card-title">
                  <span className="icon mm-card-icon">settings</span>Contact Settings
                </h3>
                <div className="mm-card-section">
                  <h4 className="mm-section-label">
                    <span className="icon" style={{ fontSize: '16px' }}>location_on</span>Mess Address
                  </h4>
                  <div className="mm-field">
                    <label className="mm-label" htmlFor="mess-address">Full Address</label>
                    <textarea id="mess-address" className="mm-input mm-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div className="mm-field">
                    <label className="mm-label">Pin Shop Location</label>
                    <LocationPicker 
                      initialPos={coords} 
                      onLocationChange={setCoords} 
                    />
                  </div>
                  <div className="mm-field">
                    <label className="mm-label" htmlFor="map-link">Google Maps Link (optional)</label>
                    <input id="map-link" className="mm-input" type="url" placeholder="https://maps.google.com/..." value={mapLink} onChange={e => setMapLink(e.target.value)} />
                  </div>
                </div>
                <div className="mm-card-section">
                  <h4 className="mm-section-label">
                    <span className="icon" style={{ fontSize: '16px' }}>call</span>Contact Details
                  </h4>
                  <div className="mm-form-grid-2">
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="mess-phone">Phone Number</label>
                      <input id="mess-phone" className="mm-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="mm-field">
                      <label className="mm-label" htmlFor="mess-email">Email (optional)</label>
                      <input id="mess-email" className="mm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="mm-right-sidebar">
            <div className="mm-card mm-quick-contact">
              <h4 className="mm-sidebar-label">Quick Contact</h4>
              <div className="mm-qc-row">
                <span className="icon mm-qc-icon">location_on</span>
                <div>
                  <div className="mm-qc-key">Mess Address</div>
                  <div className="mm-qc-val">{address}</div>
                </div>
              </div>
              <div className="mm-qc-row">
                <span className="icon mm-qc-icon">call</span>
                <div>
                  <div className="mm-qc-key">Primary Contact</div>
                  <div className="mm-qc-val">{phone}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        )}
      </div>

      {/* ── Mobile Sticky Save Footer ── */}
      <div className="mm-mobile-footer show-mobile">
        <button className="mm-save-btn mm-save-btn-full" onClick={handleSave}>
          <span className="icon" style={{ fontSize: '18px' }}>save</span>
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  )
}
