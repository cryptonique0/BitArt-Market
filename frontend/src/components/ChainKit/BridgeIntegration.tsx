import React, { useEffect, useState } from 'react';
import {
  estimateBridgeRoute,
  formatBridgeRoute,
  BridgeRoute,
  BridgeOption,
  getAvailableBridges,
} from '../../services/bridge';
import { getChainName } from '../../utils';

interface BridgeIntegrationProps {
  fromChainId: number;
  toChainId: number;
  tokenAddress?: string;
  amount?: string;
  onBridgeSelected?: (route: BridgeOption) => void;
}

export const BridgeIntegration: React.FC<BridgeIntegrationProps> = ({
  fromChainId,
  toChainId,
  tokenAddress = '0x0000000000000000000000000000000000000000',
  amount = '1',
  onBridgeSelected,
}) => {
  const [bridgeRoute, setBridgeRoute] = useState<BridgeRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<BridgeOption | null>(null);

  useEffect(() => {
    const loadBridgeRoute = async () => {
      setLoading(true);
      try {
        const route = await estimateBridgeRoute(fromChainId, toChainId, tokenAddress, amount);
        setBridgeRoute(route);
        setSelectedRoute(route.bestRoute);
      } catch (error) {
        console.error('Failed to load bridge route:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBridgeRoute();
  }, [fromChainId, toChainId, tokenAddress, amount]);

  const availableBridges = getAvailableBridges(fromChainId, toChainId);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!bridgeRoute || availableBridges.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ No bridges available between
          {getChainName(fromChainId)}
          and
          {getChainName(toChainId)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold">
              Bridge Route
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {getChainName(fromChainId)}
              </span>
              <span className="text-blue-600 dark:text-blue-400">→</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {getChainName(toChainId)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Best Bridge</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {selectedRoute?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Available Routes */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white px-1">Available Bridges</h4>
        {bridgeRoute.routes.map(route => {
          const formatted = formatBridgeRoute(route);
          const isSelected = selectedRoute?.id === route.id;

          return (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRoute(route);
                onBridgeSelected?.(route);
              }}
              className={`w-full p-4 rounded-lg border-2 transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{formatted.icon}</span>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white">{formatted.name}</p>
                    <p className="text-xs text-gray-500">
                      ⏱️
                      {formatted.time} • Fee:
                      {formatted.fee}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatted.feePercentage}
                  </div>
                  <p className="text-xs text-gray-500">{formatted.fee}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">You Receive</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {parseFloat(route.receiveAmount).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Min Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {parseFloat(route.minReceiveAmount).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Slippage</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {route.slippage.toFixed(2)}%
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selectedRoute && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount to Send</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedRoute.amount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Bridge Fee</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${parseFloat(selectedRoute.fee).toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedRoute.estimatedTime} minutes
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">
              You Receive (Min)
            </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {parseFloat(selectedRoute.minReceiveAmount).toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg">
        Initiate Bridge Transfer
      </button>
    </div>
  );
};

export default BridgeIntegration;
