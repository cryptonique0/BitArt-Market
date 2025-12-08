import React, { useState, useEffect } from 'react';
import { Button, Card, Input, LoadingSpinner } from '../components/UI';
import { marketplaceService } from '../services/api';

export const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'price'
  });

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await marketplaceService.getListings(1, 20, filters);
        setListings(response.listings);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Marketplace</h1>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="price">Price</option>
                <option value="date">Date Listed</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Listings */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="mb-4 bg-gray-200 dark:bg-gray-700 h-48 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">NFT #{listing.nftId}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">NFT #{listing.nftId}</h3>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">{listing.price} STX</p>
                  <p className="text-sm text-gray-500">Quantity: {listing.quantity}</p>
                </div>
                <Button variant="primary" className="w-full">Buy Now</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
