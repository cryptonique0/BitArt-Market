# Base Kits Integration

## Overview

This update adds Base-focused UI components (BaseKit) that provide wallet connection, identity, balances, and network switching tailored for the Base and Base Sepolia networks. These components use our existing Wagmi + RainbowKit setup, so they work out-of-the-box with React 18.

Note: Coinbase OnchainKit currently requires React ^19 (peer dependency) and cannot be installed cleanly in this project (React 18.3.1). If you want the official OnchainKit components, we can either:

- Upgrade React to 19 (major upgrade), or
- Force install with `--legacy-peer-deps` (not recommended).

Until then, the BaseKit components offer similar functionality with our stack.

## Components

- BaseKitPanel: Combined panel with network, address, balances, and a quick onramp link.
- BaseIdentity: Compact identity display with explorer link.
- BaseTokenBalance: Token balance viewer for any ERC-20 on Base.

## Files

- frontend/src/components/BaseKit/BaseKitPanel.tsx
- frontend/src/components/BaseKit/BaseIdentity.tsx
- frontend/src/components/BaseKit/BaseTokenBalance.tsx
- frontend/src/components/BaseKit/index.ts

## Usage

```tsx
import { BaseKitPanel, BaseIdentity, BaseTokenBalance } from '@/components/BaseKit';

function BasePage() {
  const USDC_BASE: `0x${string}` = '0x833589fCD6edB6E08f4A1D14B881671DeC0C5e62';

  return (
    <div className="space-y-6">
      <BaseKitPanel tokenAddress={USDC_BASE} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseIdentity />
        <BaseTokenBalance tokenAddress={USDC_BASE} label="USDC (Base)" />
      </div>
    </div>
  );
}
```

## Requirements

- Wagmi & RainbowKit already configured
- Base/Base Sepolia chains enabled (already in config)
- `VITE_WALLETCONNECT_PROJECT_ID` set for improved wallet connectivity

## Next Steps

- If preferred, upgrade to React 19 and install `@coinbase/onchainkit` for official Base UI components.
- Optionally add a route or page to showcase the BaseKit panel.
- Enhance BaseIdentity with ENS or Base Name Service when available.
