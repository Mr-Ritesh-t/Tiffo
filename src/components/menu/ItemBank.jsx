import { useState } from 'react'
import { useMenu } from './MenuContext'
import './ItemBank.css'

export default function ItemBank() {
  const { items, addItem, updateItem, deleteItem } = useMenu()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Sabji')
  const [newPrice, setNewPrice] = useState('')

  const handleAdd = () => {
    if (!newTitle.trim() || !newPrice) return
    addItem({ 
      name: newTitle, 
      category: newCategory, 
      defaultPrice: Number(newPrice),
      type: 'veg' 
    })
    setNewTitle('')
    setNewPrice('')
    setIsAdding(false)
  }

  return (
    <div className="ib-container">
      <div className="ib-header">
        <h3 className="ib-title">Master Item Bank</h3>
        <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => setIsAdding(!isAdding)}>
          <span className="icon">{isAdding ? 'close' : 'add'}</span> 
          {isAdding ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {isAdding && (
        <div className="ib-add-form">
          <input 
            type="text" 
            placeholder="Item Name (e.g., Paneer Butter Masala)" 
            className="ib-input" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
          />
          <div className="ib-row">
            <select className="ib-select" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option value="Sabji">Sabji</option>
              <option value="Bread">Bread/Roti</option>
              <option value="Rice">Rice</option>
              <option value="Sweet">Sweet</option>
              <option value="Other">Other</option>
            </select>
            <input 
              type="number" 
              placeholder="Price (₹)" 
              className="ib-input" 
              value={newPrice} 
              onChange={e => setNewPrice(e.target.value)} 
            />
          </div>
          <button className="ui-btn ui-btn-primary ui-btn-sm ib-submit" onClick={handleAdd}>Ensure Add</button>
        </div>
      )}

      <div className="ib-list">
        {items.length === 0 ? (
          <div className="ib-empty">No items in your bank. Click Add Item to start!</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="ib-item">
              <div>
                <div className="ib-item-name">{item.name}</div>
                <div className="ib-item-meta">{item.category} • ₹{item.defaultPrice}</div>
              </div>
              <button className="ui-btn ui-btn-ghost ui-btn-sm ib-btn-del" onClick={() => deleteItem(item.id)}>
                <span className="icon">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
