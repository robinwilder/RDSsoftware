/**
 * POS Order Manager Component
 *
 * UI for managing order submission to POS and viewing order status
 */

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import posManager from '../../services/pos/POSManager';

const POSOrderManager = ({ order, restaurant, posConfig }) => {
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [posOrderStatus, setPosOrderStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // If order already has a POS external ID, fetch its status
    if (order.posExternalId && posConfig?.enabled) {
      checkOrderStatus();
    }
  }, [order.posExternalId]);

  const handleSendOrder = async () => {
    setSending(true);
    setSendResult(null);

    try {
      const result = await posManager.sendOrder(
        restaurant.id,
        posConfig,
        {
          ...order,
          restaurantId: restaurant.id
        }
      );

      setSendResult(result);

      if (result.success) {
        // Update order with external ID in parent component
        if (order.onPOSOrderCreated) {
          order.onPOSOrderCreated(result.externalId);
        }

        // Fetch status after creation
        setTimeout(() => {
          checkOrderStatus(result.externalId);
        }, 1000);
      }
    } catch (error) {
      setSendResult({
        success: false,
        error: error.message
      });
    } finally {
      setSending(false);
    }
  };

  const checkOrderStatus = async (externalId = null) => {
    const orderExternalId = externalId || order.posExternalId;

    if (!orderExternalId) return;

    setCheckingStatus(true);

    try {
      const status = await posManager.getOrderStatus(
        restaurant.id,
        posConfig,
        orderExternalId
      );

      setPosOrderStatus(status);
    } catch (error) {
      console.error('Failed to check order status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order.posExternalId) return;

    if (!window.confirm('Are you sure you want to cancel this order in the POS system?')) {
      return;
    }

    try {
      const success = await posManager.cancelOrder(
        restaurant.id,
        posConfig,
        order.posExternalId
      );

      if (success) {
        alert('Order cancelled in POS system');
        checkOrderStatus();
      } else {
        alert('Failed to cancel order in POS system');
      }
    } catch (error) {
      alert('Error cancelling order: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'preparing':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'ready':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!posConfig?.enabled) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
        POS integration is not enabled for this restaurant
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Send to POS Section */}
      {!order.posExternalId && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Send Order to POS</h3>

          {posConfig.settings.autoSendOrders ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Auto-send is enabled - order will be sent automatically
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Auto-send is disabled - manually send order to POS
            </div>
          )}

          <button
            onClick={handleSendOrder}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {sending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {posConfig.provider}
              </>
            )}
          </button>

          {sendResult && (
            <div
              className={`mt-3 p-3 rounded ${
                sendResult.success
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {sendResult.success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Order sent successfully!</p>
                    <p className="text-sm">POS Order ID: {sendResult.externalId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Failed to send order</p>
                    <p className="text-sm">{sendResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* POS Order Status Section */}
      {order.posExternalId && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">POS Order Status</h3>
            <button
              onClick={() => checkOrderStatus()}
              disabled={checkingStatus}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">POS Order ID</span>
              <span className="font-mono text-sm">{order.posExternalId}</span>
            </div>

            {posOrderStatus && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(posOrderStatus.status)}
                    <span className="font-medium capitalize">{posOrderStatus.status}</span>
                  </div>
                </div>

                {posOrderStatus.estimatedReadyTime && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Estimated Ready Time</span>
                    <span className="font-medium">
                      {posOrderStatus.estimatedReadyTime} minutes
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">
                    {posOrderStatus.timestamp.toLocaleString()}
                  </span>
                </div>

                {posOrderStatus.message && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">{posOrderStatus.message}</p>
                  </div>
                )}
              </>
            )}

            {posOrderStatus?.status !== 'cancelled' && posOrderStatus?.status !== 'completed' && (
              <button
                onClick={handleCancelOrder}
                className="w-full mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Order in POS
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSOrderManager;