import { ethers } from 'ethers';
import {
  WalletType,
  WalletInfo,
  WalletConnection,
  WalletConnectorConfig,
  WalletProvider,
  ConnectOptions,
  WalletError,
  SUPPORTED_CHAINS,
  ChainConfig,
} from '../types/wallet';

declare global {
  interface Window {
    ethereum?: any;
    coinbaseWalletExtension?: any;
    trustWallet?: any;
    phantom?: {
      ethereum?: any;
    };
    BinanceChain?: any;
  }
}

class MultiWalletConnector {
  private provider: ethers.BrowserProvider | any | null = null;
  private signer: ethers.Signer | null = null;
  private account: string | null = null;
  private chainId: number | null = null;
  private walletType: WalletType | null = null;
  private config: WalletConnectorConfig;
  private walletConnectProvider: any = null;
  private coinbaseProvider: any = null;

  constructor(config: WalletConnectorConfig = {}) {
    this.config = {
      projectId: config.projectId || 'YOUR_WALLETCONNECT_PROJECT_ID',
      appName: config.appName || 'BitArt Market',
      appLogoUrl: config.appLogoUrl || '',
      rpcUrls: config.rpcUrls || {},
    };
  }

  /**
   * Get list of available wallets
   */
  getAvailableWallets(): WalletInfo[] {
    return [
      {
        name: 'MetaMask',
        type: WalletType.METAMASK,
        icon: '🦊',
        description: 'Connect using MetaMask wallet',
        downloadUrl: 'https://metamask.io/download/',
        isInstalled: this.isMetaMaskInstalled(),
        isAvailable: true,
      },
      {
        name: 'Coinbase Wallet',
        type: WalletType.COINBASE,
        icon: '💼',
        description: 'Connect using Coinbase Wallet',
        downloadUrl: 'https://www.coinbase.com/wallet',
        isInstalled: this.isCoinbaseInstalled(),
        isAvailable: true,
      },
      {
        name: 'WalletConnect',
        type: WalletType.WALLET_CONNECT,
        icon: '🔗',
        description: 'Scan QR code with your mobile wallet',
        isInstalled: true,
        isAvailable: true,
      },
      {
        name: 'Trust Wallet',
        type: WalletType.TRUST,
        icon: '🛡️',
        description: 'Connect using Trust Wallet',
        downloadUrl: 'https://trustwallet.com/',
        isInstalled: this.isTrustInstalled(),
        isAvailable: true,
      },
      {
        name: 'Rainbow',
        type: WalletType.RAINBOW,
        icon: '🌈',
        description: 'Connect using Rainbow wallet',
        downloadUrl: 'https://rainbow.me/',
        isInstalled: this.isRainbowInstalled(),
        isAvailable: true,
      },
      {
        name: 'Brave Wallet',
        type: WalletType.BRAVE,
        icon: '🦁',
        description: 'Connect using Brave browser wallet',
        isInstalled: this.isBraveInstalled(),
        isAvailable: true,
      },
      {
        name: 'Phantom',
        type: WalletType.PHANTOM,
        icon: '👻',
        description: 'Connect using Phantom wallet',
        downloadUrl: 'https://phantom.app/',
        isInstalled: this.isPhantomInstalled(),
        isAvailable: true,
      },
    ];
  }

  /**
   * Connect to a specific wallet
   */
  async connect(
    walletType: WalletType,
    options: ConnectOptions = {}
  ): Promise<WalletConnection> {
    try {
      options.onConnecting?.();

      switch (walletType) {
        case WalletType.METAMASK:
          return await this.connectMetaMask(options);
        case WalletType.COINBASE:
          return await this.connectCoinbase(options);
        case WalletType.WALLET_CONNECT:
          return await this.connectWalletConnect(options);
        case WalletType.TRUST:
          return await this.connectTrust(options);
        case WalletType.RAINBOW:
          return await this.connectRainbow(options);
        case WalletType.BRAVE:
          return await this.connectBrave(options);
        case WalletType.PHANTOM:
          return await this.connectPhantom(options);
        default:
          return await this.connectInjected(options);
      }
    } catch (error: any) {
      const walletError: WalletError = {
        code: error.code || -1,
        message: error.message || 'Failed to connect wallet',
        data: error,
      };
      options.onError?.(walletError);
      throw walletError;
    }
  }

  /**
   * Connect MetaMask
   */
  private async connectMetaMask(options: ConnectOptions): Promise<WalletConnection> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.METAMASK;

    if (options.chainId && this.chainId !== options.chainId) {
      await this.switchChain(options.chainId);
    }

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Connect Coinbase Wallet
   */
  private async connectCoinbase(options: ConnectOptions): Promise<WalletConnection> {
    try {
      // Try to use Coinbase extension first
      if (this.isCoinbaseInstalled() && window.coinbaseWalletExtension) {
        const ethereum = window.coinbaseWalletExtension;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        this.provider = new ethers.BrowserProvider(ethereum);
        this.signer = await this.provider.getSigner();
        this.account = accounts[0].toLowerCase();
        const network = await this.provider.getNetwork();
        this.chainId = Number(network.chainId);
        this.walletType = WalletType.COINBASE;

        return {
          provider: this.provider,
          signer: this.signer,
          account: this.account,
          chainId: this.chainId,
          walletType: this.walletType,
        };
      }

      // Fallback: Use Coinbase SDK (requires installation via npm)
      // This will be available once npm packages are installed
      throw new Error('Coinbase Wallet SDK initialization requires @coinbase/wallet-sdk package');
    } catch (error) {
      throw new Error('Coinbase Wallet is not available');
    }
  }

  /**
   * Connect WalletConnect
   */
  private async connectWalletConnect(options: ConnectOptions): Promise<WalletConnection> {
    try {
      // This will work once @walletconnect/ethereum-provider is installed
      throw new Error('WalletConnect initialization requires @walletconnect/ethereum-provider package');
    } catch (error) {
      throw new Error('WalletConnect is not available');
    }
  }

  /**
   * Connect Trust Wallet
   */
  private async connectTrust(options: ConnectOptions): Promise<WalletConnection> {
    if (!this.isTrustInstalled()) {
      throw new Error('Trust Wallet is not installed');
    }

    const ethereum = window.ethereum || window.trustWallet;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.TRUST;

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Connect Rainbow
   */
  private async connectRainbow(options: ConnectOptions): Promise<WalletConnection> {
    if (!this.isRainbowInstalled()) {
      throw new Error('Rainbow Wallet is not installed');
    }

    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.RAINBOW;

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Connect Brave Wallet
   */
  private async connectBrave(options: ConnectOptions): Promise<WalletConnection> {
    if (!this.isBraveInstalled()) {
      throw new Error('Brave Wallet is not available');
    }

    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.BRAVE;

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Connect Phantom
   */
  private async connectPhantom(options: ConnectOptions): Promise<WalletConnection> {
    if (!this.isPhantomInstalled()) {
      throw new Error('Phantom Wallet is not installed');
    }

    const ethereum = window.phantom?.ethereum || window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.PHANTOM;

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Connect any injected wallet
   */
  private async connectInjected(options: ConnectOptions): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet detected');
    }

    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0].toLowerCase();
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    this.walletType = WalletType.INJECTED;

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId,
      walletType: this.walletType,
    };
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (this.walletConnectProvider) {
      await this.walletConnectProvider.disconnect();
      this.walletConnectProvider = null;
    }

    if (this.coinbaseProvider) {
      await this.coinbaseProvider.disconnect();
      this.coinbaseProvider = null;
    }

    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.walletType = null;
  }

  /**
   * Switch to a different chain
   */
  async switchChain(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No wallet connected');
    }

    const chainConfig = SUPPORTED_CHAINS[chainId];
    if (!chainConfig) {
      throw new Error(`Chain ${chainId} is not supported`);
    }

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      this.chainId = chainId;
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        await this.addChain(chainConfig);
      } else {
        throw error;
      }
    }
  }

  /**
   * Add a new chain to wallet
   */
  async addChain(chainConfig: ChainConfig): Promise<void> {
    if (!window.ethereum) {
      throw new Error('No wallet connected');
    }

    const hexChainId = `0x${chainConfig.chainId.toString(16)}`;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexChainId,
          chainName: chainConfig.chainName,
          nativeCurrency: chainConfig.nativeCurrency,
          rpcUrls: chainConfig.rpcUrls,
          blockExplorerUrls: chainConfig.blockExplorerUrls,
        },
      ],
    });

    this.chainId = chainConfig.chainId;
  }

  /**
   * Get current connection
   */
  getConnection(): WalletConnection | null {
    if (!this.account || !this.provider) {
      return null;
    }

    return {
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      chainId: this.chainId!,
      walletType: this.walletType!,
    };
  }

  /**
   * Check if MetaMask is installed
   */
  private isMetaMaskInstalled(): boolean {
    return !!(window.ethereum && window.ethereum.isMetaMask);
  }

  /**
   * Check if Coinbase is installed
   */
  private isCoinbaseInstalled(): boolean {
    return !!(
      window.ethereum?.isCoinbaseWallet ||
      window.coinbaseWalletExtension
    );
  }

  /**
   * Check if Trust Wallet is installed
   */
  private isTrustInstalled(): boolean {
    return !!(window.ethereum?.isTrust || window.trustWallet);
  }

  /**
   * Check if Rainbow is installed
   */
  private isRainbowInstalled(): boolean {
    return !!(window.ethereum?.isRainbow);
  }

  /**
   * Check if Brave Wallet is installed
   */
  private isBraveInstalled(): boolean {
    return !!(window.ethereum?.isBraveWallet);
  }

  /**
   * Check if Phantom is installed
   */
  private isPhantomInstalled(): boolean {
    return !!(window.phantom?.ethereum || window.ethereum?.isPhantom);
  }

  /**
   * Listen to wallet events
   */
  on(event: string, handler: (data?: any) => void): void {
    if (!window.ethereum) return;

    window.ethereum.on(event, handler);
  }

  /**
   * Remove wallet event listener
   */
  off(event: string, handler: (data?: any) => void): void {
    if (!window.ethereum) return;

    window.ethereum.off?.(event, handler);
    window.ethereum.removeListener?.(event, handler);
  }
}

export const walletConnector = new MultiWalletConnector({
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  appName: 'BitArt Market',
  appLogoUrl: '/logo.png',
});

export default MultiWalletConnector;
