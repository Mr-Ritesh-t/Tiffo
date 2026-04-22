import { useState } from 'react'
import Badge from '../ui/Badge'
import './CustomerTable.css'

export default function CustomerTable({ customers, loading, onUpdateStatus }) {
  const [menuOpen, setMenuOpen] = useState(null)

  const handleAction = (id, newStatus) => {
    onUpdateStatus(id, newStatus)
    setMenuOpen(null)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="ct-card">
        <table className="ct-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th className="ct-th-right"></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map(n => (
              <tr key={n}>
                 <td>
                  <div className="ct-skeleton-row">
                    <div className="ct-skel-avatar" />
                    <div className="ct-skel-text" style={{ width: '120px' }} />
                  </div>
                </td>
                <td><div className="ct-skel-text" style={{ width: '24px', height: '24px', borderRadius: '50%' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Empty state
  if (customers.length === 0) {
    return (
      <div className="ct-empty">
        <span className="icon ct-empty-icon">person_off</span>
        <h3 className="ct-empty-title">No customers found</h3>
        <p className="ct-empty-sub">Try adjusting your filters or wait for new orders.</p>
      </div>
    )
  }

  return (
    <div className="ct-card">
      <div className="ct-table-wrap">
        <table className="ct-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Info</th>
              <th className="ct-th-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="ct-user-cell">
                    <div className="ct-avatar">{c.avatar}</div>
                    <div>
                      <div className="ct-name">{c.name}</div>
                      <div className="ct-meta">Active {c.lastActive}</div>
                    </div>
                  </div>
                </td>
                 <td>
                  <div className="ct-meta">Not specified</div>
                </td>
                <td className="ct-td-right">
                  <div className="ct-action-wrap">
                    <button 
                      className="ct-action-btn"
                      onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                    >
                      <span className="icon">more_vert</span>
                    </button>
                    
                    {menuOpen === c.id && (
                      <>
                        <div className="ct-menu-overlay" onClick={() => setMenuOpen(null)} />
                        <div className="ct-dropdown">
                          <button className="ct-dropdown-item">
                            <span className="icon">person</span> View Profile
                          </button>
                          <button className="ct-dropdown-item">
                            <span className="icon">chat</span> Message
                          </button>
                          <div className="ct-divider" />
                           <button className="ct-dropdown-item ct-text-danger">
                            <span className="icon">person_remove</span> Remove Customer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
