import { useEffect, useState, useMemo } from 'react';
import {
  getNativeAssetPrice,
  getTokenPrice,
  formatPrice,
  type PriceFeed,
} from '../../services/priceFeed';

interface MultiChainBalanceProps {
  balances: {
    chainId: number;
    chainName: string;
    nativeBalance: number;
    tokens?: {
      symbol: string;
      address: string;
      amount: number;
    }[];
  }[];
}

export const MultiChainBalance: React.FC<MultiChainBalanceProps> = ({ balances }) => {
  const [prices, setPrices] = useState<Map<string, PriceFeed>>(new Map());
  const [ethPrice, setEthPrice] = useState(2500);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);

      // Get ETH prices
      const price = await getNativeAssetPrice(1);
      setEthPrice(price);

      // Get token prices
      const tokenMap = new Map<string, PriceFeed>();
      for (const balance of balances) {
        if (balance.tokens) {
          for (const token of balance.tokens) {
            const price = await getTokenPrice(token.address, balance.chainId);
            if (price) {
              tokenMap.set(`${token.address}-${balance.chainId}`, price);
            }
          }
        }
      }
      setPrices(tokenMap);
      setLoading(false);
    };

    loadPrices();
  }, [balances]);

  const portfolio = useMemo(() => {
    let totalUSD = 0;
    let totalETH = 0;

    const chains = balances.map(chain => {
      const nativeValueUSD = chain.nativeBalance * ethPrice;
      let chainTotal = nativeValueUSD;

      const tokens = (chain.tokens || []).map(token => {
        const price = prices.get(`${token.address}-${chain.chainId}`);
        const valueUSD = token.amount * (price?.priceUSD || 0);
        chainTotal += valueUSD;
        return {
          symbol: token.symbol,
          amount: token.amount,
          valueUSD,
          priceUSD: price?.priceUSD || 0,
        };
      });

      totalUSD += chainTotal;
      totalETH += chainTotal / ethPrice;

      return {
        chainId: chain.chainId,
        chainName: chain.chainName,
        nativeBalance: chain.nativeBalance,
        nativeValueUSD,
        tokens,
        totalUSD: chainTotal,
      };
    });

    return { chains, totalUSD, totalETH };
  }, [balances, prices, ethPrice]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <p className="text-sm opacity-90 mb-2">Total Portfolio Value</p>
        <h2 className="text-4xl font-black mb-4">{formatPrice(portfolio.totalUSD)}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">in ETH</p>
            <p className="text-2xl font-bold">{portfolio.totalETH.toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wider">Net Worth</p>
            <p className="text-2xl font-bold">{(portfolio.totalETH * ethPrice).toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {/* Per-Chain Breakdown */}
      <div className="space-y-3">
        {portfolio.chains.map(chain => (
          <div
            key={chain.chainId}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{chain.chainName}</h3>
                <p className="text-xs text-gray-500">{chain.nativeBalance.toFixed(4)} ETH</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-indigo-600 dark:text-indigo-400">
                  {formatPrice(chain.totalUSD)}
                </p>
                <p className="text-xs text-gray-500">
                  {(chain.totalUSD / ethPrice).toFixed(4)} ETH
                </p>
              </div>
            </div>

            {/* Native Asset */}
            <div className="flex items-center justify-between text-sm mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
              <span className="text-gray-600 dark:text-gray-400">
                Ξ {chain.nativeBalance.toFixed(4)}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(chain.nativeValueUSD)}
              </span>
            </div>

            {/* Tokens */}
            {chain.tokens.length > 0 && (
              <div className="space-y-1 text-sm">
                {chain.tokens.map(token => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {token.amount.toFixed(2)} {token.symbol}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(token.valueUSD)}
                      </p>
                      <p className="text-xs text-gray-500">${token.priceUSD.toFixed(4)}/each</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">
            Networks
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
            {portfolio.chains.length}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border border-green-200 dark:border-green-700">
          <p className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold">
            ETH Price
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300">${ethPrice}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3 border border-purple-200 dark:border-purple-700">
          <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-semibold">
            Total ETH
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            {portfolio.totalETH.toFixed(4)}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3 border border-orange-200 dark:border-orange-700">
          <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold">
            Avg / Chain
          </p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
            {formatPrice(portfolio.totalUSD / portfolio.chains.length)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiChainBalance;
