import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchNFTs, SearchFilters, SearchResult, getTrendingNFTs } from '../services/search';
import { getTrendingByActivity } from '../services/activity';
import { ActivityFeed } from '../components/ActivityFeed';
import { NFTCard } from '../components/NFTCard';
import AdvancedFilters from '../components/AdvancedFilters';

export const DiscoveryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'popularity' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const { data: trendingByActivity } = useQuery({
    queryKey: ['trendingByActivity', 9],
    queryFn: () => getTrendingByActivity(9)
  });

  // Load trending NFTs on mount
  useEffect(() => {
    loadTrending();
  }, []);

  // Search when filters or page changes
  useEffect(() => {
    if (query || filters.sortBy !== 'popularity' || filters.priceMin || filters.priceMax) {
      performSearch();
    }
  }, [filters, page]);

  const loadTrending = async () => {
    try {
      const trendingNFTs = await getTrendingNFTs(10);
      setTrending(trendingNFTs);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await searchNFTs({
        ...filters,
        query: query || undefined,
        page,
        limit: 20
      });
      setResults(response.results);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const resultsDisplayed = results.length > 0 ? results.length : 0;
  const hasMore = resultsDisplayed < totalResults;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Discover NFTs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse and discover unique digital art
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search NFTs, creators, collections..."
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filters</h3>
                <AdvancedFilters
                  onFiltersChange={handleFiltersChange}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-8`}>
            {/* Trending Section (when no search) */}
            {!query && results.length === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Trending Now</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trending.map((nft) => (
                    <NFTCard key={nft.id} nft={nft as any} />
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {(query || Object.keys(filters).some(k => filters[k as keyof SearchFilters] !== undefined && filters[k as keyof SearchFilters] !== 'popularity')) && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Search Results {totalResults > 0 && `(${totalResults})`}
                  </h2>
                  {loading && (
                    <div className="animate-spin">
                      <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>

                {results.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {results.map((nft) => (
                        <NFTCard key={nft.id} nft={nft as any} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No NFTs found matching your criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity-driven Discovery */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending by Activity</h2>
              <span className="text-sm text-gray-500">Live signal from trades and mints</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(trendingByActivity || []).map((item: {
                contractAddress: string;
                nftId: string;
                activityCount: number;
                recentPrice?: number;
                floorPrice?: number;
              }) => (
                <div key={`${item.contractAddress}-${item.nftId}`} className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    #{item.nftId}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">NFT #{item.nftId}</p>
                    <p className="text-sm text-gray-500">{item.contractAddress.slice(0, 6)}...{item.contractAddress.slice(-4)}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{item.activityCount} events</span>
                      {item.recentPrice && <span>Last: {item.recentPrice} ETH</span>}
                      {item.floorPrice && <span>Floor: {item.floorPrice} ETH</span>}
                    </div>
                  </div>
                </div>
              ))}
              {(!trendingByActivity || trendingByActivity.length === 0) && (
                <div className="col-span-full text-gray-600 dark:text-gray-400">No activity-driven trends yet.</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Marketplace Activity</h2>
              <span className="text-sm text-gray-500">Filter mints, bids, sales, and more</span>
            </div>
            <ActivityFeed limit={20} showFilters className="mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPage;
