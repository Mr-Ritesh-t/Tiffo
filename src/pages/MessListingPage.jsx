import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getMesses, calculateDistance } from '../services/messService'
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
        if (foodType === 'Veg Only' && !m.veg) return false
        if (foodType === 'Non-Veg' && m.veg) return false
        if (services.length > 0 && !services.includes(m.type)) return false
        if (m.rating < minRating) return false
        if (m.price > maxPrice) return false
        
        const nameMatch = m.name?.toLowerCase().includes(searchVal.toLowerCase())
        const cuisineMatch = m.cuisine?.toLowerCase().includes(searchVal.toLowerCase())
        if (searchVal && !nameMatch && !cuisineMatch) return false
        return true
    }).sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        if (sortBy === 'rating') return ratingB - ratingA
        
        const priceA = a.price || 0
        const priceB = b.price || 0
        if (sortBy === 'price_low') return priceA - priceB
        if (sortBy === 'price_high') return priceB - priceA
        
        const distA = parseFloat(a.distance || 0)
        const distB = parseFloat(b.distance || 0)
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
                        <span className="icon elp-search-icon">search</span>
                        <input
                            id="enhanced-search"
                            className="elp-search-input"
                            placeholder="Search messes, cuisine..."
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                        />
                    </div>
                    <div className="elp-topbar-right">
                        <span className="elp-result-count">Showing <strong>{filtered.length}</strong> of {messes.length} results in <strong>HSR Layout</strong></span>
                        <div className="elp-sort">
                            <span className="icon" style={{ color: 'var(--gray-500)', fontSize: '18px' }}>swap_vert</span>
                            <select id="enhanced-sort" className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="recommended">Recommended</option>
                                <option value="rating">Best Rating</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="distance">Nearest First</option>
                            </select>
                        </div>
                        <div className="elp-view-toggle">
                            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} id="view-grid"><span className="icon">grid_view</span></button>
                            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} id="view-list"><span className="icon">view_list</span></button>
                            <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')} id="view-map"><span className="icon">map</span></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container elp-body">
                {/* Filter Sidebar */}
                <aside className="elp-filters">
                    <div className="filter-header">
                        <h3><span className="icon">tune</span> Filters</h3>
                        <button className="filter-reset" onClick={() => { setFoodType('All'); setServices([]); setMinRating(0); setMaxPrice(4000); setUserLocation(null); setSortBy('recommended') }}>Reset</button>
                    </div>

                    <div className="filter-section">
                      <button 
                        className={`location-detect-btn ${userLocation ? 'active' : ''}`}
                        onClick={handleDetectLocation}
                        disabled={detecting}
                      >
                        <span className="icon">{detecting ? 'sync' : (userLocation ? 'check_circle' : 'my_location')}</span>
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
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({ className: 'user-marker', html: '<span class="icon">person_pin_circle</span>' })} />
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
                                            <span className={`badge ${mess.veg ? 'badge-success' : 'badge-warning'}`}>{mess.veg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                                        </div>
                                        {(mess.distanceVal || mess.distance) && (
                                          <div className="elp-card-distance">
                                              <span className="icon" style={{ fontSize: '12px' }}>near_me</span>
                                              {mess.distanceVal ? `${mess.distanceVal} km` : mess.distance}
                                          </div>
                                        )}
                                    </div>
                                    <div className="elp-card-body">
                                        <div className="elp-card-type">{mess.type || 'Standard'}</div>
                                        <h3 className="elp-card-name">{mess.name || 'Unnamed Mess'}</h3>
                                        <p className="elp-card-cuisine">{mess.cuisine || 'Multi-cuisine'}</p>
                                        <div className="elp-card-tags">
                                            {(mess.tags || []).map(t => <span key={t} className="pill elp-tag">{t}</span>)}
                                        </div>
                                        <div className="elp-card-footer">
                                            <div>
                                                <div className="elp-rating">⭐ <strong>{mess.rating || 'New'}</strong> <span className="elp-reviews">({mess.reviewCount || 0} reviews)</span></div>
                                            </div>
                                           
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
