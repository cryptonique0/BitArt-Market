import { useEffect, useState } from 'react';
import { wagmiUtils, CHAIN_IDS, getExplorerUrl } from '../../utils';
import { RainbowKitConnectButton } from '../RainbowKitConnectButton';
import { shortenAddress, formatEther } from '../../utils/blockchain';

interface BaseKitPanelProps {
  tokenAddress?: `0x${string}`;
}

export default function BaseKitPanel({ tokenAddress }: BaseKitPanelProps) {
  const [address, setAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [balanceEth, setBalanceEth] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  useEffect(() => {
    // Initialize
    setAddress(wagmiUtils.getAccountAddress());
    setChainId(wagmiUtils.getCurrentChainId());

    // Watch for changes
    const unwatchAccount = wagmiUtils.onAccountChange(account => {
      setAddress(account.address);
    });
    const unwatchNetwork = wagmiUtils.onNetworkChange(nextChainId => {
      setChainId(nextChainId);
    });

    return () => {
      unwatchAccount?.();
      unwatchNetwork?.();
    };
  }, []);

  useEffect(() => {
    async function loadBalances() {
      try {
        if (!address) return;
        const native = await wagmiUtils.getNativeBalance(address as `0x${string}`);
        setBalanceEth(formatEther(native.value.toString(), 4));

        if (tokenAddress) {
          const token = await wagmiUtils.getTokenBalance(address as `0x${string}`, tokenAddress);
          const formattedToken = (token as { formatted?: string }).formatted ?? '0';
          setTokenBalance(formattedToken);
        }
      } catch (err) {
        console.error('Error loading balances', err);
      }
    }
    loadBalances();
  }, [address, tokenAddress]);

  const isOnBase = chainId === CHAIN_IDS.BASE || chainId === CHAIN_IDS.BASE_SEPOLIA;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-white/50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Base Kit Panel</h3>
        <RainbowKitConnectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Network</p>
          <p className="font-medium">
            {isOnBase ? 'Base' : chainId ? `Chain ${chainId}` : 'Not connected'}
          </p>
          {!isOnBase && (
            <button
              onClick={() => wagmiUtils.switchToChain(CHAIN_IDS.BASE)}
              className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Switch to Base
            </button>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Address</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">{address ? shortenAddress(address) : '—'}</p>
            {address && chainId && (
              <a
                href={getExplorerUrl(chainId, address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                View on Explorer
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">ETH Balance</p>
          <p className="font-medium">{balanceEth} ETH</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Token Balance</p>
          <p className="font-medium">{tokenAddress ? `${tokenBalance}` : '—'}</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Fund Wallet</p>
          <a
            href="https://www.coinbase.com/buy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
          >
            Buy Crypto
          </a>
        </div>
      </div>
    </div>
  );
}
