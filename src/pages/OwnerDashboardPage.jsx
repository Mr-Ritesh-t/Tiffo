import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout, { useSidebar } from '../layout/DashboardLayout'
import MenuEditor from '../components/dashboard/MenuEditor'
import { useAuth } from '../hooks/useAuth'
import { getMessById, wipeAllCurrentData, deleteMessAndSubcollections } from '../services/messService'
import { deleteCurrentUserAccount } from '../services/authService'
import './OwnerDashboardPage.css'

export default function OwnerDashboardPage() {
  const { toggle } = useSidebar()
  const { user } = useAuth()
  const [mess, setMess] = useState(null)
  const [wiping, setWiping] = useState(false)
  const [loading, setLoading] = useState(true)

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
            <Link to="/owner/notifications" className="dl-icon-btn" aria-label="Notifications">
              <span className="icon">notifications</span>
              <span className="dl-notif-dot" />
            </Link>
          </div>
        </div>
      </div>

      <div className="dl-body" style={{ marginTop: '1.5rem' }}>
        <div className="db-grid">
          {/* Main Content: Menu Management */}
          <div className="db-col-left">
            <MenuEditor />
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
                    <h3 className="db-mess-name">{mess?.name || 'My Mess'}</h3>
                    <p className="db-mess-location">{mess?.location?.split(',')[0] || 'Set Location'}</p>
                  </div>
                  <span className="db-pro-badge">PREMIUM</span>
                </div>
                
                <div className="db-mess-footer">
                   <Link to="/owner/manage-mess" className="db-edit-profile-btn">
                     <span className="icon" style={{ fontSize: '16px', marginRight: '6px' }}>settings</span>
                     Business Profile
                  </Link>
                </div>
              </div>
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
      </div>
    </DashboardLayout>
  )
}
