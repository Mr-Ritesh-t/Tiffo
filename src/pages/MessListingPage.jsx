import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getMesses, calculateDistance } from '../services/messService'
import AccurateCountPill from '../components/reviews/AccurateCountPill'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './MessListingPage.css'

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

/**
 * Component to center map on results
 */
function MapAutoCenter({ messes, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (messes.length > 0) {
      const bounds = L.latLngBounds(messes.map(m => [m.lat, m.lng]));
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [messes, userLocation, map]);
  return null;
}

const FOOD_TYPES = ['All', 'Veg Only', 'Non-Veg']
const SERVICE_TYPES = ['Full Meal', 'Tiffin', 'Chapati', 'Diet']
const RATINGS = ['4+ Stars', '4.5+ Stars']

export default function MessListingPage() {
    const [messes, setMesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [foodType, setFoodType] = useState('All')
    const [services, setServices] = useState([])
    const [minRating, setMinRating] = useState(0)
    const [maxPrice, setMaxPrice] = useState(4000)
    const [searchVal, setSearchVal] = useState('')
    const [sortBy, setSortBy] = useState('recommended')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list' | 'map'
    const [userLocation, setUserLocation] = useState(null)
    const [detecting, setDetecting] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        async function fetchMesses() {
            setLoading(true)
            try {
              const filters = {}
              if (userLocation) {
                filters.userLat = userLocation.lat
                filters.userLng = userLocation.lng
                if (sortBy === 'distance') filters.sortByDistance = true
              }
              const data = await getMesses(filters)
              setMesses(data || [])
            } finally {
              setLoading(false)
            }
        }
        fetchMesses()
    }, [userLocation, sortBy])

    const handleDetectLocation = () => {
      setDetecting(true)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            setSortBy('distance')
            setDetecting(false)
          },
          (err) => {
            console.error(err)
            alert('Location access denied. Please enable it in browser settings.')
            setDetecting(false)
          }
        )
      }
    }

    const toggleService = (s) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

    const filtered = messes.filter(m => {
        // Fallbacks for data field names to support older records
        const effectivePrice = Number(m.price || m.pricePerMeal || 0)
        const isVeg = m.veg !== undefined ? m.veg : (m.diet === 'veg' || m.foodType === 'veg' || m.foodType === 'both')
        const currentType = m.type || 'Full Meal'

        if (foodType === 'Veg Only' && (m.foodType === 'nonveg' || (m.veg === false))) return false
        if (foodType === 'Non-Veg' && (m.foodType === 'veg' || (m.veg === true))) return false
        if (services.length > 0 && !services.includes(currentType)) return false
        if (m.rating < minRating) return false
        if (effectivePrice > maxPrice) return false
        
        if (searchVal) {
            const s = searchVal.toLowerCase()
            return (
              m.name?.toLowerCase().includes(s) || 
              m.cuisine?.toLowerCase().includes(s) || 
              m.location?.toLowerCase().includes(s) ||
              m.messName?.toLowerCase().includes(s)
            )
        }
        return true
    }).sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        if (sortBy === 'rating') return ratingB - ratingA
        
        const priceA = Number(a.price || a.pricePerMeal || 0)
        const priceB = Number(b.price || b.pricePerMeal || 0)
        if (sortBy === 'price_low') return priceA - priceB
        if (sortBy === 'price_high') return priceB - priceA
        
        const distA = parseFloat(a.distanceVal || a.distance || 0)
        const distB = parseFloat(b.distanceVal || b.distance || 0)
        if (sortBy === 'distance') return distA - distB
        return 0
    })

    return (
        <div className="enhanced-listing-page">
            <Navbar />

            {/* Top Bar */}
            <div className="elp-topbar">
                <div className="container elp-topbar-inner">
                    <div className="elp-search">
                        <span className="material-icons-round elp-search-icon">search</span>
                        <input
                            id="enhanced-search"
                            className="elp-search-input"
                            placeholder="Search messes, cuisine..."
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                        />
                    </div>
                    <div className="elp-topbar-right">
                        <div className="elp-controls-row">
                          <button className="elp-action-chip" onClick={() => setShowFilters(true)}>
                            <span className="material-icons-round">tune</span>
                            Filters
                          </button>
                          
                          <div className="elp-action-chip elp-sort-chip">
                              <span className="material-icons-round">swap_vert</span>
                              <select id="enhanced-sort" className="sort-select-chip" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                  <option value="recommended">Sort</option>
                                  <option value="rating">Best Rating</option>
                                  <option value="price_low">Price: Low to High</option>
                                  <option value="price_high">Price: High to Low</option>
                                  <option value="distance">Nearest First</option>
                              </select>
                          </div>

                          <div className="elp-view-chips">
                              <button className={`view-chip ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><span className="material-icons-round">grid_view</span></button>
                              <button className={`view-chip ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><span className="material-icons-round">view_list</span></button>
                              <button className={`view-chip ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}><span className="material-icons-round">map</span></button>
                          </div>
                        </div>

                        <div className="elp-header-stats">
                          Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'mess' : 'messes'} in <strong>HSR Layout</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container elp-body">
                {/* Filter Sidebar */}
                {showFilters && <div className="mobile-filter-backdrop" onClick={() => setShowFilters(false)}></div>}
                <aside className={`elp-filters ${showFilters ? 'mobile-show' : ''}`}>
                    <div className="filter-header">
                        <h3><span className="material-icons-round" style={{ fontSize: '20px' }}>tune</span> Filters</h3>
                        <div className="mobile-filter-actions">
                          <button className="filter-reset" onClick={() => { setFoodType('All'); setServices([]); setMinRating(0); setMaxPrice(4000); setUserLocation(null); setSortBy('recommended') }}>Reset</button>
                          <button className="mobile-filter-close-icon" onClick={(e) => { e.stopPropagation(); setShowFilters(false); }} aria-label="Close filters">
                            <span className="material-icons-round">close</span>
                          </button>
                        </div>
                    </div>

                    <div className="filter-section">
                      <button 
                        className={`location-detect-btn ${userLocation ? 'active' : ''}`}
                        onClick={handleDetectLocation}
                        disabled={detecting}
                      >
                        <span className="material-icons-round">{detecting ? 'sync' : (userLocation ? 'check_circle' : 'my_location')}</span>
                        {detecting ? 'Detecting...' : (userLocation ? 'Location Detected' : 'Find Messes Near Me')}
                      </button>
                      {userLocation && (
                        <div className="location-detected-hint">Showing messes closest to your current location</div>
                      )}
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-title">Food Type</h4>
                        <div className="filter-radio-group">
                            {FOOD_TYPES.map(f => (
                                <label key={f} className="filter-radio">
                                    <input type="radio" name="foodType" checked={foodType === f} onChange={() => setFoodType(f)} />
                                    <span>{f}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-title">Service Type</h4>
                        <div className="filter-check-group">
                            {SERVICE_TYPES.map(s => (
                                <label key={s} className="filter-check">
                                    <input type="checkbox" checked={services.includes(s)} onChange={() => toggleService(s)} />
                                    <span>{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-title">Price per Month (up to ₹{maxPrice.toLocaleString()})</h4>
                        <input
                            type="range"
                            className="filter-range"
                            min={1500}
                            max={4000}
                            step={100}
                            value={maxPrice}
                            onChange={e => setMaxPrice(+e.target.value)}
                            id="price-range"
                        />
                        <div className="filter-range-labels">
                            <span>₹1,500</span>
                            <span>₹4,000</span>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-title">User Rating</h4>
                        <div className="filter-radio-group">
                            <label className="filter-radio">
                                <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} />
                                <span>Any Rating</span>
                            </label>
                            <label className="filter-radio">
                                <input type="radio" name="rating" checked={minRating === 4} onChange={() => setMinRating(4)} />
                                <span>⭐ 4+ Stars</span>
                            </label>
                            <label className="filter-radio">
                                <input type="radio" name="rating" checked={minRating === 4.5} onChange={() => setMinRating(4.5)} />
                                <span>⭐ 4.5+ Stars</span>
                            </label>
                        </div>
                    </div>

                    <div className="mobile-filter-footer">
                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowFilters(false)}>
                        Show {filtered.length} Results
                      </button>
                    </div>
                </aside>

                {/* Results */}
                <div className="elp-results">
                    {loading ? (
                        <div style={{ padding: '5rem', textAlign: 'center' }}>
                            <div className="loading-spinner"></div>
                            <p>Loading messes...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="elp-empty">
                            <span style={{ fontSize: '3rem' }}>🔍</span>
                            <h3>No messes found</h3>
                            <p>Try adjusting your filters.</p>
                            <button className="btn btn-secondary" onClick={() => { setFoodType('All'); setServices([]); setMinRating(0); setMaxPrice(4000) }}>Clear Filters</button>
                        </div>
                    ) : viewMode === 'map' ? (
                      <div className="elp-map-container" style={{ height: '600px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ebebeb' }}>
                        <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {filtered.map(m => (
                            <Marker key={m.id} position={[m.lat, m.lng]}>
                              <Popup>
                                <div className="map-popup-card">
                                  <strong>{m.name}</strong>
                                  <p>{m.cuisine} • ₹{m.price}/mo</p>
                                  <Link to={`/mess/${m.id}`} className="popup-link">View Details</Link>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                          {userLocation && (
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({ className: 'user-marker', html: '<span class="material-icons-round">person_pin_circle</span>' })} />
                          )}
                          <MapAutoCenter messes={filtered} userLocation={userLocation} />
                        </MapContainer>
                      </div>
                    ) : (
                        <div className={`elp-grid ${viewMode === 'list' ? 'elp-list' : ''}`}>
                            {filtered.map(mess => (
                                <Link to={`/mess/${mess.id}`} key={mess.id} className="elp-card card">
                                    <div className="elp-card-img">
                                        {mess.imageUrl ? (
                                          <img src={mess.imageUrl} alt={mess.name} className="elp-full-img" />
                                        ) : (
                                          <div className="elp-card-emoji">{mess.emoji || '🥘'}</div>
                                        )}
                                        <div className="elp-card-badges">
                                            <span className={`elp-type-tag ${mess.foodType === 'veg' ? 'veg' : (mess.foodType === 'nonveg' ? 'non-veg' : 'both')}`}>
                                              {mess.foodType === 'veg' ? '🟢 Veg' : (mess.foodType === 'nonveg' ? '🔴 Non-Veg' : '🟡 Veg & Non-Veg')}
                                            </span>
                                            {mess.price && (
                                              <span className="elp-price-tag">₹{mess.price}/mo</span>
                                            )}
                                        </div>
                                        {(mess.distanceVal || mess.distance) && (
                                          <div className="elp-card-distance">
                                              <span className="material-icons-round">near_me</span>
                                              {mess.distanceVal ? `${mess.distanceVal} km` : mess.distance}
                                          </div>
                                        )}
                                    </div>
                                    <div className="elp-card-body">
                                        <div className="elp-card-meta">
                                          <span className="elp-card-type">{mess.type || 'Standard'}</span>
                                          <div className="elp-rating-mini">⭐ {mess.rating || 'New'}</div>
                                        </div>
                                        <div className="elp-live-indicator-wrapper">
                                          <div className={`elp-status-dot ${mess.isOpen ? 'is-open' : 'is-closed'}`} />
                                          <span className={`elp-status-label ${mess.isOpen ? 'is-open' : 'is-closed'}`}>
                                            {mess.isOpen ? 'Open Now' : 'Closed'}
                                          </span>
                                        </div>
                                        <h3 className="elp-card-name">{mess.name || 'Unnamed Mess'}</h3>
                                        <p className="elp-card-cuisine">{mess.cuisine || 'Multi-cuisine'}</p>
                                        
                                        <div className="elp-card-tags">
                                            {(mess.tags || []).slice(0, 2).map(t => <span key={t} className="elp-mini-pill">{t}</span>)}
                                            <AccurateCountPill 
                                              messId={mess.id} 
                                              initialCount={mess.reviewCount} 
                                              className="elp-mini-pill reviews" 
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
