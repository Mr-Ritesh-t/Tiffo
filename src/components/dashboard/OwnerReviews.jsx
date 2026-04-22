import { useState, useEffect } from 'react'
import { getMessReviews } from '../../services/reviewService'
import './OwnerReviews.css'

export default function OwnerReviews({ messId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      if (!messId) return
      setLoading(true)
      const data = await getMessReviews(messId, 20) // Get latest 20
      setReviews(data)
      setLoading(false)
    }
    loadReviews()
  }, [messId])

  if (loading) return <div className="owner-reviews-loading">Loading feedback...</div>

  return (
    <div className="owner-reviews-card db-premium-card">
      <div className="owner-reviews-header">
        <div className="owner-reviews-title-group">
          <h3 className="owner-reviews-title">
            <span className="icon">reviews</span>
            Customer Feedback
          </h3>
          <p className="owner-reviews-sub">What your customers are saying about your food</p>
        </div>
      </div>

      <div className="owner-reviews-list">
        {reviews.length === 0 ? (
          <div className="owner-reviews-empty">
            <span className="icon">sentiment_satisfied</span>
            <p>No reviews yet. New feedback will appear here!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="owner-review-item">
              <div className="owner-review-top">
                <div className="owner-review-user">
                  <div className="owner-review-avatar">
                    {review.customerName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="owner-review-name">{review.customerName || 'Customer'}</div>
                    <div className="owner-review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="owner-review-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`icon star-mini ${star <= review.rating ? 'filled' : ''}`}>
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="owner-review-text">"{review.comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
