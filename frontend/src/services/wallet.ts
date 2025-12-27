import {
  AppConfig,
  UserSession,
  showConnect,
  disconnect
} from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import axios from 'axios';

declare global {
  interface Window {
    LeatherProvider?: unknown;
    HiroGetStacks?: unknown;
    ethereum?: any;
  }
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = STACKS_TESTNET;

// Base defaults (Mainnet)
const BASE_RPC_URL = (import.meta as any).env?.VITE_BASE_RPC_URL || 'https://mainnet.base.org';
const BASE_CHAIN_ID = (import.meta as any).env?.VITE_BASE_CHAIN_ID || '0x2105'; // Base mainnet chain id in hex (8453)
const BASE_CHAIN_NAME = (import.meta as any).env?.VITE_BASE_CHAIN_NAME || 'Base Mainnet';
const BASE_CURRENCY = (import.meta as any).env?.VITE_BASE_CURRENCY || 'ETH';
const BASE_EXPLORER = (import.meta as any).env?.VITE_BASE_EXPLORER || 'https://basescan.org';

export interface StacksWalletUser {
  profile: {
    stxAddress?: {
      testnet?: string;
      mainnet?: string;
    };
    username?: string;
  };
}

class WalletService {
  private baseSessionKey = 'bitart-base-address';

  /**
   * Check if wallet is installed
   */
  isWalletInstalled(): boolean {
    return !!window.LeatherProvider || !!window.HiroGetStacks || !!window.ethereum;
  }

  /**
   * Connect to Stacks wallet
   */
   async connectStacksWallet(): Promise<string | null> {
    return new Promise((resolve) => {
      showConnect({
        appDetails: {
          name: 'BitArt Market',
          icon: 'https://via.placeholder.com/128',
        },
        redirectTo: '/',
        onFinish: () => {
          const user = userSession.loadUserData() as StacksWalletUser;
          const address = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;
          resolve(address || null);
        },
        onCancel: () => resolve(null),
      });
    });
  }

  /**
   * Connect to Base wallet (MetaMask/WalletConnect via injected provider)
   */
  async connectBaseWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('No Ethereum-compatible wallet found. Please install MetaMask or a Base-compatible wallet.');
    }

    // Ensure Base network is added/switch
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_CHAIN_ID }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: BASE_CHAIN_ID,
            chainName: BASE_CHAIN_NAME,
            rpcUrls: [BASE_RPC_URL],
            nativeCurrency: {
              name: BASE_CURRENCY,
              symbol: BASE_CURRENCY,
              decimals: 18
            },
            blockExplorerUrls: [BASE_EXPLORER]
          }]
        });
      } else {
        throw switchError;
      }
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts?.[0] || null;
    if (address) {
      localStorage.setItem(this.baseSessionKey, address);
    }
    return address;
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(chain: 'stacks' | 'base' | null = null): void {
    if (!chain || chain === 'stacks') {
      userSession.signUserOut();
      disconnect();
    }

    if (!chain || chain === 'base') {
      localStorage.removeItem(this.baseSessionKey);
    }
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(chain: 'stacks' | 'base' | null = null): boolean {
    if (chain === 'stacks') return userSession.isUserSignedIn();
    if (chain === 'base') return !!localStorage.getItem(this.baseSessionKey);
    return userSession.isUserSignedIn() || !!localStorage.getItem(this.baseSessionKey);
  }

  /**
   * Get current user
   */
  async getCurrentUser(chain: 'stacks' | 'base' | null = null) {
    if ((chain === 'stacks' || !chain) && userSession.isUserSignedIn()) {
      const user = userSession.loadUserData() as StacksWalletUser;
      return {
        address: user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet,
        username: user?.profile?.username,
        chain: 'stacks' as const,
        balance: null
      };
    }

    if ((chain === 'base' || !chain) && localStorage.getItem(this.baseSessionKey)) {
      const address = localStorage.getItem(this.baseSessionKey) as string;
      const balance = await this.getBaseBalance(address);
      return {
        address,
        username: null,
        chain: 'base' as const,
        balance
      };
    }

    return null;
  }

  /**
   * Get user session
   */
  getUserSession() {
    return userSession;
  }

  /**
   * Get network
   */
  getNetwork() {
    return network;
  }

  /**
   * Connect based on selected chain
   */
  async connectWallet(chain: 'stacks' | 'base' = 'stacks') {
    if (chain === 'stacks') {
      const address = await this.connectStacksWallet();
      return address ? { address, chain: 'stacks' as const } : null;
    }

    if (chain === 'base') {
      const address = await this.connectBaseWallet();
      return address ? { address, chain: 'base' as const } : null;
    }

    return null;
  }

  /**
   * Get Base balance via RPC
   */
  async getBaseBalance(address: string): Promise<string | null> {
    try {
      const response = await axios.post(BASE_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const balanceHex = response.data?.result;
      if (!balanceHex) return null;
      const wei = BigInt(balanceHex);
      // Convert to ETH with 4 decimal precision for UI
      const eth = Number(wei) / 1e18;
      return eth.toFixed(4);
    } catch (error) {
      console.error('Failed to fetch Base balance', error);
      return null;
    }
  }
}

export const walletService = new WalletService();
