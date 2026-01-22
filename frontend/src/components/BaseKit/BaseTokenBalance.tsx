import React, { useEffect, useState } from 'react';
import { wagmiUtils } from '../../utils';

interface BaseTokenBalanceProps {
  tokenAddress: `0x${string}`;
  label?: string;
  className?: string;
}

export default function BaseTokenBalance({
  tokenAddress,
  label = 'Token Balance',
  className,
}: BaseTokenBalanceProps) {
  const [balance, setBalance] = useState<string>('0');
  const address = wagmiUtils.getAccountAddress();

  useEffect(() => {
    async function load() {
      try {
        if (!address) return;
        const bal = await wagmiUtils.getTokenBalance(address as `0x${string}`, tokenAddress);
        setBalance(bal.formatted);
      } catch (err) {
        console.error('Error fetching token balance', err);
      }
    }
    load();
  }, [address, tokenAddress]);

  return (
    <div className={className}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{balance}</p>
    </div>
  );
}
