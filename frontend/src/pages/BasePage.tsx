import React from 'react';
import { BaseKitPanel, BaseIdentity, BaseTokenBalance } from '../components/BaseKit';

export default function BasePage() {
  const USDC_BASE: `0x${string}` = '0x833589fCD6edB6E08f4A1D14B881671DeC0C5e62';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Base Network</h1>
        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
          Base
        </span>
      </div>

      <BaseKitPanel tokenAddress={USDC_BASE} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-2">Identity</h2>
          <BaseIdentity />
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold mb-2">USDC (Base)</h2>
          <BaseTokenBalance tokenAddress={USDC_BASE} />
        </div>
      </div>
    </div>
  );
}
