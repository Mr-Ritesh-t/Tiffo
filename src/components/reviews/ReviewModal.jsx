import { useState } from 'react'
import './ReviewModal.css'

export default function ReviewModal({ isOpen, onClose, order, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !order) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert("Please select a star rating.")
      return
    }
    
    setIsSubmitting(true)
    await onSubmit(order.id, order.messId, rating, comment)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content card">
        <div className="review-modal-header">
          <h2>Rate Your Meal</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="icon">close</span>
          </button>
        </div>

        <div className="review-order-info">
          <span className="icon" style={{color: 'var(--primary)'}}>restaurant</span>
          <span>Order from {order.messId} • {new Date(order.createdAt).toLocaleDateString()}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star}
                className={`icon star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                {star <= (hoverRating || rating) ? 'star' : 'star_border'}
              </span>
            ))}
          </div>
          <p className="rating-text">
            {rating === 1 && "Terrible"}
            {rating === 2 && "Poor"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good"}
            {rating === 5 && "Excellent!"}
            {rating === 0 && "Select a rating"}
          </p>

          <div className="form-group" style={{marginTop: '1.5rem'}}>
            <label>Leave a comment (Optional)</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="How was the taste and packaging?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="review-modal-actions">
            <button type="button" className="ui-btn ui-btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="ui-btn ui-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
