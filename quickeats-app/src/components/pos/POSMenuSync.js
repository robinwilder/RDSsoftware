/**
 * POS Menu Sync Component
 *
 * UI for syncing menu from POS and managing menu items
 */

import React, { useState } from 'react';
import { RefreshCw, Download, Check, AlertCircle, Package } from 'lucide-react';
import posManager from '../../services/pos/POSManager';

const POSMenuSync = ({ restaurant, posConfig, onMenuSynced }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncedItems, setSyncedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const result = await posManager.syncMenu(restaurant.id, posConfig);

      setSyncResult(result);

      if (result.success && result.items) {
        setSyncedItems(result.items);
        // Select all items by default
        setSelectedItems(new Set(result.items.map(item => item.id)));
      }
    } catch (error) {
      setSyncResult({
        success: false,
        timestamp: new Date(),
        stats: { itemsSynced: 0, itemsAdded: 0, itemsUpdated: 0, itemsRemoved: 0 },
        errors: [error.message]
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleItemToggle = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(syncedItems.map(item => item.id)));
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleImport = () => {
    const itemsToImport = syncedItems.filter(item => selectedItems.has(item.id));
    onMenuSynced(itemsToImport);
  };

  const groupedItems = syncedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Sync Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-semibold">Sync Menu from POS</h3>
          <p className="text-sm text-gray-600">
            Import menu items from {posConfig.provider} POS
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div
          className={`p-4 rounded-lg ${
            syncResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {syncResult.success ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
              </h4>
              {syncResult.success ? (
                <div className="text-sm text-green-700 mt-1">
                  <p>Found {syncResult.stats.itemsSynced} items</p>
                  <p className="text-xs text-gray-600">
                    Synced at {syncResult.timestamp.toLocaleString()}
                  </p>
                </div>
              ) : (
                <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                  {syncResult.errors?.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Synced Items */}
      {syncedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              Select Items to Import ({selectedItems.size} of {syncedItems.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="border-b last:border-b-0">
                  <div className="bg-gray-50 px-4 py-2 font-medium text-sm border-b">
                    {category} ({items.length})
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemToggle(item.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedItems.has(item.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{item.name}</h5>
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                            {item.options && item.options.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.options.length} option group(s)
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${item.price.toFixed(2)}</p>
                            {item.inventoryCount !== undefined && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                <Package className="w-3 h-3" />
                                {item.inventoryCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              disabled={selectedItems.size === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              <Download className="w-4 h-4" />
              Import {selectedItems.size} Item(s)
            </button>
          </div>
        </div>
      )}

      {/* No Items */}
      {syncResult && syncResult.success && syncedItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No items found in POS system</p>
        </div>
      )}
    </div>
  );
};

export default POSMenuSync;