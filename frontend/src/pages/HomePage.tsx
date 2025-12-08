import React, { useEffect, useState } from 'react';
import { NFTGrid } from '../components/NFTGrid';
import { analyticsService } from '../services/api';
import { MarketplaceStats } from '../types';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<MarketplaceStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Digital Art, Blockchain Power
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Discover, create, and trade unique digital artworks on the Stacks blockchain. 
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
              <div className="relative h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-center">
                <div>
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-semibold">Your Art Here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
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
                  {stats.totalVolume.toFixed(2)} STX
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
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Trending Now
          </h2>
          <NFTGrid />
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
                      Floor: {(i * 0.5).toFixed(2)} STX
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
