// Performance monitoring service
// Handles Web Vitals collection gracefully without blocking on import errors

declare global {
  interface Window {
    perfMetricsReported?: boolean;
  }
}

interface Metric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: string;
}

function report(metric: Metric) {
  // Log to console for local debugging
  if (import.meta.env.DEV) {
    console.info('[WebVitals]', metric.name, metric.value);
  }

  const enabled = (import.meta.env.VITE_ENABLE_PERF_METRICS || '').toLowerCase() === 'true';
  if (!enabled) return;

  try {
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const url = `${api.replace('/api', '')}/api/advanced-analytics/web-vitals`;
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
    });

    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently ignore network errors
      });
    }
  } catch {
    // Silently ignore errors
  }
}

export function startPerfMetrics() {
  // Only try to load web-vitals if we haven't already attempted it
  if (window.perfMetricsReported) return;

  if (typeof window !== 'undefined') {
    try {
      // Use dynamic import to avoid blocking on module load errors
      import('web-vitals')
        .then(vitals => {
          window.perfMetricsReported = true;

          // Call each metric function if it exists
          if (vitals.getCLS) vitals.getCLS(report);
          if (vitals.getFID) vitals.getFID(report);
          if (vitals.getLCP) vitals.getLCP(report);
          if (vitals.getTTFB) vitals.getTTFB(report);
          if (vitals.getFCP) vitals.getFCP(report);
        })
        .catch(error => {
          // Silently fail if web-vitals can't be loaded
          if (import.meta.env.DEV) {
            console.debug('Web vitals not available:', error.message);
          }
          window.perfMetricsReported = true;
        });
    } catch (error) {
      // Silently fail on any error
      window.perfMetricsReported = true;
    }
  }
}
