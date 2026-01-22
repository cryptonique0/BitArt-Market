import React from 'react';
import { shortenAddress } from '../../utils/blockchain';
import { wagmiUtils, getExplorerUrl } from '../../utils';

interface BaseIdentityProps {
  className?: string;
}

export default function BaseIdentity({ className }: BaseIdentityProps) {
  const address = wagmiUtils.getAccountAddress();
  const chainId = wagmiUtils.getCurrentChainId();

  if (!address) {
    return <div className={className}>Not connected</div>;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200">
          {shortenAddress(address, 2)}
        </div>
        <div>
          <div className="text-sm">{shortenAddress(address)}</div>
          {chainId && (
            <a
              href={getExplorerUrl(chainId, address, 'address')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Explorer
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
