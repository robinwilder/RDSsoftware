/**
 * Square POS Integration Service
 *
 * Integrates with Square API for menu sync and order management
 * API Documentation: https://developer.squareup.com/docs
 */

import BasePOSService from './BasePOSService';
import { POS_CONNECTION_STATUS } from '../../types/pos';

class SquarePOSService extends BasePOSService {
  constructor(config) {
    super(config);
    this.baseURL = config.sandboxMode
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
    this.apiVersion = 'v2';
  }

  /**
   * Initialize connection to Square POS
   */
  async connect() {
    try {
      this.validateCredentials(['accessToken', 'locationId']);

      const isConnected = await this.testConnection();

      if (isConnected) {
        this.setStatus(POS_CONNECTION_STATUS.CONNECTED);
        return true;
      } else {
        this.setError('Failed to connect to Square POS');
        return false;
      }
    } catch (error) {
      this.setError(error.message);
      return false;
    }
  }

  /**
   * Disconnect from Square POS
   */
  async disconnect() {
    this.setStatus(POS_CONNECTION_STATUS.DISCONNECTED);
  }

  /**
   * Test connection to Square POS
   */
  async testConnection() {
    return this.makeRequest(async () => {
      const response = await this.apiRequest('/locations', 'GET');
      return response && response.locations && response.locations.length > 0;
    });
  }

  /**
   * Fetch menu from Square POS
   */
  async fetchMenu() {
    return this.makeRequest(async () => {
      this.setStatus(POS_CONNECTION_STATUS.SYNCING);

      // Fetch catalog items
      const catalogResponse = await this.apiRequest('/catalog/list', 'POST', {
        types: ['ITEM', 'MODIFIER_LIST', 'CATEGORY']
      });

      const items = [];
      const modifierLists = {};
      const categories = {};

      // Process catalog objects
      if (catalogResponse.objects) {
        catalogResponse.objects.forEach(obj => {
          if (obj.type === 'MODIFIER_LIST') {
            modifierLists[obj.id] = obj.modifier_list_data;
          } else if (obj.type === 'CATEGORY') {
            categories[obj.id] = obj.category_data;
          }
        });

        // Process items
        catalogResponse.objects
          .filter(obj => obj.type === 'ITEM')
          .forEach(itemObj => {
            const itemData = itemObj.item_data;

            // Get category name
            const categoryId = itemData.category_id;
            const categoryName = categoryId && categories[categoryId]
              ? categories[categoryId].name
              : 'Uncategorized';

            // Skip if category is excluded
            if (this.config.settings.excludedCategories?.includes(categoryName)) {
              return;
            }

            // Process each variation (Square items can have multiple variations)
            if (itemData.variations) {
              itemData.variations.forEach(variation => {
                const variationData = variation.item_variation_data;

                const transformedItem = this.transformSquareItemToInternal(
                  itemObj,
                  variation,
                  categoryName,
                  itemData.modifier_list_info,
                  modifierLists
                );

                items.push(transformedItem);
              });
            }
          });
      }

      // Fetch inventory if enabled
      if (this.config.settings.syncInventory) {
        const inventoryCounts = await this.getInventory(
          items.map(item => item.posExternalId)
        );

        items.forEach(item => {
          if (inventoryCounts[item.posExternalId] !== undefined) {
            item.inventoryCount = inventoryCounts[item.posExternalId];
          }
        });
      }

      this.setStatus(POS_CONNECTION_STATUS.CONNECTED);
      return items;
    });
  }

  /**
   * Send order to Square POS
   */
  async sendOrder(order) {
    return this.makeRequest(async () => {
      const squareOrder = this.transformOrderToSquare(order);

      const response = await this.apiRequest('/orders/create', 'POST', {
        order: squareOrder,
        location_id: this.config.credentials.locationId,
        idempotency_key: `${order.orderId}-${Date.now()}`
      });

      if (response && response.order && response.order.id) {
        return {
          success: true,
          externalId: response.order.id
        };
      } else {
        return {
          success: false,
          error: 'Failed to create order in Square'
        };
      }
    });
  }

  /**
   * Get order status from Square POS
   */
  async getOrderStatus(externalId) {
    return this.makeRequest(async () => {
      const response = await this.apiRequest(`/orders/${externalId}`, 'GET');

      return {
        orderId: response.order.reference_id,
        externalId: response.order.id,
        status: this.mapSquareStatusToInternal(response.order.state),
        timestamp: new Date(response.order.updated_at),
        message: response.order.state
      };
    });
  }

  /**
   * Update order in Square POS
   */
  async updateOrder(externalId, updates) {
    return this.makeRequest(async () => {
      // Get current order version
      const currentOrder = await this.apiRequest(`/orders/${externalId}`, 'GET');

      const response = await this.apiRequest(`/orders/${externalId}`, 'PUT', {
        order: {
          version: currentOrder.order.version,
          ...updates
        }
      });

      return response && response.order;
    });
  }

  /**
   * Cancel order in Square POS
   */
  async cancelOrder(externalId) {
    return this.makeRequest(async () => {
      // Get current order version
      const currentOrder = await this.apiRequest(`/orders/${externalId}`, 'GET');

      const response = await this.apiRequest(`/orders/${externalId}`, 'PUT', {
        order: {
          version: currentOrder.order.version,
          state: 'CANCELED'
        }
      });

      return response && response.order;
    });
  }

  /**
   * Get inventory levels from Square
   */
  async getInventory(itemIds) {
    return this.makeRequest(async () => {
      const response = await this.apiRequest('/inventory/counts/batch-retrieve', 'POST', {
        catalog_object_ids: itemIds,
        location_ids: [this.config.credentials.locationId]
      });

      const inventory = {};

      if (response.counts) {
        response.counts.forEach(count => {
          const quantity = parseFloat(count.quantity || '0');
          inventory[count.catalog_object_id] = quantity;
        });
      }

      return inventory;
    });
  }

  /**
   * Make API request to Square
   * @private
   */
  async apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseURL}/${this.apiVersion}${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${this.config.credentials.accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-10-17'
    };

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Square API Error: ${response.status} - ${JSON.stringify(errorData.errors || errorData)}`
      );
    }

    return await response.json();
  }

  /**
   * Transform Square catalog item to internal format
   * @private
   */
  transformSquareItemToInternal(itemObj, variation, categoryName, modifierListInfo, modifierLists) {
    const itemData = itemObj.item_data;
    const variationData = variation.item_variation_data;

    // Build modifier groups
    const modifierGroups = [];

    if (modifierListInfo) {
      modifierListInfo.forEach((listInfo, index) => {
        const modList = modifierLists[listInfo.modifier_list_id];

        if (modList && modList.modifiers) {
          modifierGroups.push({
            externalId: listInfo.modifier_list_id,
            name: modList.name,
            required: listInfo.min_selected_modifiers > 0,
            minSelections: listInfo.min_selected_modifiers || 0,
            maxSelections: listInfo.max_selected_modifiers || modList.modifiers.length,
            modifiers: modList.modifiers.map(modifier => {
              const modData = modifier.modifier_data;
              return {
                externalId: modifier.id,
                name: modData.name,
                priceModifier: modData.price_money
                  ? modData.price_money.amount / 100
                  : 0,
                available: !modifier.absent_at_location_ids?.includes(
                  this.config.credentials.locationId
                )
              };
            })
          });
        }
      });
    }

    // Get price
    const price = variationData.price_money
      ? variationData.price_money.amount / 100
      : 0;

    // Build item name (include variation name if multiple variations)
    const itemName = itemData.variations && itemData.variations.length > 1
      ? `${itemData.name} - ${variationData.name}`
      : itemData.name;

    return this.transformMenuItemFromPOS({
      externalId: variation.id,
      name: itemName,
      description: itemData.description || '',
      price: price,
      category: categoryName,
      available: !itemData.is_archived &&
                 !variation.absent_at_location_ids?.includes(this.config.credentials.locationId),
      sku: variationData.sku,
      imageUrl: itemData.image_ids?.[0]
        ? `https://square-catalog-images.s3.amazonaws.com/${itemData.image_ids[0]}`
        : null,
      modifierGroups: modifierGroups
    });
  }

  /**
   * Transform internal order to Square format
   * @private
   */
  transformOrderToSquare(order) {
    const posOrder = this.transformOrderToPOS(order);

    return {
      reference_id: posOrder.orderId,
      location_id: this.config.credentials.locationId,
      source: {
        name: 'RDSware'
      },
      line_items: posOrder.items.map(item => ({
        catalog_object_id: item.externalId,
        quantity: item.quantity.toString(),
        modifiers: item.modifiers.map(mod => ({
          catalog_object_id: mod.externalId,
          name: mod.name,
          base_price_money: {
            amount: Math.round(mod.priceModifier * 100),
            currency: 'USD'
          }
        })),
        note: item.specialInstructions
      })),
      taxes: posOrder.totals.tax > 0 ? [
        {
          name: 'Sales Tax',
          percentage: (this.config.taxRate * 100).toString(),
          scope: 'ORDER'
        }
      ] : [],
      service_charges: posOrder.totals.deliveryFee > 0 ? [
        {
          name: 'Delivery Fee',
          amount_money: {
            amount: Math.round(posOrder.totals.deliveryFee * 100),
            currency: 'USD'
          }
        }
      ] : [],
      discounts: posOrder.totals.discount > 0 ? [
        {
          name: 'Discount',
          amount_money: {
            amount: Math.round(posOrder.totals.discount * 100),
            currency: 'USD'
          }
        }
      ] : [],
      metadata: {
        order_type: posOrder.orderType,
        customer_name: posOrder.customerName,
        customer_phone: posOrder.customerPhone || '',
        special_instructions: posOrder.specialInstructions || ''
      }
    };
  }

  /**
   * Map Square order status to internal status
   * @private
   */
  mapSquareStatusToInternal(squareState) {
    const statusMap = {
      'PROPOSED': 'pending',
      'RESERVED': 'pending',
      'PREPARED': 'preparing',
      'COMPLETED': 'completed',
      'CANCELED': 'cancelled',
      'DRAFT': 'pending'
    };

    return statusMap[squareState] || 'pending';
  }
}

export default SquarePOSService;