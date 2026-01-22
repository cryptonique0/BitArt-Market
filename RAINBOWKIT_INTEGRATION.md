# RainbowKit Integration Guide

## Overview

BitArt Market now includes **RainbowKit** integration - a premium wallet connection solution that provides a beautiful, modern UI for connecting to Web3 wallets. RainbowKit offers the best wallet connection experience with support for 100+ wallets out of the box.

## Features

### 🎨 Beautiful UI

- Modern, polished design
- Smooth animations and transitions
- Dark mode support
- Mobile-responsive

### 🔗 Extensive Wallet Support

RainbowKit supports all major wallets including:

- MetaMask
- Rainbow
- Coinbase Wallet
- WalletConnect (all compatible wallets)
- Trust Wallet
- Ledger
- Argent
- Brave Wallet
- And 100+ more...

### ⚡ Key Features

- Recent wallet connection memory
- Network/chain switching
- ENS name resolution
- Balance display
- Avatar support
- QR code scanning for mobile
- Cool mode (fun animations)

## Installation

The following packages have been installed:

```bash
npm install @rainbow-me/rainbowkit wagmi viem
```

## Configuration

### 1. RainbowKit Config (`frontend/src/config/rainbowkit.ts`)

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, base, baseSepolia, polygon, arbitrum, optimism } from 'wagmi/chains';

export const rainbowkitConfig = getDefaultConfig({
  appName: 'BitArt Market',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, sepolia, base, baseSepolia, polygon, arbitrum, optimism],
  ssr: false,
});
```

### 2. Provider Setup (`frontend/src/main.tsx`)

```typescript
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { rainbowkitConfig } from './config/rainbowkit';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={rainbowkitConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
```

## Usage

### Toggle RainbowKit vs Custom Wallet UI

RainbowKit can be toggled on/off via environment variable:

```bash
# .env
VITE_USE_RAINBOWKIT=true   # Use RainbowKit UI
VITE_USE_RAINBOWKIT=false  # Use custom wallet modal
```

### Using the RainbowKit Connect Button

```typescript
import { RainbowKitConnectButton } from './components/RainbowKitConnectButton';

function MyComponent() {
  return <RainbowKitConnectButton />;
}
```

### Using Standard RainbowKit Button

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';

function MyComponent() {
  return <ConnectButton />;
}
```

### Custom Button Styles

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';

function MyComponent() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        return (
          <div>
            {!account ? (
              <button onClick={openConnectModal}>
                Connect Wallet
              </button>
            ) : (
              <div>
                <button onClick={openChainModal}>
                  {chain?.name}
                </button>
                <button onClick={openAccountModal}>
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
```

## Wagmi Hooks

RainbowKit is built on wagmi, giving you access to powerful React hooks:

### useAccount

```typescript
import { useAccount } from 'wagmi';

function Component() {
  const { address, isConnected, chain } = useAccount();

  return (
    <div>
      {isConnected && <p>Connected to {address}</p>}
      {chain && <p>Chain: {chain.name}</p>}
    </div>
  );
}
```

### useBalance

```typescript
import { useBalance } from 'wagmi';

function Component() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  return <div>Balance: {balance?.formatted} {balance?.symbol}</div>;
}
```

### useEnsName & useEnsAvatar

```typescript
import { useEnsName, useEnsAvatar } from 'wagmi';

function Component() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });

  return (
    <div>
      {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
      <p>{ensName || address}</p>
    </div>
  );
}
```

### useContractRead & useContractWrite

```typescript
import { useContractRead, useContractWrite } from 'wagmi';

function NFTComponent() {
  const { data: tokenURI } = useContractRead({
    address: '0x...',
    abi: nftABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { write: mint } = useContractWrite({
    address: '0x...',
    abi: nftABI,
    functionName: 'mint',
  });

  return (
    <div>
      <p>Token URI: {tokenURI}</p>
      <button onClick={() => mint()}>Mint NFT</button>
    </div>
  );
}
```

## Customization

### Theme Customization

```typescript
<RainbowKitProvider
  theme={{
    lightMode: lightTheme({
      accentColor: '#0E76FD',
      borderRadius: 'large',
    }),
    darkMode: darkTheme({
      accentColor: '#0E76FD',
      borderRadius: 'large',
    }),
  }}
>
  <App />
</RainbowKitProvider>
```

### Available Themes

- `lightTheme()`
- `darkTheme()`
- `midnightTheme()`

### Custom Chains

```typescript
import { Chain } from 'wagmi/chains';

const customChain: Chain = {
  id: 12345,
  name: 'Custom Network',
  nativeCurrency: {
    name: 'Custom Token',
    symbol: 'CTK',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.custom.network'] },
    public: { http: ['https://rpc.custom.network'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.custom.network' },
  },
};
```

### Cool Mode

Enable fun animations:

```typescript
<RainbowKitProvider coolMode>
  <App />
</RainbowKitProvider>
```

## Advanced Features

### Modal Size

```typescript
<RainbowKitProvider modalSize="compact"> {/* or "wide" */}
  <App />
</RainbowKitProvider>
```

### Initial Chain

```typescript
<RainbowKitProvider initialChain={base}>
  <App />
</RainbowKitProvider>
```

### Show Recent Transactions

```typescript
<RainbowKitProvider showRecentTransactions={true}>
  <App />
</RainbowKitProvider>
```

### App Info

```typescript
<RainbowKitProvider
  appInfo={{
    appName: 'BitArt Market',
    learnMoreUrl: 'https://bitart.market/learn',
  }}
>
  <App />
</RainbowKitProvider>
```

## Integration with Existing Code

The RainbowKit integration is designed to work alongside our custom wallet system:

1. **Toggle Mode**: Use `VITE_USE_RAINBOWKIT=true` to enable RainbowKit UI
2. **Hybrid Approach**: Keep both systems for maximum flexibility
3. **Wagmi Hooks**: Use wagmi hooks for blockchain interactions
4. **Context Sync**: `useRainbowKitSync` hook syncs state between systems

## Supported Chains

- ✅ Ethereum Mainnet
- ✅ Sepolia Testnet
- ✅ Base Mainnet
- ✅ Base Sepolia
- ✅ Polygon
- ✅ Arbitrum One
- ✅ Optimism

## Environment Variables

```bash
# Required for WalletConnect in RainbowKit
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Toggle RainbowKit UI
VITE_USE_RAINBOWKIT=true
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

## Best Practices

1. **Use wagmi hooks** for blockchain interactions instead of ethers directly
2. **Enable cool mode** for a fun user experience
3. **Customize theme** to match your brand
4. **Show recent transactions** for better UX
5. **Set initial chain** to your preferred network
6. **Use ENS** for better address display

## Migration from Custom Wallet

If migrating from custom wallet code to RainbowKit:

```typescript
// Before (Custom)
const { account, connectWallet } = useWallet();
await connectWallet(WalletType.METAMASK);

// After (RainbowKit + wagmi)
import { useAccount, useConnect } from 'wagmi';
const { address } = useAccount();
const { connect, connectors } = useConnect();
```

## Troubleshooting

### Wallet Not Connecting

- Check WalletConnect Project ID is set
- Verify network is supported
- Clear browser cache and wallet cache

### Wrong Network

- Use chain switching in RainbowKit UI
- Configure chains in rainbowkit config
- Check RPC URLs are correct

### Styling Issues

- Import RainbowKit CSS: `@rainbow-me/rainbowkit/styles.css`
- Check Tailwind CSS doesn't conflict
- Use custom theme if needed

## Resources

- [RainbowKit Documentation](https://rainbowkit.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [WalletConnect](https://walletconnect.com)

## Examples

See these components for implementation examples:

- `frontend/src/components/RainbowKitConnectButton.tsx`
- `frontend/src/hooks/useRainbowKitSync.ts`
- `frontend/src/config/rainbowkit.ts`

---

**Status**: ✅ Production Ready  
**Last Updated**: January 23, 2026
