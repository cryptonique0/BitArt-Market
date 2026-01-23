# Multi-Chain Toolkit - Complete Feature Documentation

## Overview

Comprehensive multi-chain EVM toolkit with gas optimization, price feeds, cross-chain bridges, transaction monitoring, and network analysis.

## 📦 New Components

### 1. **NetworkStatsPanel** (`NetworkStatsPanel.tsx`)

Displays real-time network statistics and recommendations.

**Features:**

- Gas price tracking for all networks
- Transaction cost estimation (simple, NFT, swap)
- Network health indicators
- TVL and daily volume display
- Recommendations for cheapest/fastest chains

**Usage:**

```tsx
import { NetworkStatsPanel } from '@/components/ChainKit';

<NetworkStatsPanel chainId={8453} />;
```

**Props:**

- `chainId?` (number) - Specific chain to display

---

### 2. **MultiChainBalance** (`MultiChainBalance.tsx`)

Aggregates user balances across all connected chains with portfolio tracking.

**Features:**

- Real-time balance tracking across chains
- ETH and token balance aggregation
- Portfolio value in USD
- Per-chain breakdown
- Price feeds integration

**Usage:**

```tsx
import { MultiChainBalance } from '@/components/ChainKit';

const balances = [
  {
    chainId: 1,
    chainName: 'Ethereum',
    nativeBalance: 2.5,
    tokens: [{ symbol: 'USDC', address: '0xa0b...', amount: 1000 }],
  },
  // ... more chains
];

<MultiChainBalance balances={balances} />;
```

---

### 3. **BridgeIntegration** (`BridgeIntegration.tsx`)

Cross-chain bridge operations support.

**Supported Bridges:**

- Across Protocol
- Stargate Finance
- Celer Network
- Connext
- Symbiosis

**Features:**

- Bridge route comparison
- Fee estimation
- Time estimates
- Automatic optimal routing

**Usage:**

```tsx
import { BridgeIntegration } from '@/components/ChainKit';

<BridgeIntegration
  fromChainId={1}
  toChainId={8453}
  tokenAddress="0x..."
  amount="1"
  onBridgeSelected={route => console.log(route)}
/>;
```

---

### 4. **TransactionMonitor** (`TransactionMonitor.tsx`)

Real-time transaction tracking across all chains.

**Features:**

- Transaction history display
- Status tracking (pending, confirmed, failed)
- Metrics dashboard
- Filter by status
- Pending transaction alerts

**Usage:**

```tsx
import { TransactionMonitor } from '@/components/ChainKit';

<TransactionMonitor userAddress="0x..." chainIds={[1, 8453, 10, 42161]} limit={20} />;
```

---

### 5. **NetworkSelectorModal** (`NetworkSelectorModal.tsx`)

Advanced network switching with gas price comparison.

**Features:**

- Sortable network list
- Cost/speed/name sorting
- Optimal chain highlighting
- Real-time gas price display
- Uptime indicators

**Usage:**

```tsx
import { NetworkSelectorModal } from '@/components/ChainKit';

const [isOpen, setIsOpen] = useState(false);

<NetworkSelectorModal
  isOpen={isOpen}
  currentChainId={8453}
  availableChainIds={[1, 8453, 10, 42161]}
  operationType="nft"
  onSelectChain={chainId => switchChain(chainId)}
  onClose={() => setIsOpen(false)}
/>;
```

---

## 🔧 Services

### 1. **Network Stats Service** (`networkStats.ts`)

```typescript
// Get stats for specific chain
const stats = await getNetworkStats(8453);

// Get stats for all chains
const allStats = await getAllNetworkStats([1, 8453, 10, 42161]);

// Find cheapest chain for operation
const cheapest = findCheapestChain(stats, 'nft');

// Get chain recommendation
const recommended = getChainRecommendation(stats, {
  priority: 'balanced',
  operationType: 'nft',
});
```

### 2. **Price Feed Service** (`priceFeed.ts`)

```typescript
// Get ETH price
const ethPrice = await getNativeAssetPrice(1);

// Get token price
const usdcPrice = await getTokenPrice('0xa0b...', 1);

// Calculate portfolio value
const portfolio = await calculatePortfolioValue([
  {
    chainId: 1,
    chainName: 'Ethereum',
    nativeBalance: 2.5,
    tokens: [...]
  }
]);

// Format for display
const formatted = formatPrice(1250.50, 2); // "$1,250.50"
```

### 3. **Bridge Service** (`bridge.ts`)

```typescript
// Get available bridges
const bridges = getAvailableBridges(1, 8453);

// Estimate bridge route
const route = await estimateBridgeRoute(1, 8453, '0x...', '1');

// Get bridge transaction data
const txData = await getBridgeTxData(route.bestRoute, userAddress);

// Track bridge status
const status = await getBridgeStatus('across', txHash, 1, 8453);
```

### 4. **Transaction Monitor Service** (`transactionMonitor.ts`)

```typescript
// Track transaction
trackTransaction(txHash, chainId, {
  from: userAddress,
  to: contractAddress,
  type: 'swap',
  value: '1',
  status: 'pending',
});

// Get transaction status
const tx = await getTransactionStatus(chainId, txHash);

// Get history
const history = await getTransactionHistory(userAddress, [1, 8453, 10], 50);

// Wait for confirmation
const confirmed = await waitForTransactionConfirmation(chainId, txHash, 12);

// Get metrics
const metrics = calculateTransactionMetrics(transactions);
```

### 5. **Gas Optimizer Service** (`gasOptimizer.ts`)

```typescript
// Find optimal chain
const optimization = await findOptimalChain('nft', [1, 8453, 10]);

// Estimate transaction path cost
const pathCost = await estimateTransactionPath(1, 8453, 'nft', true);

// Compare chains
const comparison = await compareChains([1, 8453, 10], 'nft');

// Optimize batch operations
const batch = await optimizeBatchOperations(
  [
    { type: 'simple', count: 5 },
    { type: 'nft', count: 2 },
  ],
  [1, 8453, 10]
);
```

---

## 🎨 UI Integration Examples

### Dashboard Integration

```tsx
import { NetworkStatsPanel, MultiChainBalance, TransactionMonitor } from '@/components/ChainKit';

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Column - Stats */}
      <div className="lg:col-span-2">
        <NetworkStatsPanel chainId={currentChainId} />
      </div>

      {/* Right Column - Balance */}
      <div>
        <MultiChainBalance balances={userBalances} />
      </div>

      {/* Full Width - Transactions */}
      <div className="lg:col-span-3">
        <TransactionMonitor userAddress={address} chainIds={supportedChains} />
      </div>
    </div>
  );
}
```

### Bridge Page

```tsx
import { BridgeIntegration, NetworkSelectorModal } from '@/components/ChainKit';

export function BridgePage() {
  const [fromChain, setFromChain] = useState(1);
  const [toChain, setToChain] = useState(8453);
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Cross-Chain Bridge</h1>

      <div className="space-y-4 mt-6">
        <button onClick={() => setShowSelector(true)}>
          Switch Chain: {getChainName(fromChain)}
        </button>

        <BridgeIntegration
          fromChainId={fromChain}
          toChainId={toChain}
          tokenAddress="0x0000000000000000000000000000000000000000"
          amount="1"
          onBridgeSelected={route => console.log('Selected:', route)}
        />
      </div>

      <NetworkSelectorModal
        isOpen={showSelector}
        currentChainId={fromChain}
        availableChainIds={[1, 8453, 10, 42161]}
        operationType="simple"
        onSelectChain={chainId => {
          setFromChain(chainId);
          setShowSelector(false);
        }}
        onClose={() => setShowSelector(false)}
      />
    </div>
  );
}
```

---

## 📊 Data Structures

### NetworkStats

```typescript
{
  chainId: 1,
  chainName: 'Ethereum',
  gasPrice: {
    standard: 45,
    fast: 52,
    instant: 65,
    gwei: '45.2'
  },
  blockTime: 12,
  txCost: {
    simple: 0.015,
    nft: 0.08,
    swap: 0.12
  },
  tvl: '$35.2B',
  dailyVolume: '$15.8B',
  activeUsers: 245000,
  health: {
    status: 'healthy',
    uptime: 99.97,
    avgLatency: 280
  }
}
```

### BridgeOption

```typescript
{
  id: 'across',
  name: 'Across Protocol',
  fromChain: 1,
  toChain: 8453,
  tokenAddress: '0x...',
  amount: '1',
  estimatedGas: 100000,
  estimatedTime: 5,
  fee: 0.001,
  feePercentage: 0.1,
  receiveAmount: '0.999',
  minReceiveAmount: '0.998',
  slippage: 0.5
}
```

### Transaction

```typescript
{
  hash: '0x...',
  chainId: 8453,
  from: '0x...',
  to: '0x...',
  type: 'swap',
  value: '1',
  gasUsed: '100000',
  gasPaid: '0.001',
  status: 'confirmed',
  timestamp: 1234567890,
  blockNumber: 1000000,
  confirmations: 100
}
```

---

## 🚀 Advanced Usage

### Multi-Chain Portfolio Dashboard

```tsx
import { MultiChainBalance, NetworkStatsPanel, TransactionMonitor } from '@/components/ChainKit';
import { useAccount } from 'wagmi';

export function PortfolioDashboard() {
  const { address } = useAccount();
  const [balances, setBalances] = useState([]);

  // Load balances from all chains
  useEffect(() => {
    loadMultiChainBalances(address);
  }, [address]);

  return (
    <div className="space-y-8 p-8">
      <MultiChainBalance balances={balances} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetworkStatsPanel />
        <div>
          <h3>Quick Tips</h3>
          <ul>
            <li>Base has cheapest gas for NFTs</li>
            <li>Optimism offers fastest finality</li>
            <li>Ethereum is most secure</li>
          </ul>
        </div>
      </div>

      <TransactionMonitor userAddress={address} chainIds={[1, 8453, 10, 42161]} />
    </div>
  );
}
```

### Gas-Optimized Trading

```tsx
import { findOptimalChain } from '@/services/gasOptimizer';

async function executeOptimizedSwap(amount: number) {
  const optimization = await findOptimalChain('swap', availableChains);

  console.log(`Recommended: ${optimization.recommendedChain.chainName}`);
  console.log(`Savings: ${optimization.savingsPercent.toFixed(1)}%`);

  // Execute swap on recommended chain
  await switchChain(optimization.recommendedChain.chainId);
  await executeSwap(amount);
}
```

---

## 📈 Performance Considerations

1. **Caching**: Price and stats data is cached for 1 minute to reduce RPC calls
2. **Polling**: Transaction monitor polls every 5 seconds for updates
3. **Batch Requests**: Multiple chains queried in parallel
4. **Lazy Loading**: Components load data only when needed

---

## 🔗 API Integration Points

Replace mock data in services with real APIs:

**Price Feeds:**

- Chainlink: https://docs.chain.link/data-feeds
- CoinGecko: https://www.coingecko.com/en/api

**Transaction Data:**

- Moralis: https://docs.moralis.io
- Covalent: https://www.covalenthq.com/docs
- The Graph: https://thegraph.com

**Bridges:**

- Across: https://docs.across.to
- Stargate: https://stargateprotocol.gitbook.io
- Connext: https://sdk-docs.connext.network

---

## 📝 License

Part of BitArt Market - Multi-Chain NFT Marketplace
