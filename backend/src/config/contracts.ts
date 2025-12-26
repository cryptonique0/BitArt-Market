// Backend Stacks Smart Contract Configuration

export const STACKS_CONTRACTS = {
  network: process.env.NETWORK || 'testnet',
  
  // Contract addresses
  nft: process.env.NFT_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.bitart-nft',
  marketplace: process.env.MARKETPLACE_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.bitart-marketplace',
  auction: process.env.AUCTION_CONTRACT || 'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming',
  
  // API configuration
  apiUrl: process.env.STACKS_API_URL || 'https://api.testnet.stacks.co',
};
