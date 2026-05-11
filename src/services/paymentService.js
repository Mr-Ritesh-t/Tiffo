import { upgradeToElite } from './authService'

/**
 * Stripe Payment Integration
 * Handles the redirect to Stripe Checkout or simulated demo payment.
 */
export const paymentService = {
  /**
   * Start Elite Subscription Checkout
   * @param {Object} user - The current logged in user object
   * @param {Function} onFinish - Callback after successful upgrade
   */
  async checkoutElite(user, onFinish) {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please check your connection.")
      return
    }

    const options = {
      key: "rzp_live_ShOFy1ld6WSkJ2", // Your Razorpay LIVE Key ID
      amount: 100, // ₹1 in paise
      currency: "INR",
      name: "Tiffo Elite",
      description: "Business Analytics & WhatsApp Alerts",
      image: "/food.png",
      handler: async function (response) {
        try {
          await upgradeToElite(user.id)
          alert("Success! Your Elite subscription is now active.")
          if (onFinish) onFinish()
        } catch (err) {
          alert("Payment received, but account update failed. Contact support.")
        }
      },
      prefill: {
        name: user.name || "",
        email: user.email || ""
      },
      theme: { color: "#ef4444" }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }
}

