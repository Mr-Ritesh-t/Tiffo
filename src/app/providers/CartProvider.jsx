import { createContext, useState, useEffect } from 'react'

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false) // Toggle cart drawer

  // Derived state
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  // Actions
  const addItem = (newItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id)
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
    setIsOpen(true) // Auto-open cart on add
  }

  const removeItem = (id) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => {
    setItems([])
    setIsOpen(false)
  }

  const toggleCart = () => setIsOpen((prev) => !prev)

  const value = {
    items,
    isOpen,
    totalAmount,
    totalItems,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    toggleCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
