import { useState, useEffect } from 'react'
import { getReviewCount } from '../../services/reviewService'
import { updateMess } from '../../services/messService'

/**
 * A smart UI component that displays a review count, 
 * verifies it against the server, and repairs drifted data silently.
 */
export default function AccurateCountPill({ messId, initialCount, className }) {
  const [count, setCount] = useState(initialCount || 0)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function verifyAndRepair() {
      // Small delay to let the page finish rendering
      await new Promise(r => setTimeout(r, 1000))
      
      const realCount = await getReviewCount(messId)
      
      if (isMounted) {
        setCount(realCount)
        setIsSynced(true)

        // 🛠️ Automatic Repair: If cached data is wrong, fix the database
        if (realCount !== initialCount) {
          console.log(`[Sync] Listing repair for ${messId}: ${initialCount} -> ${realCount}`)
          updateMess(messId, { reviewCount: realCount }).catch(() => {})
        }
      }
    }

    verifyAndRepair()
    return () => { isMounted = false }
  }, [messId, initialCount])

  if (count === 0 && !isSynced) return null

  return (
    <span className={`${className} ${isSynced ? 'synced' : 'predictive'}`}>
      ({count} {count === 1 ? 'review' : 'reviews'})
    </span>
  )
}
