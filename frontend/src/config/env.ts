/**
 * Frontend environment configuration
 * Type-safe access to Vite environment variables
 */

interface FrontendConfig {
  // API
  apiUrl: string;
  
  // Network
  network: 'testnet' | 'mainnet';
  
  // Stacks
  stacks: {
    apiUrl: string;
    nftContract: string;
    marketplaceContract: string;
    auctionContract: string;
  };
  
  // Base
  base: {
    rpcUrl: string;
    chainId: number;
    chainName: string;
    currency: string;
    explorer: string;
    nftContract: string;
    marketplaceContract: string;
    auctionContract: string;
  };
  
  // Features
  features: {
    enableBase: boolean;
    enableStacks: boolean;
  };
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(key: keyof ImportMetaEnv, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: keyof ImportMetaEnv, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * Validate and parse frontend environment variables
 */
function createConfig(): FrontendConfig {
  const network = getOptionalEnv('VITE_NETWORK', 'testnet');
  
  if (network !== 'testnet' && network !== 'mainnet') {
    console.warn(`Invalid VITE_NETWORK: ${network}. Defaulting to 'testnet'`);
  }

  return {
    apiUrl: getOptionalEnv('VITE_API_URL', 'http://localhost:3001/api'),
    network: (network === 'mainnet' ? 'mainnet' : 'testnet') as 'testnet' | 'mainnet',
    
    stacks: {
      apiUrl: getOptionalEnv('VITE_STACKS_API_URL', 'https://api.testnet.stacks.co'),
      nftContract: getOptionalEnv(
        'VITE_NFT_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.colorful-lime-guan'
      ),
      marketplaceContract: getOptionalEnv(
        'VITE_MARKETPLACE_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.partial-harlequin-tahr'
      ),
      auctionContract: getOptionalEnv(
        'VITE_AUCTION_CONTRACT',
        'ST1VJDKVGZ3S0G0TB0J4HG6KA8JDK33BBVADW2P4J.better-copper-lemming'
      ),
    },
    
    base: {
      rpcUrl: getOptionalEnv('VITE_BASE_RPC_URL', 'https://mainnet.base.org'),
      chainId: parseInt(getOptionalEnv('VITE_BASE_CHAIN_ID', '8453'), 10),
      chainName: getOptionalEnv('VITE_BASE_CHAIN_NAME', 'Base Mainnet'),
      currency: getOptionalEnv('VITE_BASE_CURRENCY', 'ETH'),
      explorer: getOptionalEnv('VITE_BASE_EXPLORER', 'https://basescan.org'),
      nftContract: getOptionalEnv(
        'VITE_BASE_NFT_CONTRACT',
        '0xD15D1766cd7c2D4FbcEb4f015CbD54058304d682'
      ),
      marketplaceContract: getOptionalEnv(
        'VITE_BASE_MARKETPLACE_CONTRACT',
        '0x7d28443e3571faB3821d669537E45484E4A06AC9'
      ),
      auctionContract: getOptionalEnv(
        'VITE_BASE_AUCTION_CONTRACT',
        '0x2119FA24f5C1973eE5c9886E850eB5E835d1ABD2'
      ),
    },
    
    features: {
      enableBase: getBooleanEnv('VITE_ENABLE_BASE', true),
      enableStacks: getBooleanEnv('VITE_ENABLE_STACKS', true),
    },
  };
}

// Export singleton config
export const config = createConfig();

export type { FrontendConfig };
