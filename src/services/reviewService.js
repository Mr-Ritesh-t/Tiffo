import { collection, addDoc, doc, runTransaction, query, getDocs, orderBy, limit, getCountFromServer, setDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import { paths } from './firestorePaths'

/**
 * Submits a new review for a mess and recalculates the mess's average rating using a Firestore Transaction.
 * @param {string} messId - The ID of the mess being reviewed.
 * @param {number} rating - Star rating out of 5.
 * @param {string} comment - Optional text feedback.
 * @param {string} customerName - Optional. The name of the customer.
 * @param {string} orderId - Optional. The ID of the order being reviewed.
 */
export async function submitReview(messId, rating, comment, customerName = null, orderId = null) {
  try {
    const user = auth.currentUser
    
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5.')
    }

    const messRef = doc(db, paths.messProfile(messId))
    const reviewsCollection = collection(db, paths.messReviews(messId))
    const reviewRef = doc(reviewsCollection)

    // 1. Always attempt to add the Review Document first
    // We do this outside the main transaction if we expect permission issues on the parent
    const reviewData = {
      orderId: orderId || null,
      customerId: user?.uid || 'guest_user',
      customerName: customerName || user?.displayName || 'Anonymous User',
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    }

    // 2. Add the review document
    await setDoc(reviewRef, { id: reviewRef.id, ...reviewData })

    // 3. Mark the Order as reviewed if provided
    if (orderId) {
      try {
        const orderRef = doc(db, paths.orders(), orderId)
        await updateDoc(orderRef, { isReviewed: true })
      } catch (orderErr) {
        console.warn('Failed to mark order as reviewed (Permissions?):', orderErr)
      }
    }

    // 4. Attempt to update the parent Mess document (Aggregates)
    // We wrap this in a separate try-catch so permission errors don't stop the review from being posted
    try {
      await runTransaction(db, async (transaction) => {
        const messDoc = await transaction.get(messRef)
        if (!messDoc.exists()) return // Mess might have been deleted

        const messData = messDoc.data()
        const currentRating = messData.rating || 0
        const currentCount = messData.reviewCount || 0

        // Calculate new moving average
        const newCount = currentCount + 1
        const newTotalScore = (currentRating * currentCount) + rating
        const newRating = Number((newTotalScore / newCount).toFixed(1))

        transaction.update(messRef, {
          rating: newRating,
          reviewCount: newCount
        })
      })
    } catch (aggErr) {
      // Log the error but don't fail the submission
      // Likely "missing or insufficient permissions" because customers can't edit mess profiles
      console.warn('Could not update mess aggregate rating (Expected if not owner):', aggErr.message)
    }

    return { success: true }
  } catch (err) {
    console.error('Failed to submit review:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Fetches recent reviews for a specific mess profile.
 * @param {string} messId - The Mess ID
 * @param {number} maxResults - How many to fetch (default 10)
 */
export async function getMessReviews(messId, maxResults = 10) {
  try {
    const q = query(
      collection(db, paths.messReviews(messId)),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error(`Failed to fetch reviews for mess ${messId}:`, err)
    return []
  }
}

/**
 * Fetches the exact total count of reviews for a mess from the server.
 * Useful for correcting out-of-sync summary fields.
 */
export async function getReviewCount(messId) {
  try {
    const coll = collection(db, paths.messReviews(messId))
    const snapshot = await getCountFromServer(coll)
    return snapshot.data().count
  } catch (err) {
    console.error('Error fetching review count:', err)
    return 0
  }
}
