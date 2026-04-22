import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import CartItem from './CartItem'
import { ROUTES } from '../../constants/routes'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, isOpen, toggleCart, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()
  
  const handleCheckout = () => {
    toggleCart() // close the drawer
    navigate(ROUTES.CHECKOUT)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart} />
      <div className="cart-drawer">
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={toggleCart}>
            <span className="icon">close</span>
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="icon cart-empty-icon">shopping_basket</span>
              <p>Your cart is empty.</p>
              <button className="ui-btn ui-btn-secondary ui-btn-sm" onClick={toggleCart} style={{marginTop: '1rem'}}>
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map(item => <CartItem key={item.id} item={item} />)}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total Amount</span>
              <span className="cart-total-val">₹{totalAmount}</span>
            </div>
            <button 
              className="ui-btn ui-btn-primary cart-checkout-btn" 
              onClick={handleCheckout}
            >
              Proceed to Checkout <span className="icon" style={{fontSize: '18px'}}>arrow_forward</span>
            </button>
            <button className="ui-btn ui-btn-ghost ui-btn-sm cart-clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
