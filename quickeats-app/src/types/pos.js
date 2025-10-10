/**
 * POS Integration Type Definitions
 *
 * Defines the common interfaces and types for POS system integrations
 */

/**
 * Supported POS Systems
 * @typedef {'toast' | 'square' | 'clover' | 'lightspeed' | 'none'} POSProvider
 */

/**
 * POS Connection Status
 * @typedef {'connected' | 'disconnected' | 'syncing' | 'error'} POSConnectionStatus
 */

/**
 * POS Configuration for a restaurant
 * @typedef {Object} POSConfig
 * @property {string} restaurantId - Restaurant ID in our system
 * @property {POSProvider} provider - POS system provider
 * @property {boolean} enabled - Whether POS integration is active
 * @property {Object} credentials - API credentials (encrypted in production)
 * @property {string} [credentials.apiKey] - API key
 * @property {string} [credentials.apiSecret] - API secret
 * @property {string} [credentials.accessToken] - OAuth access token
 * @property {string} [credentials.refreshToken] - OAuth refresh token
 * @property {string} [credentials.merchantId] - Merchant/location ID in POS
 * @property {string} [credentials.locationId] - Location ID in POS
 * @property {Object} settings - Integration settings
 * @property {boolean} settings.autoSyncMenu - Auto sync menu from POS
 * @property {boolean} settings.autoSendOrders - Auto send orders to POS
 * @property {number} settings.syncInterval - Menu sync interval in minutes
 * @property {boolean} settings.syncInventory - Sync inventory levels
 * @property {boolean} settings.updatePrices - Update prices from POS
 * @property {string[]} settings.excludedCategories - Categories to exclude from sync
 * @property {POSConnectionStatus} status - Current connection status
 * @property {Date} lastSync - Last successful sync timestamp
 * @property {string} [error] - Last error message
 */

/**
 * Menu Item from POS
 * @typedef {Object} POSMenuItem
 * @property {string} externalId - ID in the POS system
 * @property {string} name - Item name
 * @property {string} description - Item description
 * @property {number} price - Base price
 * @property {string} category - Category name
 * @property {boolean} available - Whether item is available
 * @property {string} [sku] - SKU code
 * @property {string} [imageUrl] - Image URL
 * @property {POSModifierGroup[]} modifierGroups - Modifier/option groups
 * @property {Object} [nutritionInfo] - Nutrition information
 * @property {number} [inventoryCount] - Current inventory level
 */

/**
 * Modifier Group from POS
 * @typedef {Object} POSModifierGroup
 * @property {string} externalId - ID in the POS system
 * @property {string} name - Group name (e.g., "Size", "Toppings")
 * @property {boolean} required - Whether selection is required
 * @property {number} minSelections - Minimum selections required
 * @property {number} maxSelections - Maximum selections allowed
 * @property {POSModifier[]} modifiers - Available modifiers
 */

/**
 * Individual Modifier from POS
 * @typedef {Object} POSModifier
 * @property {string} externalId - ID in the POS system
 * @property {string} name - Modifier name
 * @property {number} priceModifier - Price adjustment (positive or negative)
 * @property {boolean} available - Whether modifier is available
 */

/**
 * Order to send to POS
 * @typedef {Object} POSOrder
 * @property {string} orderId - Order ID in our system
 * @property {string} externalId - Order ID in POS (after creation)
 * @property {string} restaurantId - Restaurant ID
 * @property {string} customerName - Customer name
 * @property {string} [customerPhone] - Customer phone
 * @property {string} [customerEmail] - Customer email
 * @property {'delivery' | 'pickup' | 'dine_in'} orderType - Order type
 * @property {POSOrderItem[]} items - Order items
 * @property {Object} totals - Order totals
 * @property {number} totals.subtotal - Subtotal
 * @property {number} totals.tax - Tax amount
 * @property {number} totals.tip - Tip amount
 * @property {number} totals.deliveryFee - Delivery fee
 * @property {number} totals.discount - Discount amount
 * @property {number} totals.total - Total amount
 * @property {string} [specialInstructions] - Special instructions
 * @property {Date} orderTime - Order timestamp
 * @property {Date} [promisedTime] - Promised ready/delivery time
 */

/**
 * Order Item for POS
 * @typedef {Object} POSOrderItem
 * @property {string} externalId - Menu item ID in POS
 * @property {string} name - Item name
 * @property {number} quantity - Quantity
 * @property {number} price - Base price
 * @property {POSOrderModifier[]} modifiers - Selected modifiers
 * @property {string} [specialInstructions] - Item-specific instructions
 */

/**
 * Order Modifier for POS
 * @typedef {Object} POSOrderModifier
 * @property {string} externalId - Modifier ID in POS
 * @property {string} groupName - Group name
 * @property {string} name - Modifier name
 * @property {number} priceModifier - Price adjustment
 */

/**
 * POS Order Status Update
 * @typedef {Object} POSOrderStatus
 * @property {string} orderId - Order ID in our system
 * @property {string} externalId - Order ID in POS
 * @property {'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'} status
 * @property {Date} timestamp - Status update timestamp
 * @property {string} [message] - Status message
 * @property {number} [estimatedReadyTime] - Estimated minutes until ready
 */

/**
 * POS Sync Result
 * @typedef {Object} POSSyncResult
 * @property {boolean} success - Whether sync was successful
 * @property {Date} timestamp - Sync timestamp
 * @property {Object} stats - Sync statistics
 * @property {number} stats.itemsSynced - Number of items synced
 * @property {number} stats.itemsAdded - Number of items added
 * @property {number} stats.itemsUpdated - Number of items updated
 * @property {number} stats.itemsRemoved - Number of items removed
 * @property {string[]} [errors] - Any errors encountered
 */

/**
 * POS Webhook Event
 * @typedef {Object} POSWebhookEvent
 * @property {string} provider - POS provider
 * @property {string} eventType - Event type (order.created, menu.updated, etc.)
 * @property {string} restaurantId - Restaurant ID
 * @property {Object} data - Event data
 * @property {Date} timestamp - Event timestamp
 */

export const POS_PROVIDERS = {
  TOAST: 'toast',
  SQUARE: 'square',
  CLOVER: 'clover',
  LIGHTSPEED: 'lightspeed',
  NONE: 'none'
};

export const POS_CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  SYNCING: 'syncing',
  ERROR: 'error'
};

export const POS_ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};