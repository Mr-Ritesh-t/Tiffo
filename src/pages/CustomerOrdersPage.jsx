import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MainLayout from '../layout/MainLayout'
import { getOrdersByUserId } from '../services/orderService'
import { ROUTES } from '../constants/routes'
import ReviewsFeed from '../components/reviews/ReviewsFeed'
import './CustomerOrdersPage.css'

export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return
      const data = await getOrdersByUserId(user.id)
      setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  if (loading) return <MainLayout><div style={{padding:'5rem', textAlign:'center'}}>Loading your orders...</div></MainLayout>

  return (
    <MainLayout>
      <div className="orders-page">
        <div className="container">
          <header className="orders-header">
            <h1>Your Orders</h1>
            <p className="orders-sub">Track and manage your meal history</p>
          </header>

          {orders.length === 0 ? (
            <div className="orders-empty card">
              <span className="icon">receipt_long</span>
              <h3>No orders yet</h3>
              <p>Looks like you haven't ordered anything recently.</p>
              <Link to="/messes" className="ui-btn ui-btn-primary">Explore Messes</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card card">
                  <div className="order-header">
                    <div className="order-mess-info">
                      <span className="icon">storefront</span>
                      <div>
                        <h3 className="order-mess-name">{order.messName}</h3>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`order-status-pill status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.quantity} x {item.name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <span>Total Amount Paid</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>

                  <div className="order-footer">
                    <Link to={`/mess/${order.messId}`} className="ui-btn ui-btn-outline ui-btn-sm">
                      View Mess Profile
                    </Link>
                    {order.status === 'Delivered' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm">
                        Rate & Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof / Feed */}
          <div className="orders-community-section">
            <h2 className="section-title">Community Feedback</h2>
            <ReviewsFeed />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
