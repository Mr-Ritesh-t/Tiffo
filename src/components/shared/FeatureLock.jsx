import { useAuth } from '../../hooks/useAuth'
import { SUBSCRIPTION_PLANS } from '../../constants/subscriptions'
import { paymentService } from '../../services/paymentService'
import './FeatureLock.css'

export default function FeatureLock({ children, featureName }) {
  const { user } = useAuth()
  const isElite = user?.subscription === SUBSCRIPTION_PLANS.ELITE

  const handleUpgrade = async () => {
    await paymentService.checkoutElite(user, () => {
      window.location.reload()
    })
  }

  if (isElite) return children

  return (
    <div className="feature-lock-container">
      <div className="feature-content-blurred">
        {children}
      </div>
      <div className="lock-overlay">
        <div className="lock-card">
          <div className="lock-icon">
            <span className="material-symbols-rounded">lock</span>
          </div>
          <h3>{featureName} is an Elite Feature</h3>
          <p>Upgrade your plan to unlock the Thali Builder and other premium management tools.</p>
          <button className="ui-btn ui-btn-primary elite-upgrade-btn" onClick={handleUpgrade}>
            <span className="icon">star</span>
            Upgrade to Elite
          </button>
        </div>
      </div>
    </div>
  )
}
