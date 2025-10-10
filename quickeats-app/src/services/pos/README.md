# POS Integration System

A comprehensive POS (Point of Sale) integration system for QuickEats that supports multiple POS providers including Toast, Square, Clover, and Lightspeed.

## Features

- **Multi-Provider Support**: Integrates with Toast, Square, and more
- **Menu Synchronization**: Automatically sync menu items, prices, and modifiers from POS
- **Order Management**: Send orders directly to POS systems
- **Order Status Tracking**: Real-time order status updates
- **Inventory Sync**: Track inventory levels (provider-dependent)
- **Flexible Configuration**: Per-restaurant POS settings and credentials

## Architecture

### Core Components

1. **BasePOSService** (`BasePOSService.js`)
   - Abstract base class for all POS integrations
   - Provides common interface and helper methods
   - Handles data transformation between internal and POS formats

2. **Provider Services**
   - **ToastPOSService** (`ToastPOSService.js`) - Toast POS integration
   - **SquarePOSService** (`SquarePOSService.js`) - Square POS integration
   - More providers can be added by extending BasePOSService

3. **POSServiceFactory** (`POSServiceFactory.js`)
   - Creates and manages POS service instances
   - Caches service instances per restaurant
   - Routes to appropriate provider implementation

4. **POSManager** (`POSManager.js`)
   - High-level manager for POS operations
   - Handles initialization, menu syncing, and order submission
   - Manages auto-sync intervals

### UI Components

1. **POSConfiguration** (`components/pos/POSConfiguration.js`)
   - UI for configuring POS integration
   - Provider selection and credential management
   - Settings configuration

2. **POSMenuSync** (`components/pos/POSMenuSync.js`)
   - UI for syncing menu from POS
   - Item selection and import functionality
   - Category grouping and filtering

3. **POSOrderManager** (`components/pos/POSOrderManager.js`)
   - UI for sending orders to POS
   - Order status tracking
   - Order cancellation

## Usage

### Setting Up POS Integration

```javascript
import posManager from './services/pos/POSManager';
import { POS_PROVIDERS } from './types/pos';

// Configure POS for a restaurant
const posConfig = {
  restaurantId: 'restaurant-123',
  provider: POS_PROVIDERS.TOAST,
  enabled: true,
  credentials: {
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret',
    locationId: 'location-id'
  },
  settings: {
    autoSyncMenu: true,
    autoSendOrders: true,
    syncInterval: 60, // minutes
    syncInventory: false,
    updatePrices: true,
    excludedCategories: []
  },
  sandboxMode: true // Use test environment
};

// Initialize the integration
const result = await posManager.initializeRestaurant(posConfig);
if (result.success) {
  console.log('POS integration initialized');
}
```

### Syncing Menu

```javascript
// Sync menu from POS
const syncResult = await posManager.syncMenu('restaurant-123', posConfig);

if (syncResult.success) {
  console.log(`Synced ${syncResult.stats.itemsSynced} items`);

  // Use the synced items
  syncResult.items.forEach(item => {
    console.log(`${item.name} - $${item.price}`);
  });
}
```

### Sending Orders

```javascript
// Send order to POS
const order = {
  id: 'order-456',
  restaurantId: 'restaurant-123',
  customerName: 'John Doe',
  customerPhone: '555-1234',
  orderType: 'delivery',
  items: [
    {
      id: 'item-1',
      posExternalId: 'pos-item-id',
      name: 'Margherita Pizza',
      quantity: 1,
      price: 16.99,
      selectedOptions: []
    }
  ],
  subtotal: 16.99,
  tax: 1.36,
  deliveryFee: 2.99,
  total: 21.34,
  orderTime: new Date()
};

const result = await posManager.sendOrder('restaurant-123', posConfig, order);

if (result.success) {
  console.log(`Order sent! POS Order ID: ${result.externalId}`);

  // Check order status
  const status = await posManager.getOrderStatus(
    'restaurant-123',
    posConfig,
    result.externalId
  );
  console.log(`Order status: ${status.status}`);
}
```

### Using UI Components

```javascript
import POSConfiguration from './components/pos/POSConfiguration';
import POSMenuSync from './components/pos/POSMenuSync';
import POSOrderManager from './components/pos/POSOrderManager';

// In your restaurant management UI
function RestaurantSettings({ restaurant }) {
  const [showPOSConfig, setShowPOSConfig] = useState(false);

  const handleSaveConfig = (config) => {
    // Save configuration to your restaurant data
    updateRestaurant(restaurant.id, { posConfig: config });
    setShowPOSConfig(false);
  };

  return (
    <div>
      <button onClick={() => setShowPOSConfig(true)}>
        Configure POS
      </button>

      {showPOSConfig && (
        <POSConfiguration
          restaurant={restaurant}
          onSave={handleSaveConfig}
          onClose={() => setShowPOSConfig(false)}
        />
      )}
    </div>
  );
}

// Menu sync UI
function MenuManagement({ restaurant }) {
  const handleMenuSynced = (items) => {
    // Add synced items to restaurant menu
    const updatedMenu = [...restaurant.menu, ...items];
    updateRestaurant(restaurant.id, { menu: updatedMenu });
  };

  return (
    <POSMenuSync
      restaurant={restaurant}
      posConfig={restaurant.posConfig}
      onMenuSynced={handleMenuSynced}
    />
  );
}

// Order management UI
function OrderDetails({ order, restaurant }) {
  return (
    <POSOrderManager
      order={order}
      restaurant={restaurant}
      posConfig={restaurant.posConfig}
    />
  );
}
```

## Adding a New POS Provider

To add support for a new POS provider:

1. Create a new service class extending `BasePOSService`:

```javascript
import BasePOSService from './BasePOSService';
import { POS_CONNECTION_STATUS } from '../../types/pos';

class NewPOSService extends BasePOSService {
  constructor(config) {
    super(config);
    this.baseURL = 'https://api.newpos.com';
  }

  async connect() {
    // Implement connection logic
  }

  async fetchMenu() {
    // Implement menu fetching
  }

  async sendOrder(order) {
    // Implement order submission
  }

  // Implement other required methods...
}

export default NewPOSService;
```

2. Add the provider to `types/pos.js`:

```javascript
export const POS_PROVIDERS = {
  // ... existing providers
  NEW_POS: 'new_pos'
};
```

3. Register in `POSServiceFactory.js`:

```javascript
case POS_PROVIDERS.NEW_POS:
  return new NewPOSService(config);
```

4. Add provider info to `POSManager.getSupportedProviders()`.

## API Reference

### POSManager Methods

- `initializeRestaurant(config)` - Initialize POS integration
- `disconnectRestaurant(restaurantId)` - Disconnect POS integration
- `syncMenu(restaurantId, config)` - Sync menu from POS
- `sendOrder(restaurantId, config, order)` - Send order to POS
- `getOrderStatus(restaurantId, config, externalId)` - Get order status
- `cancelOrder(restaurantId, config, externalId)` - Cancel order in POS
- `testConnection(config)` - Test POS connection
- `getInventory(restaurantId, config, itemIds)` - Get inventory levels
- `getSupportedProviders()` - Get list of supported providers
- `validateConfig(config)` - Validate POS configuration

### BasePOSService Methods (to implement)

Required methods:
- `connect()` - Initialize connection
- `disconnect()` - Disconnect
- `testConnection()` - Test connection
- `fetchMenu()` - Fetch menu items
- `sendOrder(order)` - Send order
- `getOrderStatus(externalId)` - Get order status
- `updateOrder(externalId, updates)` - Update order
- `cancelOrder(externalId)` - Cancel order

Optional methods:
- `getInventory(itemIds)` - Get inventory levels

## Provider-Specific Notes

### Toast POS

- Requires API Key, API Secret, and Location ID
- Supports menu sync with modifier groups
- Sandbox mode available for testing
- Real-time order status requires webhooks (not implemented in base version)

**Getting Credentials:**
1. Log in to Toast Developer Portal
2. Create an integration application
3. Generate API credentials
4. Note your Restaurant GUID (Location ID)

### Square

- Requires Access Token and Location ID
- Excellent inventory management support
- Supports variations (size, color, etc.)
- Square Developer Dashboard for credential management

**Getting Credentials:**
1. Log in to Square Developer Dashboard
2. Create an application
3. Generate Personal Access Token or use OAuth
4. Get Location ID from Locations API

## Security Considerations

- **Never commit credentials**: Store credentials securely in environment variables or encrypted storage
- **Use sandbox mode**: Always test with sandbox/test environments first
- **Validate inputs**: Always validate configuration and order data
- **Handle errors gracefully**: POS APIs can be unreliable, implement retry logic
- **Secure webhook endpoints**: If implementing webhooks, verify signatures

## Troubleshooting

### Connection Issues

- Verify credentials are correct
- Check if sandbox/production mode matches credentials
- Ensure network access to POS API endpoints
- Check rate limits and API quotas

### Menu Sync Issues

- Verify location ID is correct
- Check excluded categories setting
- Ensure menu exists in POS
- Review POS-specific menu structure requirements

### Order Submission Issues

- Verify item IDs match POS catalog
- Check order format matches POS requirements
- Ensure required fields are populated
- Review POS order validation rules

## Future Enhancements

- [ ] Webhook support for real-time updates
- [ ] Batch order submission
- [ ] Advanced inventory management
- [ ] Customer loyalty integration
- [ ] Payment processing integration
- [ ] Analytics and reporting
- [ ] Multi-location support
- [ ] Menu conflict resolution

## Support

For issues or questions:
- Check provider API documentation
- Review error messages in browser console
- Enable sandbox mode for testing
- Contact POS provider support for API issues