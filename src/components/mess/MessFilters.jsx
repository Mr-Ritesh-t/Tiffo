import Pill from '../ui/Pill'
import './MessFilters.css'

const FOOD_TYPES = ['All', 'Veg', 'Non-Veg']
const CUISINES   = ['All', 'North Indian', 'South Indian', 'Gujarati', 'Maharashtrian', 'Rajasthani', 'Multi-cuisine']
const SERVICES   = ['Delivery', 'Dine-In', 'Takeaway']

/**
 * @param {{
 *   filters: { foodType: string, cuisine: string, services: string[], maxPrice: number, minRating: number },
 *   onChange: (key: string, value: any) => void
 * }} props
 */
export default function MessFilters({ filters, onChange }) {
  const toggleService = (s) => {
    const current = filters.services ?? []
    const next = current.includes(s) ? current.filter(x => x !== s) : [...current, s]
    onChange('services', next)
  }

  return (
    <aside className="mf-root">
      <h3 className="mf-title">Filters</h3>

      {/* Food Type */}
      <div className="mf-section">
        <div className="mf-section-label">Food Type</div>
        <div className="mf-chips">
          {FOOD_TYPES.map(t => (
            <Pill
              key={t}
              active={filters.foodType === t.toLowerCase()}
              onClick={() => onChange('foodType', t.toLowerCase())}
            >
              {t}
            </Pill>
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div className="mf-section">
        <div className="mf-section-label">Cuisine</div>
        <div className="mf-chips mf-chips-col">
          {CUISINES.map(c => (
            <Pill
              key={c}
              active={filters.cuisine === c.toLowerCase()}
              onClick={() => onChange('cuisine', c.toLowerCase())}
            >
              {c}
            </Pill>
          ))}
        </div>
      </div>

      {/* Service Type */}
      <div className="mf-section">
        <div className="mf-section-label">Service</div>
        <div className="mf-chips">
          {SERVICES.map(s => (
            <Pill
              key={s}
              active={(filters.services ?? []).includes(s)}
              onClick={() => toggleService(s)}
            >
              {s}
            </Pill>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mf-section">
        <div className="mf-section-label">Max Price / Month: <strong>₹{filters.maxPrice}</strong></div>
        <input
          type="range"
          min={1000} max={5000} step={100}
          value={filters.maxPrice}
          onChange={e => onChange('maxPrice', +e.target.value)}
          className="mf-range"
        />
        <div className="mf-range-labels"><span>₹1,000</span><span>₹5,000</span></div>
      </div>

      {/* Min Rating */}
      <div className="mf-section">
        <div className="mf-section-label">Min Rating</div>
        <div className="mf-chips">
          {[4, 4.5, 4.8].map(r => (
            <Pill
              key={r}
              active={filters.minRating === r}
              onClick={() => onChange('minRating', r)}
              icon="star"
            >
              {r}+
            </Pill>
          ))}
        </div>
      </div>

      <button
        className="mf-reset"
        onClick={() => onChange('reset', null)}
      >
        Reset Filters
      </button>
    </aside>
  )
}
