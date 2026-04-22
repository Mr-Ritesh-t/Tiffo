import { createContext, useContext, useState, useEffect } from 'react'
import { 
  getMessMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  addThali, 
  updateThaliProfile, 
  deleteThaliProfile 
} from '../../services/messService'

const MenuContext = createContext()

export function MenuProvider({ children, messId }) {
  const [items, setItems] = useState([])
  const [thalis, setThalis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!messId) return

    const loadMenu = async () => {
      setLoading(true)
      try {
        const data = await getMessMenu(messId)
        setItems(data.items)
        setThalis(data.thalis)
      } catch (err) {
        console.error('Failed to load menu:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [messId])

  // Master Item Bank actions
  const addItem = async (item) => {
    const newItem = await addMenuItem(messId, { ...item, isAvailableToday: true })
    setItems(prev => [...prev, newItem])
  }
  
  const updateItem = async (id, updates) => {
    await updateMenuItem(messId, id, updates)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }
  
  const deleteItem = async (id) => {
    await deleteMenuItem(messId, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }
  
  const toggleAvailability = async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newStatus = !item.isAvailableToday
    await updateMenuItem(messId, id, { isAvailableToday: newStatus })
    setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailableToday: newStatus } : i))
  }

  // Thali actions
  const addNewThali = async (thali) => {
    const newThali = await addThali(messId, { ...thali, isAvailableToday: true })
    setThalis(prev => [...prev, newThali])
  }
  
  const updateThali = async (id, updates) => {
    await updateThaliProfile(messId, id, updates)
    setThalis(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }
  
  const deleteThali = async (id) => {
    await deleteThaliProfile(messId, id)
    setThalis(prev => prev.filter(t => t.id !== id))
  }
  
  const toggleThaliAvailability = async (id) => {
    const thali = thalis.find(t => t.id === id)
    if (!thali) return
    const newStatus = !thali.isAvailableToday
    await updateThaliProfile(messId, id, { isAvailableToday: newStatus })
    setThalis(prev => prev.map(t => t.id === id ? { ...t, isAvailableToday: newStatus } : t))
  }

  // Derived state
  const dailyMenu = items.filter(i => i.isAvailableToday)
  const availableThalis = thalis.filter(t => t.isAvailableToday)

  const value = {
    items,
    thalis,
    dailyMenu,
    availableThalis,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    addThali: addNewThali,
    updateThali,
    deleteThali,
    toggleThaliAvailability
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
