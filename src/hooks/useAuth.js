import { useContext } from 'react'
import { AuthContext } from '../app/providers/AuthProvider'

/**
 * useAuth — returns current user state and auth actions (login, signup, logout)
 * @returns {{ user: import('../types').User|null, loading: boolean, isOwner: boolean, isCustomer: boolean, isAuthenticated: boolean, login: Function, signup: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
