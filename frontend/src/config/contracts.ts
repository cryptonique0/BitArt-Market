// Smart Contract Configuration
// Type-safe contract addresses and configuration

import { config } from './env';

export const STACKS_CONTRACTS = {
  // Network configuration
  network: config.network,
  
  // Contract addresses
  nft: config.stacks.nftContract,
  marketplace: config.stacks.marketplaceContract,
  auction: config.stacks.auctionContract,
  
  // Explorer URLs
  explorerUrl: 'https://explorer.stacks.co',
  apiUrl: config.stacks.apiUrl,
} as const;

export const BASE_CONTRACTS = {
  // Network configuration
  chainId: config.base.chainId,
  chainName: config.base.chainName,
  currency: config.base.currency,
  rpcUrl: config.base.rpcUrl,
  explorer: config.base.explorer,
  
  // Contract addresses
  nft: config.base.nftContract,
  marketplace: config.base.marketplaceContract,
  auction: config.base.auctionContract,
} as const;

// Contract function names for reference
export const CONTRACT_FUNCTIONS = {
  nft: {
    mint: 'mint-nft',
    transfer: 'transfer-nft',
    getMetadata: 'get-nft-metadata',
    getBalance: 'get-nft-balance',
    getTotalNfts: 'get-total-nfts',
  },
  marketplace: {
    list: 'list-nft',
    updatePrice: 'update-listing-price',
    cancelListing: 'cancel-listing',
    buy: 'buy-nft',
    getListing: 'get-listing',
  },
  auction: {
    create: 'create-auction',
    placeBid: 'place-bid',
    endAuction: 'end-auction',
    claim: 'claim-auction',
    getAuction: 'get-auction',
  },
} as const;
