import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import './MessCard.css'

/**
 * @param {{ mess: import('../../types').Mess, view?: 'grid'|'list' }} props
 */
export default function MessCard({ mess, view = 'grid' }) {
  const vegLabel = mess.foodType === 'veg' ? 'Veg' : mess.foodType === 'nonveg' ? 'Non-Veg' : 'Veg & Non-Veg'
  const vegVariant = mess.foodType === 'veg' ? 'success' : mess.foodType === 'nonveg' ? 'warning' : 'neutral'

  return (
    <Link to={`/mess/${mess.id}`} className={`mess-card ${view === 'list' ? 'mess-card-list' : ''}`}>
      {/* Image */}
      <div className="mess-card-img">
        <div className="mess-card-img-fallback">🍛</div>
        {!mess.isOpen && <div className="mess-card-closed-badge">Closed</div>}
      </div>

      {/* Body */}
      <div className="mess-card-body">
        <div className="mess-card-top">
          <h3 className="mess-card-name">{mess.name}</h3>
          <div className="mess-card-rating">
            <span className="icon" style={{ fontSize: '14px', color: '#f59e0b' }}>star</span>
            <span>{mess.rating}</span>
            <span className="mess-card-reviews">({mess.reviewCount})</span>
          </div>
        </div>

        <p className="mess-card-location">
          <span className="icon" style={{ fontSize: '13px', color: 'var(--gray-400)' }}>location_on</span>
          {mess.location}
        </p>

        <div className="mess-card-meta">
          <Badge variant={vegVariant}>{vegLabel}</Badge>
          <Badge variant="neutral">{mess.cuisine}</Badge>
        </div>

        <div className="mess-card-services">
          {mess.services.map(s => (
            <span key={s} className="mess-card-service-tag">{s}</span>
          ))}
        </div>

        <div className="mess-card-footer">
          <div className="mess-card-price">
            <span className="mess-card-price-amount">₹{mess.pricePerMeal}</span>
            <span className="mess-card-price-period">per meal</span>
          </div>
          <div className="mess-card-cta">View Details</div>
        </div>
      </div>
    </Link>
  )
}
