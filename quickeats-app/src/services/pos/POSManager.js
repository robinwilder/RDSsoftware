/**
 * POS Manager
 *
 * High-level manager for POS operations
 * Handles menu syncing, order submission, and configuration management
 */

import posServiceFactory from './POSServiceFactory';
import { POS_PROVIDERS } from '../../types/pos';

class POSManager {
  constructor() {
    this.syncIntervals = new Map();
  }

  /**
   * Initialize POS integration for a restaurant
   * @param {POSConfig} config
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async initializeRestaurant(config) {
    try {
      const service = posServiceFactory.getService(config);

      if (!service) {
        return { success: false, error: 'Invalid POS configuration' };
      }

      const connected = await service.connect();

      if (!connected) {
        return {
          success: false,
          error: service.lastError || 'Failed to connect to POS'
        };
      }

      // Start auto-sync if enabled
      if (config.settings.autoSyncMenu && config.settings.syncInterval > 0) {
        this.startAutoSync(config.restaurantId, config.settings.syncInterval);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect POS integration for a restaurant
   * @param {string} restaurantId
   */
  async disconnectRestaurant(restaurantId) {
    this.stopAutoSync(restaurantId);
    posServiceFactory.removeService(restaurantId);
  }

  /**
   * Sync menu from POS for a restaurant
   * @param {string} restaurantId
   * @param {POSConfig} config
   * @returns {Promise<POSSyncResult>}
   */
  async syncMenu(restaurantId, config) {
    const startTime = new Date();

    try {
      const service = posServiceFactory.getService(config);

      if (!service) {
        return {
          success: false,
          timestamp: startTime,
          stats: { itemsSynced: 0, itemsAdded: 0, itemsUpdated: 0, itemsRemoved: 0 },
          errors: ['POS service not available']
        };
      }

      // Fetch menu from POS
      const posItems = await service.fetchMenu();

      return {
        success: true,
        timestamp: new Date(),
        items: posItems,
        stats: {
          itemsSynced: posItems.length,
          itemsAdded: posItems.length,
          itemsUpdated: 0,
          itemsRemoved: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        timestamp: new Date(),
        stats: { itemsSynced: 0, itemsAdded: 0, itemsUpdated: 0, itemsRemoved: 0 },
        errors: [error.message]
      };
    }
  }

  /**
   * Send order to POS
   * @param {string} restaurantId
   * @param {POSConfig} config
   * @param {Object} order - Internal order object
   * @returns {Promise<{success: boolean, externalId?: string, error?: string}>}
   */
  async sendOrder(restaurantId, config, order) {
    try {
      if (!config.settings.autoSendOrders) {
        return {
          success: false,
          error: 'Auto-send orders is disabled for this restaurant'
        };
      }

      const service = posServiceFactory.getService(config);

      if (!service) {
        return { success: false, error: 'POS service not available' };
      }

      const result = await service.sendOrder(order);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get order status from POS
   * @param {string} restaurantId
   * @param {POSConfig} config
   * @param {string} externalId
   * @returns {Promise<POSOrderStatus>}
   */
  async getOrderStatus(restaurantId, config, externalId) {
    const service = posServiceFactory.getService(config);

    if (!service) {
      throw new Error('POS service not available');
    }

    return await service.getOrderStatus(externalId);
  }

  /**
   * Cancel order in POS
   * @param {string} restaurantId
   * @param {POSConfig} config
   * @param {string} externalId
   * @returns {Promise<boolean>}
   */
  async cancelOrder(restaurantId, config, externalId) {
    const service = posServiceFactory.getService(config);

    if (!service) {
      throw new Error('POS service not available');
    }

    return await service.cancelOrder(externalId);
  }

  /**
   * Test POS connection
   * @param {POSConfig} config
   * @returns {Promise<boolean>}
   */
  async testConnection(config) {
    try {
      const service = posServiceFactory.createService(config);

      if (!service) {
        return false;
      }

      return await service.testConnection();
    } catch (error) {
      console.error('POS connection test failed:', error);
      return false;
    }
  }

  /**
   * Get inventory levels
   * @param {string} restaurantId
   * @param {POSConfig} config
   * @param {string[]} itemIds
   * @returns {Promise<Object>}
   */
  async getInventory(restaurantId, config, itemIds) {
    const service = posServiceFactory.getService(config);

    if (!service) {
      return {};
    }

    try {
      return await service.getInventory(itemIds);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return {};
    }
  }

  /**
   * Start automatic menu syncing
   * @param {string} restaurantId
   * @param {number} intervalMinutes
   */
  startAutoSync(restaurantId, intervalMinutes) {
    // Clear existing interval if any
    this.stopAutoSync(restaurantId);

    const intervalMs = intervalMinutes * 60 * 1000;

    const intervalId = setInterval(() => {
      console.log(`Auto-syncing menu for restaurant ${restaurantId}`);
      // This would trigger a sync in the parent application
      // The actual sync would be handled by the UI layer
    }, intervalMs);

    this.syncIntervals.set(restaurantId, intervalId);
  }

  /**
   * Stop automatic menu syncing
   * @param {string} restaurantId
   */
  stopAutoSync(restaurantId) {
    const intervalId = this.syncIntervals.get(restaurantId);

    if (intervalId) {
      clearInterval(intervalId);
      this.syncIntervals.delete(restaurantId);
    }
  }

  /**
   * Get supported POS providers
   * @returns {Array<{id: string, name: string, description: string}>}
   */
  getSupportedProviders() {
    return [
      {
        id: POS_PROVIDERS.TOAST,
        name: 'Toast POS',
        description: 'Popular restaurant POS system with comprehensive features',
        docUrl: 'https://doc.toasttab.com/',
        features: ['Menu Sync', 'Order Management', 'Real-time Updates']
      },
      {
        id: POS_PROVIDERS.SQUARE,
        name: 'Square',
        description: 'Versatile POS system with easy setup and inventory management',
        docUrl: 'https://developer.squareup.com/docs',
        features: ['Menu Sync', 'Order Management', 'Inventory Tracking']
      },
      {
        id: POS_PROVIDERS.CLOVER,
        name: 'Clover',
        description: 'Flexible POS system with extensive app marketplace',
        docUrl: 'https://docs.clover.com/',
        features: ['Coming Soon']
      },
      {
        id: POS_PROVIDERS.LIGHTSPEED,
        name: 'Lightspeed',
        description: 'Cloud-based POS for restaurants with advanced reporting',
        docUrl: 'https://developers.lightspeedhq.com/',
        features: ['Coming Soon']
      }
    ];
  }

  /**
   * Validate POS configuration
   * @param {POSConfig} config
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateConfig(config) {
    const errors = [];

    if (!config.provider || config.provider === POS_PROVIDERS.NONE) {
      errors.push('POS provider not selected');
    }

    if (!config.credentials) {
      errors.push('Credentials are required');
    } else {
      // Provider-specific validation
      switch (config.provider) {
        case POS_PROVIDERS.TOAST:
          if (!config.credentials.apiKey) errors.push('Toast API Key is required');
          if (!config.credentials.apiSecret) errors.push('Toast API Secret is required');
          if (!config.credentials.locationId) errors.push('Toast Location ID is required');
          break;

        case POS_PROVIDERS.SQUARE:
          if (!config.credentials.accessToken) errors.push('Square Access Token is required');
          if (!config.credentials.locationId) errors.push('Square Location ID is required');
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const posManager = new POSManager();
export default posManager;