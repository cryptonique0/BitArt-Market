import { useEffect, useMemo, useState } from 'react';
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
          const formattedToken = (token as { formatted?: string }).formatted ?? '0';
          setTokenBalance(formattedToken);
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
    <div className="group rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full text-white bg-gradient-to-r ${accentGradient} shadow-sm`}
            >
              {badgeText}
            </span>
            {isOnTarget && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full">
                Connected
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{chainName}</h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Connection & Switch Section */}
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex-shrink-0">
          <RainbowKitConnectButton />
        </div>
        {!isOnTarget && address && (
          <button
            onClick={handleSwitch}
            disabled={isSwitching}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-medium bg-gradient-to-r ${accentGradient} hover:opacity-90 disabled:opacity-60 transition-all shadow-sm hover:shadow-md`}
          >
            {isSwitching ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Switching...
              </>
            ) : (
              `Switch to ${chainName}`
            )}
          </button>
        )}
      </div>

      {/* Network & Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-3 border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Network</p>
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {isOnTarget
              ? `${chainName}`
              : currentChainId
                ? `${getChainName(currentChainId)}`
                : 'Not connected'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isOnTarget ? `Chain ${chainId}` : currentChainId ? `Chain ${currentChainId}` : '—'}
          </p>
          {!isOnTarget && address && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Switch network to view balances
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-3 border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {address ? shortenAddress(address) : '—'}
            </p>
            {address && currentChainId && (
              <a
                href={getExplorerUrl(currentChainId, address, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium flex items-center gap-1 hover:underline"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Explorer
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Balances & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            Native Balance
          </p>
          <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
            {isOnTarget ? nativeBalance : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            {tokenDisplayLabel}
          </p>
          <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
            {isOnTarget ? tokenBalance : '—'}
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Onramp / Bridge
          </p>
          {buyUrl ? (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Open
            </a>
          ) : (
            <p className="font-medium text-gray-400">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
