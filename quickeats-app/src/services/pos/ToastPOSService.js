/**
 * Toast POS Integration Service
 *
 * Integrates with Toast POS API for menu sync and order management
 * API Documentation: https://doc.toasttab.com/
 */

import BasePOSService from './BasePOSService';
import { POS_CONNECTION_STATUS } from '../../types/pos';

class ToastPOSService extends BasePOSService {
  constructor(config) {
    super(config);
    this.baseURL = config.sandboxMode
      ? 'https://ws-sandbox-api.eng.toasttab.com'
      : 'https://ws-api.toasttab.com';
    this.apiVersion = 'v2';
  }

  /**
   * Initialize connection to Toast POS
   */
  async connect() {
    try {
      this.validateCredentials(['apiKey', 'apiSecret', 'locationId']);

      const isConnected = await this.testConnection();

      if (isConnected) {
        this.setStatus(POS_CONNECTION_STATUS.CONNECTED);
        return true;
      } else {
        this.setError('Failed to connect to Toast POS');
        return false;
      }
    } catch (error) {
      this.setError(error.message);
      return false;
    }
  }

  /**
   * Disconnect from Toast POS
   */
  async disconnect() {
    this.setStatus(POS_CONNECTION_STATUS.DISCONNECTED);
  }

  /**
   * Test connection to Toast POS
   */
  async testConnection() {
    return this.makeRequest(async () => {
      const response = await this.apiRequest('/restaurants', 'GET');
      return response.ok;
    });
  }

  /**
   * Fetch menu from Toast POS
   */
  async fetchMenu() {
    return this.makeRequest(async () => {
      this.setStatus(POS_CONNECTION_STATUS.SYNCING);

      // Fetch menu groups (categories)
      const menuGroups = await this.apiRequest(
        `/restaurants/${this.config.credentials.locationId}/menus`,
        'GET'
      );

      const allItems = [];

      // Fetch items for each menu group
      for (const menu of menuGroups) {
        const menuDetails = await this.apiRequest(
          `/restaurants/${this.config.credentials.locationId}/menus/${menu.guid}`,
          'GET'
        );

        if (menuDetails.groups) {
          for (const group of menuDetails.groups) {
            if (group.items) {
              for (const item of group.items) {
                // Skip if category is excluded
                if (this.config.settings.excludedCategories?.includes(group.name)) {
                  continue;
                }

                const transformedItem = this.transformToastItemToInternal(
                  item,
                  group.name
                );
                allItems.push(transformedItem);
              }
            }
          }
        }
      }

      this.setStatus(POS_CONNECTION_STATUS.CONNECTED);
      return allItems;
    });
  }

  /**
   * Send order to Toast POS
   */
  async sendOrder(order) {
    return this.makeRequest(async () => {
      const toastOrder = this.transformOrderToToast(order);

      const response = await this.apiRequest(
        `/restaurants/${this.config.credentials.locationId}/orders`,
        'POST',
        toastOrder
      );

      if (response && response.guid) {
        return {
          success: true,
          externalId: response.guid
        };
      } else {
        return {
          success: false,
          error: 'Failed to create order in Toast'
        };
      }
    });
  }

  /**
   * Get order status from Toast POS
   */
  async getOrderStatus(externalId) {
    return this.makeRequest(async () => {
      const response = await this.apiRequest(
        `/restaurants/${this.config.credentials.locationId}/orders/${externalId}`,
        'GET'
      );

      return {
        orderId: response.entityType === 'Order' ? response.guid : null,
        externalId: response.guid,
        status: this.mapToastStatusToInternal(response.voidInfo),
        timestamp: new Date(response.modifiedDate || response.openedDate),
        estimatedReadyTime: response.promisedDate
          ? Math.round((new Date(response.promisedDate) - new Date()) / 60000)
          : null
      };
    });
  }

  /**
   * Update order in Toast POS
   */
  async updateOrder(externalId, updates) {
    return this.makeRequest(async () => {
      const response = await this.apiRequest(
        `/restaurants/${this.config.credentials.locationId}/orders/${externalId}`,
        'PATCH',
        updates
      );

      return response.ok;
    });
  }

  /**
   * Cancel order in Toast POS
   */
  async cancelOrder(externalId) {
    return this.makeRequest(async () => {
      const response = await this.apiRequest(
        `/restaurants/${this.config.credentials.locationId}/orders/${externalId}/void`,
        'POST',
        {
          voidReason: 'Customer requested cancellation'
        }
      );

      return response.ok;
    });
  }

  /**
   * Get inventory levels from Toast
   */
  async getInventory(itemIds) {
    return this.makeRequest(async () => {
      // Toast doesn't have a direct inventory API in the standard version
      // This would need to be implemented based on your Toast subscription level
      console.warn('Toast inventory sync requires additional API access');
      return {};
    });
  }

  /**
   * Make API request to Toast
   * @private
   */
  async apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}/${this.apiVersion}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${this.config.credentials.apiKey}`,
      'Toast-Restaurant-External-ID': this.config.credentials.locationId,
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Toast API Error: ${response.status} - ${errorText}`);
    }

    if (response.status === 204) {
      return { ok: true };
    }

    return await response.json();
  }

  /**
   * Transform Toast menu item to internal format
   * @private
   */
  transformToastItemToInternal(toastItem, categoryName) {
    const modifierGroups = [];

    if (toastItem.optionGroups) {
      toastItem.optionGroups.forEach((optionGroup, index) => {
        modifierGroups.push({
          externalId: optionGroup.guid,
          name: optionGroup.name,
          required: optionGroup.minSelections > 0,
          minSelections: optionGroup.minSelections || 0,
          maxSelections: optionGroup.maxSelections || 1,
          modifiers: (optionGroup.options || []).map(option => ({
            externalId: option.guid,
            name: option.name,
            priceModifier: option.price || 0,
            available: !option.outOfStock
          }))
        });
      });
    }

    return this.transformMenuItemFromPOS({
      externalId: toastItem.guid,
      name: toastItem.name,
      description: toastItem.description || '',
      price: toastItem.price || 0,
      category: categoryName,
      available: !toastItem.outOfStock,
      sku: toastItem.sku,
      imageUrl: toastItem.imageUrl,
      modifierGroups: modifierGroups
    });
  }

  /**
   * Transform internal order to Toast format
   * @private
   */
  transformOrderToToast(order) {
    const posOrder = this.transformOrderToPOS(order);

    return {
      entityType: 'Order',
      restaurantGuid: this.config.credentials.locationId,
      source: 'RDSware',
      businessDate: new Date().toISOString().split('T')[0],
      checks: [
        {
          entityType: 'Check',
          displayNumber: posOrder.orderId,
          selections: posOrder.items.map(item => ({
            entityType: 'Selection',
            itemGuid: item.externalId,
            quantity: item.quantity,
            preModifier: item.specialInstructions,
            modifiers: item.modifiers.map(mod => ({
              entityType: 'Modifier',
              optionGuid: mod.externalId,
              name: mod.name
            }))
          })),
          customer: {
            firstName: posOrder.customerName.split(' ')[0] || '',
            lastName: posOrder.customerName.split(' ').slice(1).join(' ') || '',
            phone: posOrder.customerPhone,
            email: posOrder.customerEmail
          }
        }
      ],
      deliveryInfo: posOrder.orderType === 'delivery' ? {
        address: order.deliveryAddress || '',
        deliveryFee: posOrder.totals.deliveryFee
      } : null,
      note: posOrder.specialInstructions,
      promisedDate: posOrder.promisedTime?.toISOString()
    };
  }

  /**
   * Map Toast order status to internal status
   * @private
   */
  mapToastStatusToInternal(voidInfo) {
    if (voidInfo) {
      return 'cancelled';
    }
    // Toast doesn't provide detailed status, would need webhooks for real-time updates
    return 'confirmed';
  }
}

export default ToastPOSService;