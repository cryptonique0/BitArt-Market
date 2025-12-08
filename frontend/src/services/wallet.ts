import {
  AppConfig,
  UserSession,
  showConnect,
  disconnect
} from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();

export interface StacksWalletUser {
  profile: {
    stxAddress?: {
      testnet?: string;
      mainnet?: string;
    };
  };
}

class WalletService {
  /**
   * Check if wallet is installed
   */
  isWalletInstalled(): boolean {
    return !!window.LeatherProvider || !!window.HiroGetStacks;
  }

  /**
   * Connect to wallet
   */
  async connectWallet(): Promise<string | null> {
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
   * Disconnect wallet
   */
  disconnectWallet(): void {
    userSession.signUserOut();
    disconnect();
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): boolean {
    return userSession.isUserSignedIn();
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    if (this.isUserLoggedIn()) {
      const user = userSession.loadUserData() as StacksWalletUser;
      return {
        address: user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet,
        username: user?.profile?.username
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
}

export const walletService = new WalletService();
