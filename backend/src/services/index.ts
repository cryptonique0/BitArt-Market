/**
 * Services Index
 * Consolidated exports for all backend services
 * Provides clean API for route handlers
 */

// Search Service
export {
  searchNFTs,
  getTrendingNFTs,
  getNFTsByCategory,
  getSearchSuggestions,
  calculatePopularityScore,
  type NFTFilter,
  type SortOptions,
  type SearchResult
} from './search';

// Marketplace Service
export {
  createListing,
  cancelListing,
  buyNFT,
  getMarketplaceStats,
  getActiveListings,
  getTransactionHistory,
  updateListingPrice,
  calculateFees,
  getFloorPrice,
  type ListingData,
  type MarketplaceStats,
  type Transaction
} from './marketplace-refactored';

// Analytics Service
export {
  getMarketplaceStats as getAnalytics,
  type MarketplaceStats as AnalyticsData
} from './marketplace-refactored';

// Royalties Service
export {
  getCreatorRoyalties,
  getRoyaltyHistory,
  getNFTRoyaltyStats,
  getTopRoyaltyNFTs,
  calculateRoyalties,
  type RoyaltyRecord,
  type CreatorRoyalties,
  type RoyaltyChartData,
  type NFTRoyaltyStats
} from './royalties';

// Creator Service
export {
  getCreatorStats,
  getCreatorEarnings,
  getCreatorCollections,
  type CreatorStats,
  type CreatorEarnings
} from './creators';

// NFT Service
export {
  getNFTMetadata,
  listNFTs,
  type NFTMetadata
} from './nft';
