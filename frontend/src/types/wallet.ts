import { ethers } from 'ethers';

export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  TRUST = 'trust',
  RAINBOW = 'rainbow',
  LEDGER = 'ledger',
  TREZOR = 'trezor',
  PHANTOM = 'phantom',
  BRAVE = 'brave',
  INJECTED = 'injected',
}

export interface WalletInfo {
  name: string;
  type: WalletType;
  icon: string;
  description: string;
  downloadUrl?: string;
  isInstalled: boolean;
  isAvailable: boolean;
}

export interface WalletConnection {
  provider: ethers.BrowserProvider | unknown;
  signer: ethers.Signer | null;
  account: string;
  chainId: number;
  walletType: WalletType;
}

export interface WalletConnectorConfig {
  rpcUrls?: { [chainId: number]: string };
  projectId?: string; // For WalletConnect
  appName?: string; // For Coinbase
  appLogoUrl?: string;
}

export interface ChainConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface WalletError {
  code: number;
  message: string;
  data?: unknown;
}

export interface ConnectOptions {
  chainId?: number;
  showQRCode?: boolean;
  onConnecting?: () => void;
  onError?: (error: WalletError) => void;
}

export type WalletEventType = 'accountsChanged' | 'chainChanged' | 'disconnect' | 'connect';

export type WalletEventHandler = (data?: unknown) => void;

export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: WalletEventHandler) => void;
  off: (event: string, handler: WalletEventHandler) => void;
  removeListener?: (event: string, handler: WalletEventHandler) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
  isRainbow?: boolean;
  isPhantom?: boolean;
  isBraveWallet?: boolean;
}

export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  // Base Mainnet
  8453: {
    chainId: 8453,
    chainName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
  // Base Sepolia
  84532: {
    chainId: 84532,
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  // Polygon
  137: {
    chainId: 137,
    chainName: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  // Arbitrum
  42161: {
    chainId: 42161,
    chainName: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  // Optimism
  10: {
    chainId: 10,
    chainName: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
};
