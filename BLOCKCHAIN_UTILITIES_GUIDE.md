# Blockchain Utilities Documentation

## Overview

The BitArt Market frontend includes comprehensive blockchain utility functions organized into two main modules:

- **blockchain.ts** - Core blockchain utilities (addresses, numbers, formatting, validation)
- **wagmi.ts** - Wagmi-specific utilities (accounts, balances, networks)
- **index.ts** - Central export point for all utilities

## Installation

All required packages are already installed:

```json
{
  "ethers": "^6.x",
  "@ethersproject/units": "^5.7.0",
  "@ethersproject/bignumber": "^5.7.0",
  "@ethersproject/address": "^5.7.0",
  "bn.js": "^5.2.1",
  "decimal.js": "^10.4.3",
  "@wagmi/core": "^2.x",
  "abitype": "^1.x"
}
```

## Usage

### Import Utilities

```typescript
// Import from central index
import {
  formatEther,
  shortenAddress,
  calculateGasCost,
  getCurrentChainId,
  isWalletConnected,
} from '@/utils';

// Or import from specific modules
import { formatEther, shortenAddress } from '@/utils/blockchain';
import { getCurrentChainId, isWalletConnected } from '@/utils/wagmi';
```

## Blockchain Utilities (blockchain.ts)

### Address Utilities

#### `validateAddress(address: string): boolean`

Validates an Ethereum address using ethers.js

```typescript
import { validateAddress } from '@/utils';

if (validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')) {
  console.log('Valid address');
}
```

#### `shortenAddress(address: string, chars?: number): string`

Formats address to shortened version (default: 4 chars)

```typescript
import { shortenAddress } from '@/utils';

const short = shortenAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
// Returns: "0x742d...0bEb"

const shorter = shortenAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 3);
// Returns: "0x742...bEb"
```

#### `addressesEqual(address1: string, address2: string): boolean`

Compare two addresses (case-insensitive)

```typescript
import { addressesEqual } from '@/utils';

if (addressesEqual(userAddress, contractAddress)) {
  console.log('Same address');
}
```

### Number Formatting

#### `formatEther(wei: string | bigint, decimals?: number): string`

Format Wei to ETH

```typescript
import { formatEther } from '@/utils';

const eth = formatEther('1000000000000000000'); // "1.0"
const ethDecimals = formatEther('1500000000000000000', 4); // "1.5000"
```

#### `formatGwei(wei: string | bigint, decimals?: number): string`

Format Wei to Gwei

```typescript
import { formatGwei } from '@/utils';

const gwei = formatGwei('30000000000'); // "30.0"
```

#### `formatTokenAmount(amount: string | bigint, decimals: number, displayDecimals?: number): string`

Format token amount with custom decimals

```typescript
import { formatTokenAmount } from '@/utils';

// USDC (6 decimals)
const usdc = formatTokenAmount('1000000', 6); // "1.0"

// DAI (18 decimals)
const dai = formatTokenAmount('1000000000000000000', 18); // "1.0"
```

### Number Parsing

#### `parseEther(ether: string): bigint`

Parse ETH to Wei

```typescript
import { parseEther } from '@/utils';

const wei = parseEther('1.5'); // 1500000000000000000n
```

#### `parseTokenAmount(amount: string, decimals: number): bigint`

Parse token amount to smallest unit

```typescript
import { parseTokenAmount } from '@/utils';

const usdcAmount = parseTokenAmount('100', 6); // 100000000n
```

### BigNumber Operations

#### `compareBigNumbers(a: BigNumber, b: BigNumber): number`

Compare two BigNumbers (-1, 0, 1)

```typescript
import { compareBigNumbers, parseEther } from '@/utils';
import { BigNumber } from '@ethersproject/bignumber';

const a = BigNumber.from(parseEther('1'));
const b = BigNumber.from(parseEther('2'));

if (compareBigNumbers(a, b) < 0) {
  console.log('a is less than b');
}
```

#### `isZero(value: BigNumber): boolean`

Check if BigNumber is zero

```typescript
import { isZero } from '@/utils';
import { BigNumber } from '@ethersproject/bignumber';

if (isZero(BigNumber.from(0))) {
  console.log('Value is zero');
}
```

### BN.js Operations

#### `addBN(a: BN, b: BN): BN`

Add two BN.js numbers

```typescript
import { addBN } from '@/utils';
import BN from 'bn.js';

const sum = addBN(new BN('100'), new BN('200')); // BN(300)
```

#### `multiplyBN(a: BN, b: BN): BN`

Multiply two BN.js numbers

```typescript
import { multiplyBN } from '@/utils';
import BN from 'bn.js';

const product = multiplyBN(new BN('5'), new BN('10')); // BN(50)
```

### Decimal.js Operations

#### `calculatePercentage(value: string | number, percentage: number): string`

Calculate percentage with high precision

```typescript
import { calculatePercentage } from '@/utils';

const result = calculatePercentage('100', 15.5); // "15.5"
const royalty = calculatePercentage('1000', 2.5); // "25"
```

#### `calculatePriceImpact(oldPrice: string | number, newPrice: string | number): string`

Calculate price impact percentage

```typescript
import { calculatePriceImpact } from '@/utils';

const impact = calculatePriceImpact('100', '95'); // "5" (5% decrease)
```

### Gas Utilities

#### `calculateGasCost(gasUsed: string | bigint, gasPrice: string | bigint): string`

Calculate total gas cost in ETH

```typescript
import { calculateGasCost } from '@/utils';

const cost = calculateGasCost('21000', '30000000000'); // ETH cost
```

#### `estimateGasCostUSD(gasCostEth: string, ethPrice: number): string`

Convert gas cost to USD

```typescript
import { estimateGasCostUSD } from '@/utils';

const usdCost = estimateGasCostUSD('0.0063', 2000); // "$12.60"
```

### Currency Formatting

#### `formatUSD(amount: string | number, decimals?: number): string`

Format amount as USD

```typescript
import { formatUSD } from '@/utils';

const price = formatUSD(1234.56); // "$1,234.56"
const precise = formatUSD(0.123456, 4); // "$0.1235"
```

#### `formatCompactNumber(value: string | number): string`

Format large numbers compactly (K, M, B)

```typescript
import { formatCompactNumber } from '@/utils';

console.log(formatCompactNumber(1500)); // "1.5K"
console.log(formatCompactNumber(1000000)); // "1M"
console.log(formatCompactNumber(2500000000)); // "2.5B"
```

### Validation

#### `isValidNumber(value: string): boolean`

Check if string is valid number

```typescript
import { isValidNumber } from '@/utils';

if (isValidNumber(userInput)) {
  // Process input
}
```

#### `hasSufficientBalance(balance: string, amount: string): boolean`

Check if balance is sufficient

```typescript
import { hasSufficientBalance } from '@/utils';

if (!hasSufficientBalance(userBalance, purchaseAmount)) {
  alert('Insufficient balance');
}
```

### Conversion

#### `hexToDecimal(hex: string): string`

Convert hex to decimal

```typescript
import { hexToDecimal } from '@/utils';

const decimal = hexToDecimal('0x1a'); // "26"
```

#### `weiToToken(wei: string, decimals: number): string`

Convert Wei to token amount

```typescript
import { weiToToken } from '@/utils';

const tokens = weiToToken('1000000', 6); // "1" (for USDC)
```

## Wagmi Utilities (wagmi.ts)

### Account Utilities

#### `getCurrentAccount()`

Get current connected account

```typescript
import { getCurrentAccount } from '@/utils';

const account = getCurrentAccount();
console.log(account.address, account.isConnected);
```

#### `getAccountAddress(): Address | undefined`

Get current account address

```typescript
import { getAccountAddress } from '@/utils';

const address = getAccountAddress();
if (address) {
  console.log('Connected:', address);
}
```

#### `isWalletConnected(): boolean`

Check if wallet is connected

```typescript
import { isWalletConnected } from '@/utils';

if (!isWalletConnected()) {
  alert('Please connect your wallet');
  return;
}
```

### Balance Utilities

#### `getNativeBalance(address: Address)`

Get ETH balance

```typescript
import { getNativeBalance } from '@/utils';

const balance = await getNativeBalance('0x...');
console.log(balance.formatted, balance.symbol);
```

#### `getTokenBalance(address: Address, tokenAddress: Address)`

Get ERC20 token balance

```typescript
import { getTokenBalance } from '@/utils';

const USDC_ADDRESS = '0x...';
const balance = await getTokenBalance(userAddress, USDC_ADDRESS);
console.log(balance.formatted);
```

#### `getFormattedBalance(address: Address, tokenAddress?: Address): Promise<string>`

Get formatted balance string

```typescript
import { getFormattedBalance } from '@/utils';

const ethBalance = await getFormattedBalance(userAddress);
const usdcBalance = await getFormattedBalance(userAddress, USDC_ADDRESS);
```

### Network Utilities

#### `getCurrentChainId(): number | undefined`

Get current chain ID

```typescript
import { getCurrentChainId, CHAIN_IDS } from '@/utils';

const chainId = getCurrentChainId();
if (chainId === CHAIN_IDS.ETHEREUM) {
  console.log('On Ethereum mainnet');
}
```

#### `isOnChain(chainId: number): boolean`

Check if on specific chain

```typescript
import { isOnChain, CHAIN_IDS } from '@/utils';

if (!isOnChain(CHAIN_IDS.BASE)) {
  alert('Please switch to Base network');
}
```

#### `switchToChain(chainId: number): Promise<boolean>`

Switch to specific chain

```typescript
import { switchToChain, CHAIN_IDS } from '@/utils';

const success = await switchToChain(CHAIN_IDS.BASE);
if (success) {
  console.log('Switched to Base');
}
```

#### `onNetworkChange(callback)`

Watch for network changes

```typescript
import { onNetworkChange } from '@/utils';

const unwatch = onNetworkChange(network => {
  console.log('Chain changed:', network.chain?.id);
});

// Cleanup
unwatch();
```

### Chain Utilities

#### `getChainName(chainId: number): string`

Get chain name by ID

```typescript
import { getChainName } from '@/utils';

console.log(getChainName(1)); // "Ethereum"
console.log(getChainName(8453)); // "Base"
```

#### `isTestnet(chainId: number): boolean`

Check if chain is testnet

```typescript
import { isTestnet } from '@/utils';

if (isTestnet(currentChainId)) {
  console.warn('You are on a testnet');
}
```

### Explorer Utilities

#### `getExplorerUrl(chainId: number, address: string, type?: 'address' | 'tx'): string`

Get block explorer URL

```typescript
import { getExplorerUrl } from '@/utils';

const url = getExplorerUrl(1, '0x...', 'address');
// Returns: "https://etherscan.io/address/0x..."
```

#### `openInExplorer(chainId: number, address: string, type?: 'address' | 'tx'): void`

Open address/transaction in block explorer

```typescript
import { openInExplorer } from '@/utils';

openInExplorer(currentChainId, txHash, 'tx');
```

### Constants

```typescript
import { CHAIN_IDS, CHAIN_NAMES } from '@/utils';

// Chain IDs
CHAIN_IDS.ETHEREUM; // 1
CHAIN_IDS.SEPOLIA; // 11155111
CHAIN_IDS.BASE; // 8453
CHAIN_IDS.BASE_SEPOLIA; // 84532
CHAIN_IDS.POLYGON; // 137
CHAIN_IDS.ARBITRUM; // 42161
CHAIN_IDS.OPTIMISM; // 10

// Chain Names
CHAIN_NAMES[1]; // "Ethereum"
CHAIN_NAMES[8453]; // "Base"
```

## Complete Examples

### NFT Purchase Flow

```typescript
import {
  isWalletConnected,
  getAccountAddress,
  getCurrentChainId,
  getNativeBalance,
  formatEther,
  hasSufficientBalance,
  calculateGasCost,
  formatUSD,
  CHAIN_IDS,
} from '@/utils';

async function purchaseNFT(price: string) {
  // Check connection
  if (!isWalletConnected()) {
    alert('Please connect wallet');
    return;
  }

  // Get user address
  const userAddress = getAccountAddress();
  if (!userAddress) return;

  // Check chain
  const chainId = getCurrentChainId();
  if (chainId !== CHAIN_IDS.BASE) {
    alert('Please switch to Base network');
    return;
  }

  // Check balance
  const balance = await getNativeBalance(userAddress);
  const balanceEth = formatEther(balance.value.toString());

  if (!hasSufficientBalance(balanceEth, price)) {
    alert('Insufficient balance');
    return;
  }

  // Estimate gas
  const gasCost = calculateGasCost('150000', '1000000000');
  const totalCost = (parseFloat(price) + parseFloat(gasCost)).toFixed(4);

  console.log(`Total cost: ${formatUSD(totalCost)}`);

  // Proceed with purchase...
}
```

### Display User Info

```typescript
import {
  isWalletConnected,
  getAccountAddress,
  shortenAddress,
  getCurrentChainName,
  getNativeBalance,
  formatEther,
  openInExplorer,
  getCurrentChainId
} from '@/utils';

function UserInfoDisplay() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    async function loadUserInfo() {
      if (!isWalletConnected()) return;

      const address = getAccountAddress();
      if (!address) return;

      const chainName = getCurrentChainName();
      const chainId = getCurrentChainId();
      const balance = await getNativeBalance(address);

      setInfo({
        address: shortenAddress(address),
        fullAddress: address,
        chain: chainName,
        chainId,
        balance: formatEther(balance.value.toString(), 4)
      });
    }

    loadUserInfo();
  }, []);

  if (!info) return <div>Not connected</div>;

  return (
    <div>
      <p>Address: {info.address}</p>
      <p>Network: {info.chain}</p>
      <p>Balance: {info.balance} ETH</p>
      <button onClick={() => openInExplorer(info.chainId, info.fullAddress)}>
        View on Explorer
      </button>
    </div>
  );
}
```

### Format NFT Metadata

```typescript
import {
  formatUSD,
  formatCompactNumber,
  formatEther,
  calculatePercentage
} from '@/utils';

function NFTCard({ nft }: { nft: any }) {
  const priceEth = formatEther(nft.price);
  const priceUSD = formatUSD(parseFloat(priceEth) * 2000);
  const views = formatCompactNumber(nft.views);
  const royalty = calculatePercentage(priceEth, nft.royaltyPercent);

  return (
    <div>
      <h3>{nft.name}</h3>
      <p>Price: {priceEth} ETH ({priceUSD})</p>
      <p>Views: {views}</p>
      <p>Creator Royalty: {royalty} ETH</p>
    </div>
  );
}
```

## Best Practices

1. **Always validate addresses** before using them in transactions
2. **Use BigNumber** for all financial calculations
3. **Check wallet connection** before accessing account data
4. **Handle errors** when fetching blockchain data
5. **Format numbers** consistently across your app
6. **Verify chain** before executing chain-specific operations
7. **Use typed imports** for better IDE support

## Error Handling

```typescript
import { getNativeBalance, formatEther } from '@/utils';

async function safeGetBalance(address: string) {
  try {
    const balance = await getNativeBalance(address as `0x${string}`);
    return formatEther(balance.value.toString());
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
}
```

## TypeScript Support

All utilities are fully typed with TypeScript. Import types as needed:

```typescript
import type { Address } from 'abitype';
import type { BigNumber } from '@ethersproject/bignumber';
import BN from 'bn.js';
import Decimal from 'decimal.js';
```

## Contributing

When adding new utilities:

1. Add function to appropriate module (blockchain.ts or wagmi.ts)
2. Export from module's default export object
3. Add to utils/index.ts for central import
4. Document usage in this file
5. Add tests if applicable

## Support

For issues or questions:

- Check this documentation
- Review example usage
- Check function JSDoc comments in source files
