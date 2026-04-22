import './CustomerFilters.css'

export default function CustomerFilters({ activeFilter, onFilterChange }) {
  const FILTERS = ['All', 'Active', 'Paused', 'Expired']

  return (
    <div className="cf-container">
      <div className="cf-tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`cf-tab ${activeFilter === f ? 'active' : ''}`}
            onClick={() => onFilterChange(f)}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="cf-search">
        <span className="icon cf-search-icon">search</span>
        <input 
          type="text" 
          placeholder="Search by name..." 
          className="cf-search-input"
        />
      </div>
    </div>
  )
}
