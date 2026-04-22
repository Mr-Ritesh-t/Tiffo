import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { paths } from '../services/firestorePaths'

export function useCustomerOrders(customerId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!customerId) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    // Listen to orders where customerId matches the logged-in user
    const q = query(
      collection(db, paths.orders()),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setOrders(ordersList)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Error listening to customer orders:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [customerId])

  return { orders, loading, error }
}
