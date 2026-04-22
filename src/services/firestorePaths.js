/**
 * Centralized Firestore Path Utility
 * Prevents string typos and guarantees consistent NoSQL schema references across the app.
 */
export const paths = {
  // Root Collections
  users: () => 'users',
  messes: () => 'messes',
    orders: () => 'orders',

  // Mess Document Profile
  messProfile: (messId) => `messes/${messId}`,

  // Mess Subcollections
  messItems: (messId) => `messes/${messId}/items`,
  messThalis: (messId) => `messes/${messId}/thalis`,
  messReviews: (messId) => `messes/${messId}/reviews`,
};
