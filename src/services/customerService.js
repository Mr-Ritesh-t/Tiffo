import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import { paths } from './firestorePaths'

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} customerId (User ID)
 * @property {string} name
 * @property {string} avatar
 * @property {string} lastActive
 */

/**
 * Fetch all customers for the current owner's mess
 * Currently returns empty as subscription features have been removed.
 * @returns {Promise<Customer[]>}
 */
export async function getCustomers() {
  return []
}

export async function updateCustomerStatus() {
    return { success: true }
}
