// ─── Mess Service ─────────────────────────────────────────────────────────────
// All mess data access goes through this service, now connected to Firebase Firestore.
import { collection, doc, getDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { db, auth } from './firebase'
import { paths } from './firestorePaths'

/**
 * Calculate distance between two points in km (Haversine Formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d.toFixed(1);
}

/**
 * Get all messes (optionally filtered)
 * @param {{ search?: string, foodType?: string, cuisine?: string }} [filters]
 * @returns {Promise<import('../types').Mess[]>}
 */
export async function getMesses(filters = {}) {
  try {
    const messesRef = collection(db, paths.messes())
    const snapshot = await getDocs(messesRef)
    
    let result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Apply distance calculation if user location is provided
    if (filters.userLat && filters.userLng) {
      result = result.map(m => ({
        ...m,
        distanceVal: calculateDistance(filters.userLat, filters.userLng, m.lat, m.lng)
      }))
      
      // Sort by distance if requested
      if (filters.sortByDistance) {
        result.sort((a, b) => (parseFloat(a.distanceVal) || 999) - (parseFloat(b.distanceVal) || 999))
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.cuisine?.toLowerCase().includes(q)
      )
    }
    
    return result
  } catch (err) {
    console.error('Error fetching messes (Potential Permission Issue):', err)
    return []
  }
}

/**
 * 🧹 Data Wipe Utility (Fresh Start)
 * Deletes all documents in the 'messes' collection.
 * Note: Subcollections like items/thalis are technically orphaned but this cleans the main listing.
 */
export async function wipeAllCurrentData() {
  try {
    const querySnapshot = await getDocs(collection(db, 'messes'));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`Successfully wiped ${querySnapshot.size} messes.`);
    return true;
  } catch (err) {
    console.error("Failed to wipe data:", err);
    throw err;
  }
}

/**
 * ☢️ Deletes a mess and all its subcollections (items, thalis)
 * @param {string} messId 
 */
export async function deleteMessAndSubcollections(messId) {
  try {
    // 1. Get subcollections
    const itemsSnap = await getDocs(collection(db, paths.messItems(messId)))
    const thalisSnap = await getDocs(collection(db, paths.messThalis(messId)))
    
    // 2. Delete subdocs
    const itemDeletes = itemsSnap.docs.map(d => deleteDoc(d.ref))
    const thaliDeletes = thalisSnap.docs.map(d => deleteDoc(d.ref))
    
    await Promise.all([...itemDeletes, ...thaliDeletes])
    
    // 3. Delete main mess profile
    await deleteDoc(doc(db, paths.messProfile(messId)))
    
    console.log(`Successfully deleted mess ${messId} and all associated items/thalis.`)
    return true
  } catch (err) {
    console.error(`Failed to delete mess ${messId}:`, err)
    throw err
  }
}

/**
 * Get a single mess by id
 * @param {string} id
 * @returns {Promise<import('../types').Mess | null>}
 */
export async function getMessById(id) {
  try {
    const docRef = doc(db, paths.messProfile(String(id)))
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    
    return null
  } catch (err) {
    console.error(`Error fetching mess ${id}:`, err)
    return null
  }
}

/**
 * Update a mess profile
 * @param {string} id 
 * @param {Partial<import('../types').Mess>} data 
 * @returns {Promise<import('../types').Mess>}
 */
export async function updateMess(id, data) {
  try {
    const docRef = doc(db, paths.messProfile(id))
    await updateDoc(docRef, data)
    
    // Fetch and return the updated document
    const updatedSnap = await getDoc(docRef)
    return { id: updatedSnap.id, ...updatedSnap.data() }
  } catch (err) {
    console.error(`Error updating mess ${id}:`, err)
    throw err
  }
}


/**
 * Get advanced menu data for a mess (Items & Thalis)
 * @param {string} messId 
 * @returns {Promise<{ items: Array, thalis: Array }>}
 */
export async function getMessMenu(messId) {
  try {
    // 🚀 Performance Upgrade: Fetch Items and Thalis concurrently
    const itemsRef = collection(db, paths.messItems(messId))
    const thalisRef = collection(db, paths.messThalis(messId))

    const [itemsSnap, thalisSnap] = await Promise.all([
      getDocs(itemsRef),
      getDocs(thalisRef)
    ])

    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const thalis = thalisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return { items, thalis }
  } catch (err) {
    console.error(`Error fetching menu for mess ${messId}:`, err)
    return { items: [], thalis: [] }
  }
}

// ─── Menu Management (Items & Thalis) ─────────────────────────────────────────

import { addDoc, deleteDoc } from 'firebase/firestore'

export async function addMenuItem(messId, itemData) {
  const docRef = await addDoc(collection(db, paths.messItems(messId)), itemData)
  return { id: docRef.id, ...itemData }
}

export async function updateMenuItem(messId, itemId, updates) {
  await updateDoc(doc(db, paths.messItems(messId), itemId), updates)
}

export async function deleteMenuItem(messId, itemId) {
  await deleteDoc(doc(db, paths.messItems(messId), itemId))
}

export async function addThali(messId, thaliData) {
  const docRef = await addDoc(collection(db, paths.messThalis(messId)), thaliData)
  return { id: docRef.id, ...thaliData }
}

export async function updateThaliProfile(messId, thaliId, updates) {
  await updateDoc(doc(db, paths.messThalis(messId), thaliId), updates)
}

export async function deleteThaliProfile(messId, thaliId) {
  await deleteDoc(doc(db, paths.messThalis(messId), thaliId))
}

// ─── Cart Management (Stubs) ──────────────────────────────────────────────────
export function getCart() { return JSON.parse(localStorage.getItem('tiffo_cart') || '[]') }
export function clearCart() { localStorage.removeItem('tiffo_cart') }
