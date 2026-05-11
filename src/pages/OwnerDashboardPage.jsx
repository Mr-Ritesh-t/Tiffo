import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout, { useSidebar } from '../layout/DashboardLayout'
import MenuEditor from '../components/dashboard/MenuEditor'
import { useAuth } from '../hooks/useAuth'
import { getMessById, updateMess, wipeAllCurrentData, deleteMessAndSubcollections } from '../services/messService'
import { deleteCurrentUserAccount, upgradeToElite } from '../services/authService'
import OwnerReviews from '../components/dashboard/OwnerReviews'
import './OwnerDashboardPage.css'

import './OwnerDashboardPage.css'
import { paymentService } from '../services/paymentService'

export default function OwnerDashboardPage() {
  const { toggle } = useSidebar()
  const { user } = useAuth()
  const [mess, setMess] = useState(null)
  const [wiping, setWiping] = useState(false)
  const [loading, setLoading] = useState(true)

  // 💳 Handle Stripe Payment Success Return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success' && user?.id && user?.subscription !== 'elite') {
      const finishPayment = async () => {
        try {
          await upgradeToElite(user.id)
          alert("Payment Verified! Welcome to Tiffo Elite.")
          // Clear URL params without refreshing
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error("Upgrade failed:", err)
        }
      }
      finishPayment()
    }
  }, [user])

  const handleUpgrade = async () => {
    await paymentService.checkoutElite(user, () => {
      window.location.reload()
    })
  }

  // 🔄 Fetch Live Data on Load
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return
      try {
        const data = await getMessById(user.id)
        setMess(data)
      } catch (err) {
        console.error("Failed to load mess data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handleWipeData = async () => {
    if (!window.confirm("⚠️ DANGER: This will delete ALL mess data in the live database. This cannot be undone. Are you sure?")) return;
    
    setWiping(true)
    try {
      await wipeAllCurrentData()
      alert("Success! All data has been wiped. You can now start fresh.")
      window.location.reload()
    } catch (err) {
      alert("Failed to wipe data. Check your permissions.")
    } finally {
      setWiping(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!mess) return
    const newState = !mess.isOpen
    try {
      const updated = await updateMess(user.id, { isOpen: newState })
      setMess(updated)
    } catch (err) {
      console.error("Status update error:", err)
      alert("Failed to update status: " + (err.message || "Unknown error"))
    }
  }

  const handleNuclearReset = async () => {
    const confirmation = window.prompt("☢️ NUCLEAR RESET: To delete your account and all associated mess data, please type 'DELETE ACCOUNT' below:")
    
    if (confirmation !== 'DELETE ACCOUNT') {
      alert("Reset cancelled. Confirmation text did not match.")
      return
    }

    setWiping(true)
    try {
      // 1. Delete mess data if they are an owner
      if (user?.role === 'owner') {
        // user.uid matches the mess id for owners in our seed logic
        await deleteMessAndSubcollections(user.id)
      }
      
      // 2. Delete Profile & Auth Account
      await deleteCurrentUserAccount()
      
      alert("Account and data completely removed. We're sorry to see you go!")
      window.location.href = '/' // Logout and return to home
    } catch (err) {
      alert(err.message || "Failed to delete account.")
    } finally {
      setWiping(false)
    }
  }

  const renderAccountTab = () => (
    <div className="db-grid" style={{ marginTop: 0 }}>
      {/* 📬 Live Feedback Section */}
      <div className="db-col-left">
        <OwnerReviews messId={user?.id} />
      </div>

      {/* Sidebar: Profile */}
      <div className="db-col-right">
        
        {/* Mess Snapshot */}
        <div className="db-premium-card db-mess-preview">
          <div 
            className="db-mess-hero" 
            style={{ backgroundImage: `url('${mess?.imageUrl || '/mess_dashboard_banner_1776795734899.png'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
          <div className="db-mess-info">
            <div className="db-mess-header">
              <div>
                <div className="db-mess-type-tag">
                  <span className={`db-badge ${mess?.foodType || 'both'}`}>
                    {mess?.foodType === 'veg' ? 'Pure Veg' : (mess?.foodType === 'nonveg' ? 'Non-Veg' : 'Veg & Non-Veg')}
                  </span>
                </div>
                <h3 className="db-mess-name">{mess?.name || 'My Mess'}</h3>
                <p className="db-mess-location">{mess?.location?.split(',')[0] || 'Set Location'}</p>
              </div>
            </div>

            <div className="db-mess-meta">
              <div className="db-meta-row">
                <span className="icon">schedule</span>
                <span>{mess?.openingTime || '08:00'} - {mess?.closingTime || '22:00'}</span>
              </div>
              <div className="db-meta-row">
                <span className="icon">call</span>
                <span>{mess?.contactNumber || 'No Contact Set'}</span>
              </div>
            </div>
            
            <div className="db-mess-footer">
               <Link to="/owner/manage-mess" className="db-edit-profile-btn">
                 <span className="icon" style={{ fontSize: '16px', marginRight: '6px' }}>settings</span>
                 Business Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="db-sub-card">
          <div className="db-sub-header">
            <span className="db-sub-title">Your Plan</span>
            <span className={`db-sub-badge ${user?.subscription || 'free'}`}>
              <span className="icon" style={{ fontSize: '14px' }}>
                {user?.subscription === 'elite' ? 'workspace_premium' : 'auto_awesome'}
              </span>
              {user?.subscription === 'elite' ? 'Elite' : 'Free'}
            </span>
          </div>

          <div className="db-sub-features">
            <div className="db-sub-feature unlocked">
              <span className="icon">check_circle</span>
              <span>Menu Management</span>
            </div>
            <div className="db-sub-feature unlocked">
              <span className="icon">check_circle</span>
              <span>Thali Builder</span>
            </div>
            <div className={`db-sub-feature ${user?.subscription === 'elite' ? 'unlocked' : 'locked'}`}>
              <span className="icon">{user?.subscription === 'elite' ? 'check_circle' : 'lock'}</span>
              <span>WhatsApp Alerts</span>
            </div>
            <div className={`db-sub-feature ${user?.subscription === 'elite' ? 'unlocked' : 'locked'}`}>
              <span className="icon">{user?.subscription === 'elite' ? 'check_circle' : 'lock'}</span>
              <span>Priority Search Priority</span>
            </div>
          </div>

          {user?.subscription !== 'elite' && (
            <button className="btn-upgrade-elite" onClick={handleUpgrade}>
              <span className="icon">star</span>
              Upgrade to Elite
            </button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="db-sidebar-card db-danger-zone">
          <div className="db-danger-header">
            <span className="icon">warning</span>
            <h3>Danger Zone</h3>
          </div>
          <p className="db-danger-text">Delete all live messes and start from scratch.</p>
          <button 
            className="btn-wipe-data" 
            onClick={handleWipeData}
            disabled={wiping}
          >
            <span className="icon">delete_forever</span>
            {wiping ? 'Wiping Database...' : 'Wipe All Live Data'}
          </button>

          <div className="db-divider"></div>

          <button 
            className="btn-nuclear-reset" 
            onClick={handleNuclearReset}
            disabled={wiping}
          >
            <span className="icon">no_accounts</span>
            {wiping ? 'Processing...' : 'Delete My Account & Data'}
          </button>
        </div>

      </div>
    </div>
  )

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
              <h1 className="dl-topbar-title">Welcome back, {user?.name?.split(' ')[0] || 'Partner'}! 👋</h1>
            </div>
          </div>
          <div className="dl-topbar-right">
            <div className="db-status-bar">
               <button 
                className={`db-status-toggle ${mess?.isOpen ? 'is-open' : 'is-closed'}`}
                onClick={handleToggleStatus}
                title={mess?.isOpen ? 'Currently Open' : 'Currently Closed'}
              >
                <div className="db-status-dot-pulse" />
                <span className="db-status-text">
                  {mess?.isOpen ? 'Open' : 'Closed'}
                </span>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>
                  {mess?.isOpen ? 'check_circle' : 'do_not_disturb_on'}
                </span>
              </button>
            </div>

            <Link to="/owner/notifications" className="dl-icon-btn" aria-label="Notifications">
              <span className="icon">notifications</span>
              <span className="dl-notif-dot" />
            </Link>
          </div>
        </div>
      </div>

      <div className="dl-body" style={{ marginTop: '1.5rem', maxWidth: '1200px', margin: '1.5rem auto' }}>
        <MenuEditor accountContent={renderAccountTab()} />
      </div>
    </DashboardLayout>
  )
}
