import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NFT, Listing } from '../types';
import { nftService, marketplaceService } from '../services/api';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../components/Button';
import { useNotificationStore } from '../store';

export const NFTDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useWallet();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [nft, setNft] = useState<NFT | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const nftData = await nftService.getById(parseInt(id));
        setNft(nftData);

        const historyData = await nftService.getHistory(parseInt(id));
        setHistory(historyData);

        // In a real app, would fetch from marketplace
        // For now, mock listing data
      } catch (error) {
        console.error('Failed to fetch NFT:', error);
        addNotification({
          type: 'error',
          title: 'Failed to Load',
          message: 'Could not load NFT details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, addNotification]);

  const handleBuy = async () => {
    if (!user.isConnected || !listing) {
      addNotification({
        type: 'error',
        title: 'Not Connected',
        message: 'Please connect your wallet to purchase'
      });
      return;
    }

    try {
      await marketplaceService.buyNFT(listing.id, 1, user.address || '');
      addNotification({
        type: 'success',
        title: 'Purchase Initiated',
        message: 'Your purchase is being processed. Check your wallet for confirmation.'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Purchase Failed',
        message: error.message
      });
    }
  };

  if (loading || !nft) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          {/* Details */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {nft.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {nft.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                By <span className="font-semibold">{nft.creator.substring(0, 8)}...</span>
              </p>
            </div>

            {/* Description */}
            <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {nft.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Owner</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nft.owner.substring(0, 8)}...
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Creator Royalty</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nft.royaltyPercentage}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(nft.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contract</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  #{nft.id}
                </p>
              </div>
            </div>

            {/* Listing Info */}
            {listing ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Price</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {listing.price} STX
                </p>
                <Button
                  onClick={handleBuy}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Buy Now
                </Button>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Not currently listed for sale
                </p>
              </div>
            )}

            {/* Make Offer Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
            >
              Make an Offer
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h2>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No transaction history</p>
            ) : (
              history.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {tx.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`https://explorer.stacks.co/txid/${tx.txHash}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                  >
                    View on Explorer →
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
