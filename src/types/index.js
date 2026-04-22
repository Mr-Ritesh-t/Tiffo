/**
 * @typedef {Object} Mess
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {string} cuisine
 * @property {'veg'|'non-veg'|'both'} foodType
 * @property {number} rating
 * @property {number} reviewCount
 * @property {number} pricePerMeal
 * @property {string[]} services
 * @property {string[]} tags
 * @property {boolean} isOpen
 * @property {string} [image]
 */


/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userName
 * @property {string} userInitials
 * @property {string} userColor
 * @property {number} rating
 * @property {string} text
 * @property {string} timeAgo
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'customer'|'owner'} role
 * @property {string} [messId]
 * @property {boolean} isPremium
 */

export {}
