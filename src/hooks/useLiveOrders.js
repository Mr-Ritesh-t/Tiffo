import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { paths } from '../services/firestorePaths'

/**
 * Hook to fetch today's live orders for the logged-in owner using Firestore onSnapshot.
 */
export function useLiveOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Listen for all orders directed to this owner
    // In a massive prod app, we'd add `where('createdAt', '>=', startOfDay)`
    const ordersRef = collection(db, paths.orders())
    const q = query(
      ordersRef, 
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrders(liveOrders)
      setLoading(false)
    }, (err) => {
      console.error('Live Orders listener error:', err)
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { orders, loading, error }
}
