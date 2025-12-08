import axios from 'axios';
import { NFT, Listing, UserProfile, MarketplaceStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// NFT Endpoints
// ============================================

export const nftService = {
  /**
   * Get all NFTs with pagination and filters
   */
  getAll: async (page: number = 1, limit: number = 20, filters?: any) => {
    const response = await apiClient.get('/nfts', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  /**
   * Get single NFT by ID
   */
  getById: async (id: number) => {
    const response = await apiClient.get(`/nfts/${id}`);
    return response.data.nft;
  },

  /**
   * Create new NFT
   */
  create: async (formData: FormData, creatorAddress: string) => {
    const response = await apiClient.post('/nfts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-creator-address': creatorAddress
      }
    });
    return response.data;
  },

  /**
   * Get NFT transaction history
   */
  getHistory: async (nftId: number) => {
    const response = await apiClient.get(`/nfts/${nftId}/history`);
    return response.data.history;
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await apiClient.get('/nfts/meta/categories');
    return response.data.categories;
  }
};

// ============================================
// Marketplace Endpoints
// ============================================

export const marketplaceService = {
  /**
   * Get all active listings
   */
  getListings: async (page: number = 1, limit: number = 20, filters?: any) => {
    const response = await apiClient.get('/marketplace/listings', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  /**
   * Get single listing
   */
  getListing: async (id: number) => {
    const response = await apiClient.get(`/marketplace/listings/${id}`);
    return response.data.listing;
  },

  /**
   * Create new listing
   */
  createListing: async (nftId: number, price: number, quantity: number = 1, sellerAddress: string) => {
    const response = await apiClient.post('/marketplace/listings', 
      { nftId, price, quantity },
      { headers: { 'x-seller-address': sellerAddress } }
    );
    return response.data;
  },

  /**
   * Update listing price
   */
  updateListing: async (id: number, price: number, sellerAddress: string) => {
    const response = await apiClient.put(`/marketplace/listings/${id}`,
      { price },
      { headers: { 'x-seller-address': sellerAddress } }
    );
    return response.data;
  },

  /**
   * Cancel listing
   */
  cancelListing: async (id: number, sellerAddress: string) => {
    const response = await apiClient.delete(`/marketplace/listings/${id}`,
      { headers: { 'x-seller-address': sellerAddress } }
    );
    return response.data;
  },

  /**
   * Buy NFT
   */
  buyNFT: async (listingId: number, quantity: number = 1, buyerAddress: string) => {
    const response = await apiClient.post('/marketplace/buy',
      { listingId, quantity },
      { headers: { 'x-buyer-address': buyerAddress } }
    );
    return response.data;
  }
};

// ============================================
// User Endpoints
// ============================================

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async (address: string) => {
    const response = await apiClient.get(`/users/${address}`);
    return response.data.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (address: string, data: any) => {
    const response = await apiClient.put(`/users/${address}`, data);
    return response.data.user;
  },

  /**
   * Get user's NFTs
   */
  getNFTs: async (address: string, page: number = 1, limit: number = 20) => {
    const response = await apiClient.get(`/users/${address}/nfts`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get user's collections
   */
  getCollections: async (address: string) => {
    const response = await apiClient.get(`/users/${address}/collections`);
    return response.data.collections;
  },

  /**
   * Get user's sales
   */
  getSales: async (address: string, page: number = 1, limit: number = 20) => {
    const response = await apiClient.get(`/users/${address}/sales`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get user's favorites
   */
  getFavorites: async (address: string) => {
    const response = await apiClient.get(`/users/${address}/favorites`);
    return response.data.favorites;
  }
};

// ============================================
// Analytics Endpoints
// ============================================

export const analyticsService = {
  /**
   * Get marketplace statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/analytics/stats');
    return response.data.stats;
  },

  /**
   * Get top creators
   */
  getTopCreators: async (limit: number = 10) => {
    const response = await apiClient.get('/analytics/top-creators', {
      params: { limit }
    });
    return response.data.creators;
  },

  /**
   * Get top buyers
   */
  getTopBuyers: async (limit: number = 10) => {
    const response = await apiClient.get('/analytics/top-buyers', {
      params: { limit }
    });
    return response.data.buyers;
  },

  /**
   * Get trending NFTs
   */
  getTrending: async (limit: number = 20) => {
    const response = await apiClient.get('/analytics/trending', {
      params: { limit }
    });
    return response.data.nfts;
  }
};

export default {
  nftService,
  marketplaceService,
  userService,
  analyticsService
};
