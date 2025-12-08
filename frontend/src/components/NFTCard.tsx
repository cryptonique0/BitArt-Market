import React from 'react';
import { NFT } from '../types';
import { Link } from 'react-router-dom';

interface NFTCardProps {
  nft: NFT;
  price?: number;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, price }) => {
  return (
    <Link
      to={`/nft/${nft.id}`}
      className="group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-xl transition-all"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-48">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
          {nft.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {nft.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
          By {nft.creator.substring(0, 8)}...
        </p>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {price !== undefined ? (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {price} STX
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Not Listed</p>
          )}
        </div>
      </div>
    </Link>
  );
};
