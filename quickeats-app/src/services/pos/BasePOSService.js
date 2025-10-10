/**
 * Base POS Service
 *
 * Abstract base class for all POS integrations.
 * Provides common interface and helper methods.
 */

import { POS_CONNECTION_STATUS } from '../../types/pos';

class BasePOSService {
  constructor(config) {
    if (new.target === BasePOSService) {
      throw new Error('Cannot instantiate abstract class BasePOSService directly');
    }

    this.config = config;
    this.status = POS_CONNECTION_STATUS.DISCONNECTED;
    this.lastError = null;
  }

  /**
   * Initialize connection to POS system
   * @returns {Promise<boolean>}
   */
  async connect() {
    throw new Error('Method connect() must be implemented by subclass');
  }

  /**
   * Disconnect from POS system
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Method disconnect() must be implemented by subclass');
  }

  /**
   * Test connection to POS system
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    throw new Error('Method testConnection() must be implemented by subclass');
  }

  /**
   * Fetch menu from POS system
   * @returns {Promise<POSMenuItem[]>}
   */
  async fetchMenu() {
    throw new Error('Method fetchMenu() must be implemented by subclass');
  }

  /**
   * Send order to POS system
   * @param {POSOrder} order - Order to send
   * @returns {Promise<{success: boolean, externalId: string, error?: string}>}
   */
  async sendOrder(order) {
    throw new Error('Method sendOrder() must be implemented by subclass');
  }

  /**
   * Get order status from POS system
   * @param {string} externalId - Order ID in POS system
   * @returns {Promise<POSOrderStatus>}
   */
  async getOrderStatus(externalId) {
    throw new Error('Method getOrderStatus() must be implemented by subclass');
  }

  /**
   * Update order in POS system
   * @param {string} externalId - Order ID in POS system
   * @param {Object} updates - Order updates
   * @returns {Promise<boolean>}
   */
  async updateOrder(externalId, updates) {
    throw new Error('Method updateOrder() must be implemented by subclass');
  }

  /**
   * Cancel order in POS system
   * @param {string} externalId - Order ID in POS system
   * @returns {Promise<boolean>}
   */
  async cancelOrder(externalId) {
    throw new Error('Method cancelOrder() must be implemented by subclass');
  }

  /**
   * Get inventory levels from POS
   * @param {string[]} itemIds - Item IDs to check
   * @returns {Promise<Object>} Map of item ID to inventory count
   */
  async getInventory(itemIds) {
    // Optional method - return empty object by default
    return {};
  }

  /**
   * Helper: Set connection status
   * @param {POSConnectionStatus} status
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * Helper: Set last error
   * @param {string} error
   */
  setError(error) {
    this.lastError = error;
    this.status = POS_CONNECTION_STATUS.ERROR;
  }

  /**
   * Helper: Clear error
   */
  clearError() {
    this.lastError = null;
  }

  /**
   * Helper: Make API request with error handling
   * @param {Function} requestFn - Async function that makes the API call
   * @returns {Promise<any>}
   */
  async makeRequest(requestFn) {
    try {
      this.clearError();
      const result = await requestFn();
      return result;
    } catch (error) {
      this.setError(error.message);
      throw error;
    }
  }

  /**
   * Helper: Validate required credentials
   * @param {string[]} requiredFields - Required credential fields
   * @throws {Error} If credentials are missing
   */
  validateCredentials(requiredFields) {
    const missing = requiredFields.filter(
      field => !this.config.credentials[field]
    );

    if (missing.length > 0) {
      throw new Error(`Missing required credentials: ${missing.join(', ')}`);
    }
  }

  /**
   * Helper: Transform internal menu item to POS format
   * @param {Object} item - Internal menu item
   * @returns {Object} POS-formatted item
   */
  transformMenuItemToPOS(item) {
    // Override in subclass for provider-specific formatting
    return item;
  }

  /**
   * Helper: Transform POS menu item to internal format
   * @param {POSMenuItem} posItem - POS menu item
   * @returns {Object} Internal menu item format
   */
  transformMenuItemFromPOS(posItem) {
    return {
      id: posItem.externalId,
      name: posItem.name,
      price: posItem.price,
      description: posItem.description,
      category: posItem.category,
      available: posItem.available,
      image: posItem.imageUrl || '',
      options: this.transformModifierGroups(posItem.modifierGroups || []),
      posExternalId: posItem.externalId,
      inventoryCount: posItem.inventoryCount
    };
  }

  /**
   * Helper: Transform POS modifier groups to internal format
   * @param {POSModifierGroup[]} groups
   * @returns {Array}
   */
  transformModifierGroups(groups) {
    return groups.map((group, index) => ({
      id: index + 1,
      name: group.name,
      type: group.maxSelections === 1 ? 'single' : 'multiple',
      required: group.required,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      choices: group.modifiers.map((mod, modIndex) => ({
        id: modIndex + 1,
        name: mod.name,
        priceModifier: mod.priceModifier,
        available: mod.available,
        posExternalId: mod.externalId
      }))
    }));
  }

  /**
   * Helper: Transform internal order to POS format
   * @param {Object} order - Internal order
   * @returns {POSOrder}
   */
  transformOrderToPOS(order) {
    return {
      orderId: order.id,
      restaurantId: order.restaurantId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderType: order.orderType || 'delivery',
      items: order.items.map(item => ({
        externalId: item.posExternalId || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: this.transformOrderModifiers(item.selectedOptions || []),
        specialInstructions: item.specialInstructions
      })),
      totals: {
        subtotal: order.subtotal,
        tax: order.tax,
        tip: order.tip || 0,
        deliveryFee: order.deliveryFee || 0,
        discount: order.discount || 0,
        total: order.total
      },
      specialInstructions: order.specialInstructions,
      orderTime: new Date(order.orderTime),
      promisedTime: order.promisedTime ? new Date(order.promisedTime) : null
    };
  }

  /**
   * Helper: Transform order modifiers to POS format
   * @param {Array} selectedOptions
   * @returns {POSOrderModifier[]}
   */
  transformOrderModifiers(selectedOptions) {
    const modifiers = [];

    selectedOptions.forEach(option => {
      if (option.choices) {
        option.choices.forEach(choice => {
          modifiers.push({
            externalId: choice.posExternalId || choice.id,
            groupName: option.name,
            name: choice.name,
            priceModifier: choice.priceModifier
          });
        });
      }
    });

    return modifiers;
  }
}

export default BasePOSService;