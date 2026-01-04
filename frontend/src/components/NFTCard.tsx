import React from 'react';
import { NFT } from '../types';
import { Link } from 'react-router-dom';
import { GasBreakdown } from './GasBreakdown';

interface NFTCardProps {
  nft: NFT;
  price?: number; // in ETH
  royaltyPercentage?: number;
  showGasEstimate?: boolean;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, price, royaltyPercentage = 0, showGasEstimate = true }) => {
  return (
    <div className="group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-xl transition-all">
      {/* Image */}
      <Link to={`/nft/${nft.id}`} className="block relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-48">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {/* Base Badge */}
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Base
          </div>
          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
            {nft.category}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/nft/${nft.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {nft.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
          By {nft.creator.substring(0, 8)}...
        </p>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {price !== undefined && price > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {price.toFixed(4)} ETH
                </p>
              </div>
              
              {/* Gas Breakdown Preview */}
              {showGasEstimate && (
                <GasBreakdown
                  itemPrice={price}
                  royaltyPercentage={royaltyPercentage}
                  className="mt-2"
                />
              )}

              {/* CTA Button */}
              <Link
                to={`/nft/${nft.id}`}
                className="block w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center transition-colors"
              >
                View & Buy
              </Link>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Not Listed</p>
          )}
        </div>
      </div>
    </div>
  );
};
