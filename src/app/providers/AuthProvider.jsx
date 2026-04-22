import { createContext, useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../services/firebase'
import * as authService from '../../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase Auth state changes globally
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is logged into Firebase, now fetch their Firestore profile
          const profile = await authService.getUserProfile(firebaseUser.uid)
          setUser(profile)
        } else {
          // User is logged out
          setUser(null)
        }
      } catch (err) {
        console.error("Error fetching user profile during auth state change", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    // We don't need to manually setUser here; onAuthStateChanged will catch it!
    return await authService.login(email, password)
  }, [])

  const signup = useCallback(async (userData) => {
    // onAuthStateChanged will also catch the login after signup
    return await authService.signup(userData)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
  }, [])

  const completeOnboarding = useCallback(async (data) => {
    setLoading(true)
    try {
      const updatedUser = await authService.completeOnboarding(data)
      setUser(updatedUser)
      return updatedUser
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isCustomer: user?.role === 'customer',
    login,
    signup,
    logout,
    completeOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
