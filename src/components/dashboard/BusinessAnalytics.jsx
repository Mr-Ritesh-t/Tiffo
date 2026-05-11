import FeatureLock from '../shared/FeatureLock'
import './BusinessAnalytics.css'

export default function BusinessAnalytics() {
  return (
    <FeatureLock featureName="Advanced Analytics">
      <div className="analytics-container db-premium-card">
        <div className="analytics-header">
          <h3 className="analytics-title">
            <span className="icon">analytics</span>
            Advanced Analytics
          </h3>
          <p className="analytics-sub">Detailed revenue and growth charts are coming soon.</p>
        </div>


        <div className="analytics-chart-placeholder">
          {/* Chart would go here */}
          <div className="mock-chart">
            <div className="bar" style={{ height: '40%' }}></div>
            <div className="bar" style={{ height: '60%' }}></div>
            <div className="bar" style={{ height: '80%' }}></div>
            <div className="bar" style={{ height: '50%' }}></div>
            <div className="bar" style={{ height: '90%' }}></div>
            <div className="bar" style={{ height: '70%' }}></div>
            <div className="bar" style={{ height: '85%' }}></div>
          </div>
        </div>
      </div>
    </FeatureLock>
  )
}
