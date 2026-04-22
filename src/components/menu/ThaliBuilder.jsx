import { useState } from 'react'
import { useMenu } from './MenuContext'
import './ThaliBuilder.css'

export default function ThaliBuilder() {
  const { items, thalis, addThali, updateThali, deleteThali } = useMenu()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleAdd = () => {
    if (!newTitle.trim() || !newPrice) return
    addThali({ name: newTitle, price: Number(newPrice), description: newDesc })
    setNewTitle('')
    setNewPrice('')
    setNewDesc('')
    setIsAdding(false)
  }

  return (
    <div className="tb-container">
      <div className="tb-header">
        <h3 className="tb-title">Thali Builder</h3>
        <button className="ui-btn ui-btn-secondary ui-btn-sm" onClick={() => setIsAdding(!isAdding)}>
          <span className="icon">{isAdding ? 'close' : 'add'}</span> 
          {isAdding ? 'Cancel' : 'Create Thali'}
        </button>
      </div>

      {isAdding && (
        <div className="tb-add-form">
          <input 
            type="text" 
            placeholder="Thali Name (e.g., Premium Student Thali)" 
            className="tb-input" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
          />
          <div className="tb-row">
            <input 
              type="text" 
              placeholder="Description (e.g., 2 Sabji, 4 Roti, Dal, Rice)" 
              className="tb-input" 
              style={{ flex: 2 }}
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="Price (₹)" 
              className="tb-input" 
              style={{ flex: 1 }}
              value={newPrice} 
              onChange={e => setNewPrice(e.target.value)} 
            />
          </div>
          <button className="ui-btn ui-btn-primary ui-btn-sm tb-submit" onClick={handleAdd}>Ensure Create</button>
        </div>
      )}

      <div className="tb-list">
        {thalis.length === 0 ? (
          <div className="tb-empty">No Thalis created yet. Start bundling!</div>
        ) : (
          thalis.map(thali => (
            <div key={thali.id} className="tb-item">
              <div className="tb-item-info">
                <div className="tb-item-name">{thali.name} <span className="tb-tag">₹{thali.price}</span></div>
                <div className="tb-item-desc">{thali.description}</div>
              </div>
              <button className="ui-btn ui-btn-ghost ui-btn-sm tb-btn-del" onClick={() => deleteThali(thali.id)}>
                <span className="icon">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
