import {
  AppConfig,
  UserSession,
  showConnect,
  disconnect
} from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
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
const network = new StacksTestnet();

// Celo defaults (Alfajores testnet)
const CELO_RPC_URL = import.meta.env.VITE_CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
const CELO_CHAIN_ID = import.meta.env.VITE_CELO_CHAIN_ID || '0xaef3'; // Alfajores chain id in hex
const CELO_CHAIN_NAME = import.meta.env.VITE_CELO_CHAIN_NAME || 'Celo Alfajores Testnet';
const CELO_CURRENCY = import.meta.env.VITE_CELO_CURRENCY || 'CELO';
const CELO_EXPLORER = import.meta.env.VITE_CELO_EXPLORER || 'https://alfajores-blockscout.celo-testnet.org';

export interface StacksWalletUser {
  profile: {
    stxAddress?: {
      testnet?: string;
      mainnet?: string;
    };
  };
}

class WalletService {
  private celoSessionKey = 'bitart-celo-address';

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
   * Connect to Celo wallet (Valora/MetaMask/WalletConnect via injected provider)
   */
  async connectCeloWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('No Ethereum-compatible wallet found. Please install MetaMask or a Celo-compatible wallet.');
    }

    // Ensure Celo network is added/switch
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_CHAIN_ID }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CELO_CHAIN_ID,
            chainName: CELO_CHAIN_NAME,
            rpcUrls: [CELO_RPC_URL],
            nativeCurrency: {
              name: CELO_CURRENCY,
              symbol: CELO_CURRENCY,
              decimals: 18
            },
            blockExplorerUrls: [CELO_EXPLORER]
          }]
        });
      } else {
        throw switchError;
      }
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts?.[0] || null;
    if (address) {
      localStorage.setItem(this.celoSessionKey, address);
    }
    return address;
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(chain: 'stacks' | 'celo' | null = null): void {
    if (!chain || chain === 'stacks') {
      userSession.signUserOut();
      disconnect();
    }

    if (!chain || chain === 'celo') {
      localStorage.removeItem(this.celoSessionKey);
    }
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(chain: 'stacks' | 'celo' | null = null): boolean {
    if (chain === 'stacks') return userSession.isUserSignedIn();
    if (chain === 'celo') return !!localStorage.getItem(this.celoSessionKey);
    return userSession.isUserSignedIn() || !!localStorage.getItem(this.celoSessionKey);
  }

  /**
   * Get current user
   */
  async getCurrentUser(chain: 'stacks' | 'celo' | null = null) {
    if ((chain === 'stacks' || !chain) && userSession.isUserSignedIn()) {
      const user = userSession.loadUserData() as StacksWalletUser;
      return {
        address: user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet,
        username: user?.profile?.username,
        chain: 'stacks' as const,
        balance: null
      };
    }

    if ((chain === 'celo' || !chain) && localStorage.getItem(this.celoSessionKey)) {
      const address = localStorage.getItem(this.celoSessionKey) as string;
      const balance = await this.getCeloBalance(address);
      return {
        address,
        username: null,
        chain: 'celo' as const,
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
  async connectWallet(chain: 'stacks' | 'celo' = 'stacks') {
    if (chain === 'stacks') {
      const address = await this.connectStacksWallet();
      return address ? { address, chain: 'stacks' as const } : null;
    }

    if (chain === 'celo') {
      const address = await this.connectCeloWallet();
      return address ? { address, chain: 'celo' as const } : null;
    }

    return null;
  }

  /**
   * Get Celo balance via RPC
   */
  async getCeloBalance(address: string): Promise<string | null> {
    try {
      const response = await axios.post(CELO_RPC_URL, {
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
      // Convert to CELO with 4 decimal precision for UI
      const celo = Number(wei) / 1e18;
      return celo.toFixed(4);
    } catch (error) {
      console.error('Failed to fetch Celo balance', error);
      return null;
    }
  }
}

export const walletService = new WalletService();
