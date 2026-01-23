/**
 * Price Feed Service
 * Real-time token and native asset price feeds using Chainlink or CoinGecko
 */

export interface PriceFeed {
  symbol: string;
  address: string;
  price: number;
  priceUSD: number;
  change24h: number;
  change7d: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: number;
}

export interface PortfolioValue {
  totalBalanceUSD: number;
  totalBalanceETH: number;
  byChain: {
    chainId: number;
    chainName: string;
    balanceUSD: number;
    balanceETH: number;
    tokens: {
      symbol: string;
      amount: number;
      valueUSD: number;
    }[];
  }[];
}

// Cache for prices to reduce API calls
const priceCache: Map<string, { price: PriceFeed; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

// Standard token addresses across chains
const TOKEN_ADDRESSES_REF: Record<string, Record<number, string>> = {
  ETH: {
    1: '0x0000000000000000000000000000000000000000',
    8453: '0x0000000000000000000000000000000000000000',
    10: '0x0000000000000000000000000000000000000000',
    42161: '0x0000000000000000000000000000000000000000',
  },
  USDC: {
    1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    8453: '0x833589fcd6edb6e08f4c7c32d4f71b3228cdcd73',
    10: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    42161: '0xff970a61a04b1ca14834a43f5de4533ebddb5f86',
  },
  DAI: {
    1: '0x6b175474e89094c44da98b954eedeac495271d0f',
    8453: '0x50c5725949a6f0c72b6c40f1e8b5249e67f63c14',
    10: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    42161: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  },
};

/**
 * Get current ETH/native asset price in USD
 */
export async function getNativeAssetPrice(chainId: number): Promise<number> {
  try {
    const cacheKey = `eth-price-${chainId}`;
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.price.priceUSD;
    }

    // In production, use Chainlink Data Feeds or CoinGecko API
    // Chainlink: https://docs.chain.link/data-feeds/price-feeds
    // CoinGecko: https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd

    const mockPrices: Record<number, number> = {
      1: 2500,
      8453: 2500,
      10: 2500,
      42161: 2500,
      137: 2500,
      56: 2500,
      43114: 2500,
    };

    const price = mockPrices[chainId] || 2500;

    priceCache.set(cacheKey, {
      price: {
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000000',
        price: 1,
        priceUSD: price,
        change24h: 2.5,
        change7d: 5.2,
        marketCap: price * 120_000_000, // Approximate
        volume24h: 25_000_000_000,
        lastUpdated: Date.now(),
      },
      timestamp: Date.now(),
    });

    return price;
  } catch (error) {
    console.error('Failed to fetch native asset price:', error);
    return 2500; // Fallback
  }
}

/**
 * Get token price from DEX or price oracle
 */
export async function getTokenPrice(
  tokenAddress: string,
  chainId: number
): Promise<PriceFeed | null> {
  try {
    const cacheKey = `${tokenAddress}-${chainId}`;
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.price;
    }

    // In production:
    // 1. Use Chainlink Data Feeds for supported tokens
    // 2. Fall back to DEX aggregator like 1inch or 0x
    // 3. Use Uniswap V3 subgraph for TWAP
    // 4. Use Balancer subgraph for weighted pools

    // Mock response
    const mockPrices: Record<string, PriceFeed> = {
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        price: 1.0,
        priceUSD: 1.0,
        change24h: 0.02,
        change7d: 0.05,
        marketCap: 35_000_000_000,
        volume24h: 8_000_000_000,
        lastUpdated: Date.now(),
      },
      '0x6b175474e89094c44da98b954eedeac495271d0f': {
        symbol: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        price: 1.0,
        priceUSD: 1.0,
        change24h: 0.01,
        change7d: 0.03,
        marketCap: 8_000_000_000,
        volume24h: 1_200_000_000,
        lastUpdated: Date.now(),
      },
    };

    const price = mockPrices[tokenAddress.toLowerCase()] || null;

    if (price) {
      priceCache.set(cacheKey, { price, timestamp: Date.now() });
    }

    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Get multiple token prices efficiently
 */
export async function getTokenPrices(
  tokens: { address: string; chainId: number }[]
): Promise<Map<string, PriceFeed>> {
  const prices = new Map<string, PriceFeed>();

  try {
    const results = await Promise.all(tokens.map(t => getTokenPrice(t.address, t.chainId)));

    results.forEach((price, index) => {
      if (price) {
        const key = `${tokens[index].address}-${tokens[index].chainId}`;
        prices.set(key, price);
      }
    });
  } catch (error) {
    console.error('Failed to fetch token prices:', error);
  }

  return prices;
}

/**
 * Calculate portfolio value across all chains
 */
export async function calculatePortfolioValue(
  balances: {
    chainId: number;
    chainName: string;
    nativeBalance: number;
    tokens: {
      symbol: string;
      address: string;
      amount: number;
    }[];
  }[]
): Promise<PortfolioValue> {
  let totalUSD = 0;
  let totalETH = 0;

  const byChain = await Promise.all(
    balances.map(async chain => {
      const ethPrice = await getNativeAssetPrice(chain.chainId);
      const nativeValueUSD = chain.nativeBalance * ethPrice;
      const nativeValueETH = chain.nativeBalance;

      let chainTotalUSD = nativeValueUSD;
      let chainTotalETH = nativeValueETH;

      const tokens = await Promise.all(
        chain.tokens.map(async token => {
          const price = await getTokenPrice(token.address, chain.chainId);
          const valueUSD = token.amount * (price?.priceUSD || 0);
          chainTotalUSD += valueUSD;
          chainTotalETH += valueUSD / ethPrice;

          return {
            symbol: token.symbol,
            amount: token.amount,
            valueUSD,
          };
        })
      );

      totalUSD += chainTotalUSD;
      totalETH += chainTotalETH;

      return {
        chainId: chain.chainId,
        chainName: chain.chainName,
        balanceUSD: chainTotalUSD,
        balanceETH: chainTotalETH,
        tokens: tokens.concat([
          {
            symbol: 'ETH',
            amount: chain.nativeBalance,
            valueUSD: nativeValueUSD,
          },
        ]),
      };
    })
  );

  return {
    totalBalanceUSD: totalUSD,
    totalBalanceETH: totalETH,
    byChain,
  };
}

/**
 * Format price for display
 */
export function formatPrice(priceUSD: number, decimals: number = 2): string {
  if (priceUSD >= 1000000) {
    return `$${(priceUSD / 1000000).toFixed(decimals)}M`;
  }
  if (priceUSD >= 1000) {
    return `$${(priceUSD / 1000).toFixed(decimals)}K`;
  }
  return `$${priceUSD.toFixed(decimals)}`;
}

/**
 * Format percentage change with color
 */
export function formatPriceChange(change: number): { text: string; color: string } {
  const isPositive = change >= 0;
  const color = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${change.toFixed(2)}%`,
    color,
  };
}

/**
 * Clear price cache (for testing or manual refresh)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Get price change color for UI
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}
