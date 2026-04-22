import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from './firebase'
import { paths } from './firestorePaths'

/**
 * Submits a new A-la-carte or Thali order to the database
 * @param {Array} items - The items from the CartProvider
 * @param {number} totalAmount - The total cost
 * @param {string} deliveryAddress - Where to deliver
 * @param {string} customerPhone - Contact number for the order
 */
export async function placeOrder(items, totalAmount, deliveryAddress, customerPhone) {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('You must be logged in to place an order.')
    }

    if (!items || items.length === 0) {
      throw new Error('Cart is empty.')
    }

    // Assuming all items in the cart are from the same mess (which is standard)
    // In a complex app, we might split the cart into multiple orders by messId
    const firstItem = items[0]
    const messId = firstItem.messId
    const ownerId = firstItem.ownerId || firstItem.messId // Fallback if ownerId isn't perfectly mapped

    const orderData = {
      customerId: user.uid,
      customerName: user.displayName || 'Guest Customer',
      customerPhone: customerPhone || '',
      deliveryAddress: deliveryAddress || '',
      messId,
      ownerId,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || i.defaultPrice,
        quantity: i.quantity,
        isThali: i.isThali || false
      })),
      total: totalAmount,
      status: 'Pending', // pending -> accepted -> preparing -> delivered
      createdAt: new Date().toISOString() // Using ISO string for easier sorting/parsing in MVP
    }

    const docRef = await addDoc(collection(db, paths.orders()), orderData)
    return { success: true, orderId: docRef.id }
  } catch (err) {
    console.error('Failed to place order:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Updates the status of an existing order.
 * @param {string} orderId - Document ID in the orders collection
 * @param {string} newStatus - 'Accepted', 'Preparing', 'Delivered', etc.
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const orderRef = doc(db, paths.orders(), orderId)
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (err) {
    console.error(`Failed to update order ${orderId} to ${newStatus}:`, err)
    return { success: false, error: err.message }
  }
}

/**
 * Fetches all orders for a specific user.
 * @param {string} userId
 */
export async function getOrdersByUserId(userId) {
  try {
    const ordersRef = collection(db, paths.orders())
    const q = query(ordersRef, where('customerId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error(`Failed to fetch orders for user ${userId}:`, err)
    return []
  }
}

import { query, where, getDocs, orderBy } from 'firebase/firestore'
