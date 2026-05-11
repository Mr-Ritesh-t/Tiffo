export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  ELITE: 'elite',
}

export const PLAN_DETAILS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    name: 'Free Starter',
    price: 0,
    features: [
      'Basic Mess Listing',
      'Manage Menu (Fixed)',
      'View Orders',
    ],
    lockedFeatures: [
      'Custom Thali Builder',
      'Priority Search Results',
      'Automated WhatsApp Notifications',
    ]
  },
  [SUBSCRIPTION_PLANS.ELITE]: {
    name: 'Elite Management',
    price: 1,
    period: 'month',
    features: [
      'Everything in Free',
      'Custom Thali Builder',
      'Priority Search Results (2x Visibility)',
      'Automated WhatsApp Notifications',
      'Customer Retention Tools',
    ],
    lockedFeatures: []
  }
}
