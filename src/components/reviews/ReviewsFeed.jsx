import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMessReviews, submitReview } from '../../services/reviewService'
import { useAuth } from '../../hooks/useAuth'
import './ReviewsFeed.css'

export default function ReviewsFeed({ messId, totalCount }) {
  const { user, isCustomer } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New Review Form State
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [guestName, setGuestName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const loadReviews = async () => {
    if (!messId) return
    setLoading(true)
    const data = await getMessReviews(messId, 15) // fetch latest 15 reviews
    setReviews(data)
    setLoading(false)
  }

  useEffect(() => {
    loadReviews()
  }, [messId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (newRating === 0) {
      setError("Please select a rating.")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    // Use user.name if logged in, otherwise use the guestName provided in the form
    const displayName = user ? (user.name || user.displayName) : (guestName || 'Guest User')
    const result = await submitReview(messId, newRating, newComment, displayName)
    
    if (result.success) {
      setNewRating(0)
      setNewComment('')
      setGuestName('')
      loadReviews() // Refresh list
    } else {
      setError(result.error || "Failed to submit review.")
    }
    setSubmitting(false)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="reviews-feed loading">
        <p style={{color: 'var(--gray-500)'}}>Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="reviews-feed card">
      <div className="reviews-feed-header">
        <h3 className="reviews-id-title">Community Feedback</h3>
        <div className="reviews-summary">
          <span className="icon" style={{color: '#fbbf24'}}>star</span>
          <strong>{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</strong>
          <span className="count">({totalCount || reviews.length} reviews)</span>
        </div>
      </div>

      {/* Review Submission Form - Anyone can review */}
      <div className="write-review-section">
        <h4>Share your experience</h4>
        <form onSubmit={handleSubmitReview} className="review-form">
          {!user && (
            <input 
              type="text"
              className="review-name-input"
              placeholder="Your Name (Optional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{ marginBottom: '1rem', padding: '10px', borderRadius: '8px', border: '1px solid var(--gray-200)', width: '100%' }}
            />
          )}

          <div className="star-picker">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`icon star-select ${star <= (hoverRating || newRating) ? 'filled' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setNewRating(star)}
              >
                {star <= (hoverRating || newRating) ? 'star' : 'star_border'}
              </span>
            ))}
            <span className="rating-label">
              {newRating > 0 ? `${newRating} Stars` : "Select rating"}
            </span>
          </div>
          
          <textarea 
            className="review-textarea"
            placeholder="What did you like about the food, timing, or hygiene?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
          />
          
          {error && <p className="review-error">{error}</p>}
          
          <button 
            type="submit" 
            className="btn btn-primary submit-review-btn" 
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-item-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{review.customerName?.charAt(0) || 'C'}</div>
                  <div className="reviewer-meta">
                    <span className="reviewer-name">{review.customerName || 'Customer'}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`icon star-mini ${star <= review.rating ? 'filled' : ''}`}>
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="review-text">"{review.comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
