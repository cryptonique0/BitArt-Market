// Stacks Smart Contract Configuration
// Generated for BitArt Market deployment

export const STACKS_CONTRACTS = {
  // Network configuration
  network: 'testnet',
  
  // Contract addresses (deployed on Stacks testnet)
  nft: process.env.VITE_NFT_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.colorful-lime-guan',
  marketplace: process.env.VITE_MARKETPLACE_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.partial-harlequin-tahr',
  auction: process.env.VITE_AUCTION_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming',
  
  // Explorer URLs
  explorerUrl: 'https://explorer.stacks.co',
  apiUrl: 'https://api.testnet.stacks.co',
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
