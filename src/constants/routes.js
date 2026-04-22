export const ROUTES = {
  // Public Routes
  HOME: '/',
  MESSES: '/messes',
  MESS_DETAILS: (id) => `/mess/${id}`,
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  
  // Customer Routes
  CUSTOMER_ORDERS: '/orders',

  // Owner Routes
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_MANAGE_MESS: '/owner/manage-mess',
  OWNER_REGISTER: '/owner/register',
};
