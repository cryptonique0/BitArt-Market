import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityFeed } from '../components/ActivityFeed';
import { VerificationBadge } from '../components/VerificationBadge';
import { getTopCreators } from '../services/follows';
import { analyticsService, baseService } from '../services/api';
import { MarketplaceStats } from '../types';
import { useUserStore } from '../store';
import { config } from '../config/env';
import { StatCardSkeleton } from '../components/SkeletonLoader';

interface MockNFT {
  id: string;
  name: string;
  image: string;
  price: number;
  creator: string;
  verified?: boolean;
  floorPrice?: number;
}

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [baseHealth, setBaseHealth] = useState<string>('Loading...');
  const [baseBalance, setBaseBalance] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const { user } = useUserStore();

  // Mock trending NFTs for Base
  const mockTrendingNFTs: MockNFT[] = [
    {
      id: '1',
      name: 'CyberPunk Genesis #001',
      image: '/images/nfts/cyberpunk-001.svg',
      price: 0.5,
      creator: '0xArtist1',
      verified: true,
      floorPrice: 0.45
    },
    {
      id: '2',
      name: 'Digital Dreams #042',
      image: '/images/nfts/digital-dreams-042.svg',
      price: 0.75,
      creator: '0xCreator2',
      verified: false,
      floorPrice: 0.6
    },
    {
      id: '3',
      name: 'Base Builders #777',
      image: '/images/nfts/base-builders-777.svg',
      price: 1.25,
      creator: '0xDev3',
      verified: true,
      floorPrice: 1.0
    },
    {
      id: '4',
      name: 'Pixel Paradise #99',
      image: '/images/nfts/pixel-paradise-99.svg',
      price: 0.35,
      creator: '0xPixel4',
      verified: false,
      floorPrice: 0.3
    },
  ];

  // Top creators by followers
  const { data: topCreators, isLoading: loadingCreators } = useQuery({
    queryKey: ['topCreatorsHome'],
    queryFn: () => getTopCreators(6)
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchBaseHealth = async () => {
      try {
        const data = await baseService.getHealth();
        setBaseHealth(data.clientVersion || 'Healthy');
      } catch (error) {
        setBaseHealth('Unavailable');
      }
    };

    fetchStats();
    fetchBaseHealth();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user.address && user.chain === 'base') {
        try {
          const data = await baseService.getBalance(user.address);
          setBaseBalance(data.balance);
        } catch (error) {
          setBaseBalance(null);
        }
      }
    };

    fetchBalance();
  }, [user.chain, user.address]);

  const currentNetwork = isTestnet ? config.base.testnet : config.base.mainnet;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Digital Art on Base
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Discover, create, and trade unique digital artworks on Base blockchain.
                Creators get royalties on every resale.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Explore Now
                </button>
                <button className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 blur-3xl" />
              <div className="relative h-full bg-gradient-to-br from-blue-900 via-gray-900 to-black rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/logo.png" 
                  alt="BitArt Market" 
                  className="w-4/5 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {loadingStats ? (
        <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : stats && (
        <section className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalNfts.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">NFTs Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalVolume.toFixed(2)} ETH
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Trading Volume</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalSales.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Total Sales</p>
              </div>
            </div>

            {/* Base Network Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {currentNetwork.chainName}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {isTestnet ? 'Testnet' : 'Mainnet'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTestnet(true)}
                    disabled={isTestnet}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                      isTestnet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Sepolia
                  </button>
                  <button
                    onClick={() => setIsTestnet(false)}
                    disabled={!isTestnet}
                    className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                      !isTestnet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Mainnet
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">RPC: {baseHealth}</p>
                {user.chain === 'base' && user.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance: {baseBalance ? `${baseBalance} ETH` : 'Loading...'}</p>
                )}
              </div>

              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">BitArt Market</div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200">Ready</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create, mint, and trade NFTs on Base.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section with Mock NFTs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Trending Now on {isTestnet ? 'Sepolia' : 'Base'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTrendingNFTs.map((nft) => (
              <div key={nft.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{nft.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{nft.price} ETH</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                      Buy Now
                    </button>
                  </div>
                  {nft.floorPrice && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Floor: {nft.floorPrice} ETH</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Creators</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ranked by followers</span>
          </div>

          {loadingCreators ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topCreators && topCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topCreators.map((creator: { address: string; followerCount: number }) => (
                <div
                  key={creator.address}
                  className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {creator.address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                        </p>
                        <VerificationBadge address={creator.address} showLabel={false} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {creator.followerCount.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Engagement score powered by social signals</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No creator data yet.</p>
          )}
        </div>
      </section>

      {/* Marketplace Activity */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Activity</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Live events across the market</span>
          </div>
          <ActivityFeed limit={15} showFilters className="mt-4" />
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Featured Collection {i}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    Curated artworks from top creators
                  </p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Items: {100 * i}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      Floor: {(i * 0.5).toFixed(2)} ETH
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Create?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Upload your artwork, set royalties, and start selling on BitArt Market.
            It takes just a few minutes.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-lg">
            Create Your First NFT
          </button>
        </div>
      </section>
    </div>
  );
};
