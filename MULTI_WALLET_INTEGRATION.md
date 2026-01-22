# Multi-Wallet Integration Guide

## Overview

BitArt Market now supports comprehensive Web3 wallet integration with multiple wallet providers. Users can connect using their preferred wallet with a seamless, user-friendly experience.

## Supported Wallets

### ✅ Fully Supported Wallets

1. **MetaMask** 🦊
   - Most popular Ethereum wallet
   - Browser extension & mobile app
   - Auto-detection of installation

2. **Coinbase Wallet** 💼
   - Native Coinbase integration
   - Browser extension & mobile app
   - Supports Coinbase-specific features

3. **Trust Wallet** 🛡️
   - Multi-chain mobile wallet
   - DApp browser support
   - Auto-detection

4. **Rainbow** 🌈
   - Modern, user-friendly wallet
   - iOS & Android apps
   - Beautiful UX

5. **Brave Wallet** 🦁
   - Built into Brave browser
   - Privacy-focused
   - Auto-detected in Brave

6. **Phantom** 👻
   - Cross-chain wallet
   - Browser extension
   - Modern interface

7. **WalletConnect** 🔗
   - QR code connection
   - Works with 100+ wallets
   - Mobile wallet support

### 🔧 Technical Implementation

## File Structure

```
frontend/src/
├── types/
│   └── wallet.ts                      # Wallet type definitions
├── services/
│   ├── multi-wallet-connector.ts      # Multi-wallet connection service
│   └── wallet.ts                      # Enhanced wallet service
├── context/
│   └── WalletContext.tsx              # Wallet context with multi-wallet support
└── components/
    └── WalletSelectionModal.tsx       # Wallet selection UI
```

## Key Features

### 1. **Wallet Detection**

- Automatic detection of installed wallets
- Show "Install" option for non-installed wallets
- Smart provider detection for multi-wallet environments

### 2. **Connection Management**

```typescript
import { useWallet } from '../context/WalletContext';
import { WalletType } from '../types/wallet';

const { connectWallet, account, walletType } = useWallet();

// Connect to specific wallet
await connectWallet(WalletType.METAMASK);
await connectWallet(WalletType.COINBASE);
await connectWallet(WalletType.WALLET_CONNECT);
```

### 3. **Chain Switching**

```typescript
const { switchChain } = useWallet();

// Switch to different networks
await switchChain(1); // Ethereum Mainnet
await switchChain(8453); // Base Mainnet
await switchChain(84532); // Base Sepolia
await switchChain(137); // Polygon
```

### 4. **Supported Networks**

- Ethereum Mainnet (Chain ID: 1)
- Sepolia Testnet (Chain ID: 11155111)
- Base Mainnet (Chain ID: 8453)
- Base Sepolia (Chain ID: 84532)
- Polygon (Chain ID: 137)
- Arbitrum One (Chain ID: 42161)
- Optimism (Chain ID: 10)

## Usage Examples

### Basic Wallet Connection

```typescript
import { WalletSelectionModal } from '../components/WalletSelectionModal';
import { useWallet } from '../context/WalletContext';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const { account, walletType, isConnecting } = useWallet();

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Connect Wallet
      </button>

      <WalletSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {account && (
        <div>
          Connected: {account} via {walletType}
        </div>
      )}
    </>
  );
}
```

### Direct Wallet Connection

```typescript
import { walletConnector } from '../services/multi-wallet-connector';
import { WalletType } from '../types/wallet';

// Connect to MetaMask
const connection = await walletConnector.connect(WalletType.METAMASK);
console.log('Account:', connection.account);
console.log('Chain ID:', connection.chainId);
console.log('Provider:', connection.provider);

// Switch to Base network
await walletConnector.switchChain(8453);

// Disconnect
await walletConnector.disconnect();
```

### Check Wallet Availability

```typescript
import { walletService } from '../services/wallet';
import { WalletType } from '../types/wallet';

// Get all available wallets
const wallets = walletService.getAvailableWallets();

// Check if specific wallet is installed
const hasMetaMask = walletService.isWalletTypeInstalled(WalletType.METAMASK);
const hasCoinbase = walletService.isWalletTypeInstalled(WalletType.COINBASE);
```

## Environment Variables

Add to your `.env` file:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: RPC URLs for different chains
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
```

## Installation

The multi-wallet integration uses the following packages:

```bash
npm install ethers@^6.0.0
npm install @walletconnect/ethereum-provider@^2.11.0
npm install @coinbase/wallet-sdk@^3.9.1
```

## User Experience

### Wallet Selection Flow

1. User clicks "Connect Wallet" button
2. Modal displays all available wallets
3. Installed wallets are highlighted and clickable
4. Non-installed wallets show "Install" button
5. User selects wallet → connection initiated
6. Success → Modal closes, user is connected
7. Wallet badge shows connected wallet type

### Connection States

- **Disconnected**: "Connect Wallet" button visible
- **Connecting**: Loading spinner, button disabled
- **Connected**: Shows user address, wallet badge, disconnect option
- **Error**: Error message displayed, retry option available

## Error Handling

```typescript
const { error, connectWallet } = useWallet();

try {
  await connectWallet(WalletType.METAMASK);
} catch (err) {
  if (err.code === 4001) {
    // User rejected connection
  } else if (err.code === 4902) {
    // Chain not added to wallet
  } else if (err.code === -32002) {
    // Request already pending
  }
}
```

## Event Listeners

```typescript
import { walletConnector } from '../services/multi-wallet-connector';

// Listen for account changes
walletConnector.on('accountsChanged', accounts => {
  console.log('Account changed:', accounts[0]);
});

// Listen for chain changes
walletConnector.on('chainChanged', chainId => {
  console.log('Chain changed:', chainId);
});

// Listen for disconnection
walletConnector.on('disconnect', () => {
  console.log('Wallet disconnected');
});
```

## Best Practices

1. **Always check wallet installation** before attempting connection
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during connection process
4. **Persist wallet type** in localStorage for reconnection
5. **Listen to wallet events** for account/chain changes
6. **Provide fallback** for users without wallets
7. **Test on multiple wallets** before deployment

## Mobile Support

- Mobile wallets supported via WalletConnect
- Deep linking for Trust Wallet, Rainbow, etc.
- QR code scanning for desktop → mobile connection
- Responsive wallet selection modal

## Security Considerations

- Never store private keys
- Validate all wallet addresses
- Check chain ID before transactions
- Use secure RPC endpoints
- Implement proper error boundaries
- Rate limit connection attempts

## Future Enhancements

- [ ] Ledger hardware wallet support (via Ledger Connect)
- [ ] Trezor hardware wallet support
- [ ] Multi-sig wallet support (Gnosis Safe)
- [ ] Social login wallets (Magic Link, Web3Auth)
- [ ] Wallet analytics and usage tracking
- [ ] Preferred wallet persistence
- [ ] Auto-reconnect on page load

## Troubleshooting

### Wallet Not Detected

```typescript
// Check if wallet is installed
if (!window.ethereum) {
  alert('Please install MetaMask or another Web3 wallet');
  window.open('https://metamask.io/download/');
}
```

### Multiple Wallets Conflict

```typescript
// The connector handles multiple wallet scenarios automatically
// It will prefer MetaMask if available, or use the first detected wallet
```

### Connection Fails

```typescript
// Check for common issues
1. Wallet is locked → Ask user to unlock
2. Wrong network → Prompt to switch
3. Pending request → Cancel and retry
4. Browser extension conflict → Disable conflicting extensions
```

## Support

For issues or questions:

- Check wallet provider documentation
- Review browser console for errors
- Test in incognito mode to rule out extensions
- Try different wallet provider

## Version History

- **v1.0.0** - Initial multi-wallet integration
  - MetaMask, Coinbase, Trust, Rainbow, Brave, Phantom
  - WalletConnect support
  - Multi-chain support
  - Wallet selection modal

---

**Happy Building! 🚀**
