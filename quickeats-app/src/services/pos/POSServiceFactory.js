/**
 * POS Service Factory
 *
 * Creates and manages POS service instances based on configuration
 */

import ToastPOSService from './ToastPOSService';
import SquarePOSService from './SquarePOSService';
import { POS_PROVIDERS } from '../../types/pos';

class POSServiceFactory {
  constructor() {
    this.services = new Map();
  }

  /**
   * Get or create a POS service instance for a restaurant
   * @param {POSConfig} config - POS configuration
   * @returns {BasePOSService}
   */
  getService(config) {
    if (!config || !config.enabled) {
      return null;
    }

    const key = `${config.restaurantId}-${config.provider}`;

    // Return cached service if available
    if (this.services.has(key)) {
      return this.services.get(key);
    }

    // Create new service instance
    const service = this.createService(config);

    if (service) {
      this.services.set(key, service);
    }

    return service;
  }

  /**
   * Create a new POS service instance
   * @param {POSConfig} config
   * @returns {BasePOSService}
   */
  createService(config) {
    switch (config.provider) {
      case POS_PROVIDERS.TOAST:
        return new ToastPOSService(config);

      case POS_PROVIDERS.SQUARE:
        return new SquarePOSService(config);

      // Add more providers as implemented
      case POS_PROVIDERS.CLOVER:
        console.warn('Clover POS integration not yet implemented');
        return null;

      case POS_PROVIDERS.LIGHTSPEED:
        console.warn('Lightspeed POS integration not yet implemented');
        return null;

      case POS_PROVIDERS.NONE:
      default:
        return null;
    }
  }

  /**
   * Remove a cached service instance
   * @param {string} restaurantId
   */
  removeService(restaurantId) {
    const keysToRemove = [];

    for (const [key] of this.services) {
      if (key.startsWith(`${restaurantId}-`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.services.delete(key));
  }

  /**
   * Clear all cached services
   */
  clearAll() {
    this.services.clear();
  }

  /**
   * Get all active service instances
   * @returns {Array}
   */
  getAllServices() {
    return Array.from(this.services.values());
  }
}

// Export singleton instance
const posServiceFactory = new POSServiceFactory();
export default posServiceFactory;