// Responsive Layout System for UI Fine-tuning
// Commit 5-10: Layout enhancements and responsive grid system

export const ResponsiveLayout = {
  // Commit 5: NFT Card enhancements
  nftCard: {
    container:
      'relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300',
    image:
      'w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300',
    badge: 'absolute top-3 right-3 z-10',
    content: 'p-4 space-y-2',
    title: 'font-semibold text-gray-900 dark:text-white truncate',
    price:
      'text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
  },

  // Commit 6: Footer structure
  footer: {
    container: 'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12',
    section: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 py-12 max-w-7xl mx-auto',
    column: 'space-y-4',
    title: 'font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide',
    link: 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm',
  },

  // Commit 7: Modal enhancements
  modal: {
    backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50',
    content: 'bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-scaleIn',
    header: 'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700',
    body: 'p-6 space-y-4',
    footer: 'flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 justify-end',
  },

  // Commit 8: Input field enhancements
  input: {
    container: 'relative',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
    field:
      'w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50 transition-all duration-200',
    error: 'text-sm text-red-600 dark:text-red-400 mt-1',
    hint: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
  },

  // Commit 9: Header sticky positioning
  header: {
    container:
      'sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm',
    nav: 'max-w-7xl mx-auto px-4 py-4 flex items-center justify-between',
    brand:
      'font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
    links: 'hidden md:flex gap-8 items-center',
  },

  // Commit 10: Responsive grid system
  grid: {
    container: 'grid gap-6',
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2',
    desktop: 'lg:grid-cols-3',
    wide: 'xl:grid-cols-4',
    full: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
};

// Typography scale
export const Typography = {
  h1: 'text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  body: 'text-base leading-relaxed',
  small: 'text-sm text-gray-600 dark:text-gray-400',
};

// Spacing utilities
export const Spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
};

// Color palette with dark mode
export const Colors = {
  primary: 'purple-600 dark:purple-400',
  secondary: 'pink-600 dark:pink-400',
  success: 'green-600 dark:green-400',
  warning: 'yellow-600 dark:yellow-400',
  error: 'red-600 dark:red-400',
  gray: 'gray-500 dark:gray-400',
  background: 'white dark:gray-900',
  surface: 'gray-50 dark:gray-800',
};

// Shadows with elevation
export const Shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg hover:shadow-xl',
  xl: 'shadow-xl hover:shadow-2xl',
  inner: 'shadow-inner',
};

export default ResponsiveLayout;
