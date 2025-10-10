/**
 * POS Configuration Component
 *
 * UI for configuring POS integration for a restaurant
 */

import React, { useState, useEffect } from 'react';
import { Settings, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import posManager from '../../services/pos/POSManager';
import { POS_PROVIDERS } from '../../types/pos';

const POSConfiguration = ({ restaurant, onSave, onClose }) => {
  const [config, setConfig] = useState({
    restaurantId: restaurant.id,
    provider: restaurant.posConfig?.provider || POS_PROVIDERS.NONE,
    enabled: restaurant.posConfig?.enabled || false,
    credentials: restaurant.posConfig?.credentials || {},
    settings: {
      autoSyncMenu: restaurant.posConfig?.settings?.autoSyncMenu ?? true,
      autoSendOrders: restaurant.posConfig?.settings?.autoSendOrders ?? true,
      syncInterval: restaurant.posConfig?.settings?.syncInterval ?? 60,
      syncInventory: restaurant.posConfig?.settings?.syncInventory ?? false,
      updatePrices: restaurant.posConfig?.settings?.updatePrices ?? true,
      excludedCategories: restaurant.posConfig?.settings?.excludedCategories || []
    },
    sandboxMode: restaurant.posConfig?.sandboxMode ?? true
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const providers = posManager.getSupportedProviders();

  const handleProviderChange = (provider) => {
    setConfig({
      ...config,
      provider,
      credentials: {}
    });
    setTestResult(null);
    setErrors([]);
  };

  const handleCredentialChange = (field, value) => {
    setConfig({
      ...config,
      credentials: {
        ...config.credentials,
        [field]: value
      }
    });
    setTestResult(null);
  };

  const handleSettingChange = (field, value) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        [field]: value
      }
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setErrors([]);

    const validation = posManager.validateConfig(config);

    if (!validation.valid) {
      setErrors(validation.errors);
      setTesting(false);
      return;
    }

    const success = await posManager.testConnection(config);

    setTestResult(success);
    setTesting(false);

    if (!success) {
      setErrors(['Failed to connect to POS. Please check your credentials.']);
    }
  };

  const handleSave = () => {
    const validation = posManager.validateConfig(config);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(config);
  };

  const renderCredentialsForm = () => {
    switch (config.provider) {
      case POS_PROVIDERS.TOAST:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={config.credentials.apiKey || ''}
                onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Toast API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Secret</label>
              <input
                type="password"
                value={config.credentials.apiSecret || ''}
                onChange={(e) => handleCredentialChange('apiSecret', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Toast API Secret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location ID</label>
              <input
                type="text"
                value={config.credentials.locationId || ''}
                onChange={(e) => handleCredentialChange('locationId', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Toast Location ID"
              />
            </div>
          </div>
        );

      case POS_PROVIDERS.SQUARE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Access Token</label>
              <input
                type="password"
                value={config.credentials.accessToken || ''}
                onChange={(e) => handleCredentialChange('accessToken', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Square Access Token"
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate from Square Developer Dashboard
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location ID</label>
              <input
                type="text"
                value={config.credentials.locationId || ''}
                onChange={(e) => handleCredentialChange('locationId', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Square Location ID"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Select a POS provider to configure credentials
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">POS Integration</h2>
              <p className="text-sm text-gray-600">{restaurant.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Configuration Errors</h4>
                  <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <h3 className="font-semibold mb-3">Select POS Provider</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    config.provider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    {config.provider === provider.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox Mode Toggle */}
          {config.provider !== POS_PROVIDERS.NONE && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sandboxMode"
                checked={config.sandboxMode}
                onChange={(e) => setConfig({ ...config, sandboxMode: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="sandboxMode" className="text-sm">
                Use Sandbox/Test Mode (recommended for testing)
              </label>
            </div>
          )}

          {/* Credentials */}
          {config.provider !== POS_PROVIDERS.NONE && (
            <div>
              <h3 className="font-semibold mb-3">API Credentials</h3>
              {renderCredentialsForm()}
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
              {testResult !== null && (
                <div
                  className={`mt-3 p-3 rounded flex items-center gap-2 ${
                    testResult
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {testResult ? (
                    <>
                      <Check className="w-5 h-5" />
                      Connection successful!
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      Connection failed
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {config.provider !== POS_PROVIDERS.NONE && (
            <div>
              <h3 className="font-semibold mb-3">Integration Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="enabled" className="text-sm">
                    Enable POS Integration
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSyncMenu"
                    checked={config.settings.autoSyncMenu}
                    onChange={(e) => handleSettingChange('autoSyncMenu', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoSyncMenu" className="text-sm">
                    Automatically sync menu from POS
                  </label>
                </div>

                {config.settings.autoSyncMenu && (
                  <div className="ml-6">
                    <label className="block text-sm mb-1">Sync Interval (minutes)</label>
                    <input
                      type="number"
                      value={config.settings.syncInterval}
                      onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                      min="5"
                      className="w-32 p-2 border rounded"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSendOrders"
                    checked={config.settings.autoSendOrders}
                    onChange={(e) => handleSettingChange('autoSendOrders', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoSendOrders" className="text-sm">
                    Automatically send orders to POS
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="syncInventory"
                    checked={config.settings.syncInventory}
                    onChange={(e) => handleSettingChange('syncInventory', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="syncInventory" className="text-sm">
                    Sync inventory levels
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="updatePrices"
                    checked={config.settings.updatePrices}
                    onChange={(e) => handleSettingChange('updatePrices', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="updatePrices" className="text-sm">
                    Update prices from POS
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSConfiguration;