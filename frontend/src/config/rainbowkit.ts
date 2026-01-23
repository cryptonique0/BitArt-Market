import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  polygon,
  arbitrum,
  optimism,
  bsc,
  avalanche,
} from 'wagmi/chains';

export const rainbowkitConfig = getDefaultConfig({
  appName: 'BitArt Market',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, base, baseSepolia, polygon, arbitrum, optimism, bsc, avalanche],
  ssr: false,
});
