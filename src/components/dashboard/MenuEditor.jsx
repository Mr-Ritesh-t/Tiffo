import { useState } from 'react'
import { MenuProvider, useMenu } from '../menu/MenuContext'
import { useAuth } from '../../hooks/useAuth'
import ItemBank from '../menu/ItemBank'
import ThaliBuilder from '../menu/ThaliBuilder'
import './MenuEditor.css'

function AdvancedMenuBoard() {
  const { items, thalis, toggleAvailability, toggleThaliAvailability, loading } = useMenu()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('daily')

  if (loading) {
    return <div className="me-card" style={{ padding: '3rem', textAlign: 'center' }}>Loading Menu Data...</div>
  }

  return (
    <div className="me-wrapper">
      <div className="me-tabs-container">
        <div className="me-tabs">
          <button className={`me-tab ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>
            Daily Menu
          </button>
          <button className={`me-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            Item Bank
          </button>
          <button className={`me-tab ${activeTab === 'thalis' ? 'active' : ''}`} onClick={() => setActiveTab('thalis')}>
            Thalis
          </button>
        </div>
      </div>

      <div className="me-content">
        {activeTab === 'items' && <div className="me-card"><ItemBank /></div>}
        {activeTab === 'thalis' && <div className="me-card"><ThaliBuilder /></div>}
        
        {activeTab === 'daily' && (
          <div className="me-card">
            <div className="me-header">
              <div className="me-header-left">
                <div className="me-header-icon">
                   <span className="icon">restaurant_menu</span>
                </div>
                <div>
                  <h2 className="me-title">Active Menu Board</h2>
                  <p className="me-subtitle">Toggle availability for today's orders</p>
                </div>
              </div>
            </div>
            
            <div className="me-section">
              <span className="me-section-title">Standard Thalis</span>
              <div className="me-toggles-grid">
                {thalis.length === 0 && (
                  <div className="me-empty-state">
                    <p className="me-empty-text">No Thalis setup yet.</p>
                  </div>
                )}
                {thalis.map(thali => (
                  <label key={thali.id} className={`me-toggle-card ${thali.isAvailableToday ? 'active' : ''}`}>
                    <div className="me-toggle-checkbox">
                        {thali.isAvailableToday && <span className="icon" style={{ fontSize: '14px' }}>check</span>}
                    </div>
                    <input 
                      type="checkbox" 
                      hidden
                      checked={thali.isAvailableToday} 
                      onChange={() => toggleThaliAvailability(thali.id)}
                    />
                    <div>
                      <div className="me-toggle-name">{thali.name}</div>
                      <div className="me-toggle-meta">₹{thali.price} / plate</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="me-section">
              <span className="me-section-title">Individual Dishes</span>
              <div className="me-toggles-grid">
                {items.length === 0 && <p className="me-empty-text">No items found.</p>}
                {items.map(item => (
                  <label key={item.id} className={`me-toggle-card ${item.isAvailableToday ? 'active' : ''}`}>
                    <div className="me-toggle-checkbox">
                        {item.isAvailableToday && <span className="icon" style={{ fontSize: '14px' }}>check</span>}
                    </div>
                    <input 
                      type="checkbox" 
                      hidden
                      checked={item.isAvailableToday} 
                      onChange={() => toggleAvailability(item.id)}
                    />
                    <div>
                      <div className="me-toggle-name">{item.name}</div>
                      <div className="me-toggle-meta">{item.category} • ₹{item.defaultPrice}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="me-footer">
               <div className="db-live-indicator-elite">
                  <div className="db-indicator-dot-elite" />
                  Live Sync Active
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MenuEditor() {
  const { user } = useAuth()
  
  if (!user) return null

  return (
    <MenuProvider messId={user.id}>
      <AdvancedMenuBoard />
    </MenuProvider>
  )
}
