/**
 * WhatsApp Notification Service
 * Handles sending messages to customers via Direct Links or Automated API
 */
export const whatsappService = {
  /**
   * Send an Order Confirmation via Direct Link (wa.me)
   * This is the easiest way to "work" without a paid API key.
   */
  sendOrderConfirmation(customerPhone, orderDetails) {
    if (!customerPhone) return
    
    const message = `*Order Confirmed!* ✅\n\nHello! Your order from *${orderDetails.messName}* has been accepted.\n\n*Details:*\n${orderDetails.items}\n*Total:* ₹${orderDetails.total}\n\nThank you for using Tiffo!`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`
    
    // Open in new tab
    window.open(whatsappUrl, '_blank')
  },

  /**
   * Mock Automated Bulk Menu Update
   * Real automation requires a service like Twilio or Meta WhatsApp Cloud API.
   */
  async sendMenuUpdateAlert(subscribers, menuDetails) {
    console.log(`Simulating bulk WhatsApp send to ${subscribers.length} subscribers...`)
    
    // In a real app, you would:
    // 1. Loop through subscribers
    // 2. Call your Backend API (Node.js)
    // 3. Backend calls Twilio/Meta API
    
    return new Promise(resolve => setTimeout(resolve, 2000))
  }
}
