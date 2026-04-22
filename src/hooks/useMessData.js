import { useState, useEffect } from 'react'
import { getMesses, getMessById } from '../services/messService'

/**
 * useMesses — fetches all messes with optional filters
 * @param {Object} [filters]
 * @returns {{ messes: import('../types').Mess[], loading: boolean, error: string|null, refetch: Function }}
 */
export function useMesses(filters = {}) {
  const [messes, setMesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMesses(filters)
      .then(data => { if (!cancelled) setMesses(data) })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  const refetch = () => {
    setLoading(true)
    getMesses(filters)
      .then(setMesses)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  return { messes, loading, error, refetch }
}

/**
 * useMessById — fetches a single mess by id
 * @param {string} id
 * @returns {{ mess: import('../types').Mess|null, loading: boolean, error: string|null }}
 */
export function useMessById(id) {
  const [mess, setMess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getMessById(id)
      .then(data => { if (!cancelled) setMess(data) })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  return { mess, loading, error }
}
