import './StatsRow.css'

const STAT_CONFIGS = [
  { 
    icon: 'visibility',   
    label: "Today's Views",      
    value: '1,240', 
    delta: '+12%', 
    config: { primary: '#f43f5e', shadow: 'rgba(244, 63, 94, 0.2)', bg: '#fff1f2', glow: '#fb7185', progression: 85 }
  },
  { 
    icon: 'shopping_basket', 
    label: "Today's Orders",     
    value: '42',    
    delta: '+5',   
    config: { primary: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.2)', bg: '#fffbeb', glow: '#fbbf24', progression: 65 }
  },
  { 
    icon: 'star',         
    label: 'Avg. Rating',         
    value: '4.8',   
    delta: '210',  
    config: { primary: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.2)', bg: '#eff6ff', glow: '#60a5fa', progression: 95 }
  },
  { 
    icon: 'payments',     
    label: 'Daily Revenue',     
    value: '₹6,400', 
    delta: '+8%',  
    config: { primary: '#10b981', shadow: 'rgba(16, 185, 129, 0.2)', bg: '#ecfdf5', glow: '#34d399', progression: 75 }
  },
]

export default function StatsRow() {
  return (
    <div className="sr-grid">
      {STAT_CONFIGS.map(s => (
        <div key={s.label} className="sr-card" style={{ 
          '--stat-color-primary': s.config.primary,
          '--stat-shadow': s.config.shadow,
          '--stat-bg': s.config.bg,
          '--stat-glow': s.config.glow
        }}>
          <div className="sr-top">
            <div className="sr-icon-wrap">
              <span className="icon">{s.icon}</span>
            </div>
            <span className="sr-delta up">
              <span className="icon" style={{ fontSize: '14px' }}>trending_up</span>
              {s.delta}
            </span>
          </div>
          <div className="sr-value">{s.value}</div>
          <div className="sr-label">{s.label}</div>
          
          <div className="sr-chart-track">
            <div className="sr-chart-fill" style={{ width: `${s.config.progression}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
