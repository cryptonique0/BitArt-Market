import React, { useEffect, useMemo, useState } from 'react';
import { RainbowKitConnectButton } from '../RainbowKitConnectButton';
import { wagmiUtils, getExplorerUrl, getChainName } from '../../utils';
import { shortenAddress, formatEther } from '../../utils/blockchain';

interface ChainKitPanelProps {
  chainId: number;
  title?: string;
  badge?: string;
  accentGradient?: string;
  tokenAddress?: `0x${string}`;
  tokenLabel?: string;
  buyUrl?: string;
  description?: string;
}

export default function ChainKitPanel({
  chainId,
  title,
  badge,
  accentGradient = 'from-blue-600 to-cyan-500',
  tokenAddress,
  tokenLabel,
  buyUrl,
  description,
}: ChainKitPanelProps) {
  const [address, setAddress] = useState<string | undefined>();
  const [currentChainId, setCurrentChainId] = useState<number | undefined>();
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isSwitching, setIsSwitching] = useState(false);

  const chainName = useMemo(() => title || getChainName(chainId), [chainId, title]);
  const badgeText = badge || chainName;
  const tokenDisplayLabel = tokenLabel || 'Token Balance';
  const isOnTarget = currentChainId === chainId;

  useEffect(() => {
    setAddress(wagmiUtils.getAccountAddress());
    setCurrentChainId(wagmiUtils.getCurrentChainId());

    const unwatchAccount = wagmiUtils.onAccountChange(account => setAddress(account.address));
    const unwatchNetwork = wagmiUtils.onNetworkChange(nextChainId =>
      setCurrentChainId(nextChainId)
    );

    return () => {
      unwatchAccount?.();
      unwatchNetwork?.();
    };
  }, []);

  useEffect(() => {
    async function loadBalances() {
      try {
        if (!address || !isOnTarget) return;
        const native = await wagmiUtils.getNativeBalance(address as `0x${string}`);
        setNativeBalance(formatEther(native.value.toString(), 4));

        if (tokenAddress) {
          const token = await wagmiUtils.getTokenBalance(address as `0x${string}`, tokenAddress);
          setTokenBalance(token.formatted);
        } else {
          setTokenBalance('—');
        }
      } catch (error) {
        console.error('Error loading balances', error);
      }
    }

    loadBalances();
  }, [address, tokenAddress, isOnTarget]);

  useEffect(() => {
    if (!isOnTarget) {
      setNativeBalance('0');
      setTokenBalance(tokenAddress ? '0' : '—');
    }
  }, [isOnTarget, tokenAddress]);

  const handleSwitch = async () => {
    try {
      setIsSwitching(true);
      await wagmiUtils.switchToChain(chainId);
    } catch (error) {
      console.error('Error switching chain', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-4 bg-white/60 dark:bg-gray-900/60 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">EVM Toolkit</p>
          <h3 className="text-lg font-semibold">{chainName}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full text-white bg-gradient-to-r ${accentGradient}`}
        >
          {badgeText}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <RainbowKitConnectButton />
        {!isOnTarget && (
          <button
            onClick={handleSwitch}
            disabled={isSwitching}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-white text-sm bg-gradient-to-r ${accentGradient} hover:opacity-90 disabled:opacity-60`}
          >
            {isSwitching ? 'Switching...' : `Switch to ${chainName}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Network</p>
          <p className="font-medium">
            {isOnTarget
              ? `${chainName} (Chain ${chainId})`
              : currentChainId
                ? `${getChainName(currentChainId)} (Chain ${currentChainId})`
                : 'Not connected'}
          </p>
          {!isOnTarget && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
              Switch to view {chainName} balances.
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Address</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">{address ? shortenAddress(address) : '—'}</p>
            {address && currentChainId && (
              <a
                href={getExplorerUrl(currentChainId, address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Explorer
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Native Balance</p>
          <p className="font-medium">{nativeBalance}</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">{tokenDisplayLabel}</p>
          <p className="font-medium">{tokenBalance}</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <p className="text-sm text-gray-500">Onramp / Bridge</p>
          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800"
            >
              Open
            </a>
          ) : (
            <p className="font-medium">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
