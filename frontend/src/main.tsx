import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App.tsx';
import './index.css';
import { analyticsService } from './services/google-analytics.service';
import { initMonitoring } from './services/monitoring';
import { startPerfMetrics } from './services/perf';
import { featureFlags } from './services/featureFlags';
import { WalletProvider } from './context/WalletContext';
import { rainbowkitConfig } from './config/rainbowkit';

// Handle Ethereum provider conflicts safely
if (typeof window !== 'undefined') {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');

  if (originalDescriptor && originalDescriptor.configurable === false) {
    // If ethereum is already defined and non-configurable, skip our setup
    console.warn('Ethereum provider already defined by another extension');
  }
}

const queryClient = new QueryClient();

// Initialize Google Analytics
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
analyticsService.init({
  measurementId: measurementId,
  debug: import.meta.env.DEV,
});

// Initialize Monitoring (Sentry, LogRocket)
initMonitoring();

// Initialize Feature Flags (LaunchDarkly/Flagsmith)
featureFlags.init();

// Start Web Vitals collection (handled gracefully)
startPerfMetrics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <WagmiProvider config={rainbowkitConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </HelmetProvider>
  </React.StrictMode>
);
