import { useCart } from '../../hooks/useCart'

export default function CartItem({ item }) {
  const { addItem, removeItem, deleteItem } = useCart()

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4 className="cart-item-name">{item.name}</h4>
        <div className="cart-item-meta">₹{item.price} • {item.category || 'Thali'}</div>
      </div>
      
      <div className="cart-item-actions">
        <div className="cart-qty-ctrl">
          <button className="cart-qty-btn" onClick={() => removeItem(item.id)}>−</button>
          <span className="cart-qty-val">{item.quantity}</span>
          <button className="cart-qty-btn" onClick={() => addItem(item)}>+</button>
        </div>
        <button className="cart-del-btn" onClick={() => deleteItem(item.id)}>
          <span className="icon">delete</span>
        </button>
      </div>
    </div>
  )
}
