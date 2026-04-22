import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import { getMessById, getMessMenu } from '../services/messService'
import { getReviewCount } from '../services/reviewService'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import ReviewsFeed from '../components/reviews/ReviewsFeed'
import './MessDetailsPage.css'

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MessDetailsPage() {
  const { id } = useParams()
  const [mess, setMess] = useState(null)
  const [menuData, setMenuData] = useState({ dailyMenu: [], availableThalis: [] })
  const [loading, setLoading] = useState(true)
  const [realReviewCount, setRealReviewCount] = useState(0)
  const [mapActive, setMapActive] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const fetchId = id || '1'
        const messData = await getMessById(fetchId)
        const menu = await getMessMenu(fetchId)
        const count = await getReviewCount(fetchId)
        
        setMess(messData)
        setRealReviewCount(count || messData.reviewCount || 0)
        setMenuData({
          dailyMenu: (menu?.items || []).filter(i => i.isAvailableToday),
          availableThalis: (menu?.thalis || []).filter(t => t.isAvailableToday)
        })
      } catch (err) {
        console.error("Failed to load mess data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) return <MainLayout><div style={{padding:'5rem', textAlign:'center'}}>Loading Profile...</div></MainLayout>
  if (!mess) return <MainLayout><div style={{padding:'5rem', textAlign:'center'}}>Mess not found.</div></MainLayout>

  const { supportsSingleItems, supportsThali } = mess

  return (
    <MainLayout>
      <div className="profile-page">
        {/* Breadcrumb */}
        <div className="profile-breadcrumb">
          <div className="container">
            <Link to="/">Home</Link>
            <span className="icon">chevron_right</span>
            <Link to="/messes">Find Mess</Link>
            <span className="icon">chevron_right</span>
            <span>{mess.name}</span>
          </div>
        </div>

        <div className="container profile-layout">
          {/* Left / Main Content */}
          <div className="profile-main">
            {/* Hero Card */}
            <div className="profile-hero card" style={{margin:'0px 10px 10px 10px'}}>
              <div className="profile-hero-img">
                {mess.imageUrl ? (
                  <img src={mess.imageUrl} alt={mess.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="hero-placeholder">
                    <span className="icon">restaurant</span>
                  </div>
                )}
              </div>
              <div className="profile-hero-body">
                <div className="profile-tag">Home-Style Meals</div>
                <h1 className="profile-name">{mess.name || 'Local Mess'}</h1>
                <div className="profile-area">
                  <span className="icon">location_on</span> {mess.location || 'HSR Layout, Bangalore'}
                </div>
                <div className="profile-tags-row">
                  <span className="pill">🟢 {mess.foodType === 'veg' ? 'Pure Veg' : 'Non-Veg Options'}</span>
                  <span className="pill">⭐ {mess.rating || '0.0'} ({realReviewCount} Reviews)</span>
                </div>
              </div>
              <div className="sidebar-header-elite" style={{ borderBottom: 'none', marginBottom: '10px', marginLeft: '20px' }}>
                <span className="icon" style={{ color: 'var(--success)' }}>schedule</span>
                <div className="timing-status">
                  <div className={`live-status-pill ${mess.isOpen ? 'is-open' : 'is-closed'}`}>
                    <div className="live-pulse-dot" />
                    <span>{mess.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                    {(() => {
                      const formatTime = (t) => {
                        if (!t) return '';
                        const [h, m] = t.split(':');
                        const hh = parseInt(h, 10);
                        const ampm = hh >= 12 ? 'PM' : 'AM';
                        const h12 = hh % 12 || 12;
                        return `${h12}:${m} ${ampm}`;
                      };
                      const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
                      const hours = mess.businessHours?.[today];
                      if (!hours || !hours.open) return <span style={{ color: 'var(--error)' }}>Closed Today</span>;
                      return `Today: ${formatTime(hours.from)} - ${formatTime(hours.to)}`;
                    })()}
                  </h3>
                  <small style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>Business Hours</small>
                </div>
              </div>
            </div>

            {/* Discovery Section (Menus & Timings) */}
            {(supportsSingleItems || supportsThali) && (
              <div className="profile-section card">
                <div className="profile-section-header">
                  <span className="icon" style={{color:'var(--primary)'}}>restaurant_menu</span>
                  <h2>Mess Menu</h2>
                  <span className="badge badge-info">Today Menu</span>
                </div>

                

                {supportsThali && menuData.availableThalis.length > 0 && (
                  <div className="menu-group">
                    <h3 className="menu-group-title">Complete Thalis</h3>
                    <div className="menu-items-grid">
                      {menuData.availableThalis.map(thali => (
                        <div key={thali.id} className="buy-item-card">
                          <div className="buy-info">
                            <h4>{thali.name}</h4>
                            <p className="buy-desc">{thali.description}</p>
                            <span className="buy-price">₹{thali.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                

                {supportsSingleItems && menuData.dailyMenu.length > 0 && (
                  <div className="menu-group">
                    <h3 className="menu-group-title">Today Item</h3>
                    <div className="menu-items-grid">
                      {menuData.dailyMenu.map(item => (
                        <div key={item.id} className="buy-item-card">
                          <div className="buy-info">
                            <h4>{item.name}</h4>
                            <p className="buy-desc">{item.category}</p>
                            <span className="buy-price">₹{item.defaultPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              

              </div>
            )}

            

            {/* Photo Gallery */}
            {mess.gallery && mess.gallery.length > 0 && (
              <div className="profile-section card">
                <div className="profile-section-header">
                  <span className="icon" style={{ color: 'var(--primary)' }}>collections</span>
                  <h2>Photo Gallery</h2>
                </div>
                <div className="profile-gallery-grid">
                  {mess.gallery.map((url, idx) => (
                    <div key={idx} className="profile-gallery-item">
                      <img src={url} alt={`Gallery ${idx}`} onClick={() => window.open(url, '_blank')} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Reviews */}
            
          </div>

          <div className="profile-sidebar">
            <div className="profile-card card sticky sidebar-elite">
              
              
              <div className="sidebar-section-elite" style={{ paddingTop: '0.5rem' }}>

                <div className={`elite-mini-map ${mapActive ? 'is-active' : 'is-locked'}`} onClick={() => !mapActive && setMapActive(true)}>
                  <MapContainer 
                    key={mapActive ? 'active' : 'locked'}
                    center={[mess.lat || 18.5204, mess.lng || 73.8567]} 
                    zoom={15} 
                    scrollWheelZoom={mapActive}
                    dragging={mapActive}
                    touchZoom={mapActive}
                    doubleClickZoom={mapActive}
                    zoomControl={mapActive}
                    style={{ height: '140px', width: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[mess.lat || 18.5204, mess.lng || 73.8567]} />
                  </MapContainer>
                  {!mapActive && (
                    <div className="map-unlock-overlay">
                      <span className="material-icons-round">touch_app</span>
                      <span>Tap to move map</span>
                    </div>
                  )}
                  <p className="map-area-label">
                    <span className="icon">location_on</span>
                    {mess.location}
                  </p>
                </div>
              </div>

              <div className="sidebar-actions-elite">
                <a 
                  href={`tel:${mess.phone }`} 
                  className="btn-elite-action call"
                  style={{margin:'10px 0 0 0'}}
                >
                  <span className="icon">call</span> 
                  <div className="btn-text">
                    <span>Call Mess Owner</span>
                    <small>Direct Line</small>
                  </div>
                </a>
                
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mess.lat},${mess.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-elite-action directions"
                >
                  <span className="icon">directions</span>
                  <div className="btn-text">
                    <span>Get Directions</span>
                    <small>Open in Maps</small>
                  </div>
                </a>
              </div>

              <div className="sidebar-footer-elite">
                <div className="sidebar-about-section">
                  <div className="sidebar-about-header">
                    <span className="icon">info</span>
                    <h4>About this Mess</h4>
                  </div>
                  <p className="sidebar-about-text">
                    {mess.description || 'Welcome to our mess! We serve authentic home-style food prepared with fresh ingredients and care.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <ReviewsFeed messId={mess.id} totalCount={realReviewCount} />
    </MainLayout>
  )
}
