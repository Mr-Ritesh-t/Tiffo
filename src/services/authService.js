import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  deleteUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

/**
 * Get full user profile from Firestore by UID
 * @param {string} uid Firebase auth UID
 * @returns {Promise<import('../types').User | null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: uid, ...docSnap.data() }
    }
    return null
  } catch (err) {
    console.error('Error fetching user profile:', err)
    return null
  }
}

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('../types').User>}
 */
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  let profile = await getUserProfile(userCredential.user.uid)
  
  if (!profile) {
    // Fallback: If the user exists in Firebase Auth but was blocked from 
    // creating a Firestore profile (e.g., due to an ad-blocker during signup),
    // we recreate a basic profile here to "heal" the account.
    console.warn('Profile not found in Firestore. Attempting to heal account...')
    const user = userCredential.user
    const newProfile = {
      name: user.displayName || 'Unknown Name',
      email: user.email,
      role: 'customer', // Default to customer if lost, they can update later if needed
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    }
    await setDoc(doc(db, 'users', user.uid), newProfile)
    profile = { id: user.uid, ...newProfile }
  }
  
  return profile
}

/**
 * Sign up with name, email, password, and role
 * @param {{ name: string, email: string, password: string, role: 'customer'|'owner' }} data
 * @returns {Promise<import('../types').User>}
 */
export async function signup({ name, email, password, role }) {
  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // 2. Set display name in Auth
  await updateProfile(user, { displayName: name })

  // 3. Create user profile in Firestore
  const newProfile = {
    name,
    email,
    role,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    ...(role === 'owner' ? { messId: `mess-${user.uid}` } : {})
  }

  await setDoc(doc(db, 'users', user.uid), newProfile)

  return { id: user.uid, ...newProfile }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logout() {
  await signOut(auth)
}

/**
 * Complete onboarding and save additional user details to Firestore
 * @param {Object} data - Additional user profile data
 * @returns {Promise<import('../types').User>}
 */
export async function completeOnboarding(data) {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No active authenticated session')

  const docRef = doc(db, 'users', currentUser.uid)
  
  // Merge new data
  await updateDoc(docRef, {
    ...data,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  })

  // 🚀 CRITICAL FIX: If this is an Owner, we must create their Mess Profile in the `messes` collection
  if (data.messName) {
    const { setDoc } = await import('firebase/firestore')
    const { paths } = await import('./firestorePaths')
    
    const messRef = doc(db, paths.messProfile(currentUser.uid))
    await setDoc(messRef, {
      name: data.messName,
      location: data.messAddress,
      cuisine: data.cuisine || 'Multi-Cuisine',
      foodType: data.diet || 'both', // Use the diet field from onboarding
      contactNumber: data.phone || '', // Store the business phone here
      openingTime: data.openingTime || '08:00',
      closingTime: data.closingTime || '22:00',
      imageUrl: data.imageUrl || '',
      rating: 5.0,
      reviewCount: 0,
      pricePerMeal: data.pricePerMeal || 100,
      services: ['Delivery', 'Takeaway'],
      tags: ['New', 'Fresh'],
      isOpen: true,
      supportsSingleItems: true,
      supportsThali: true,
    }, { merge: true })
  }

  // Return updated profile
  return await getUserProfile(currentUser.uid)
}

/**
 * ☢️ TOTAL ACCOUNT WIPEOUT
 * Deletes the Firestore profile and the Firebase Auth account.
 * Note: Firebase requires a 'recent login' to delete an account.
 */
export async function deleteCurrentUserAccount() {
  const user = auth.currentUser
  if (!user) throw new Error('No user logged in')

  try {
    // 1. Delete Firestore Profile
    await deleteDoc(doc(db, 'users', user.uid))
    
    // 2. Delete Firebase Auth User
    await deleteUser(user)
    
    console.log('Account and profile successfully deleted.')
    return true
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('For security, please logout and log back in before deleting your account.')
    }
    console.error('Error during account deletion:', err)
    throw err
  }
}
