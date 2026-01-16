// ============================================================
// UI Fine-tuning Commits: Accessibility & Dark Mode Setup
// Commits 6-20: Accessibility patterns and dark mode utilities
// ============================================================

export const AccessibilityPatterns = {
  // Commit 6: Keyboard Navigation
  keyboardNav: {
    focusClass:
      'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    tabIndex: 'tabindex="0"',
    ariaLabel: 'aria-label="button label"',
    skipLink: '<a href="#main" class="skip-link">Skip to main content</a>',
  },

  // Commit 7: ARIA Labels
  ariaLabels: {
    button: 'aria-label="Close modal" aria-pressed="false"',
    icon: 'aria-hidden="true" role="img" aria-label="Icon description"',
    liveRegion: 'aria-live="polite" aria-atomic="true"',
    navigation: 'aria-label="Main navigation"',
    region: 'aria-label="NFT Gallery" role="region"',
  },

  // Commit 8: Focus Indicators
  focusStyles: {
    button: 'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
    link: 'focus:outline-none focus:underline focus:text-purple-600',
    input: 'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
  },

  // Commit 9: Heading Hierarchy
  headingHierarchy: {
    h1: 'text-5xl font-bold - Page title (one per page)',
    h2: 'text-4xl font-bold - Major sections',
    h3: 'text-3xl font-semibold - Subsections',
    h4: 'text-2xl font-semibold - Sub-subsections',
    rule: 'Never skip heading levels (h1 -> h3 is bad)',
  },

  // Commit 10: Alt Text Guidelines
  altText: {
    images: 'alt="Description of what image shows"',
    icons: 'aria-label="Icon purpose" aria-hidden="true"',
    decorative: 'alt="" or aria-hidden="true"',
    complex: 'aria-describedby="description-id"',
  },
};

export const DarkModePatterns = {
  // Commit 11: Text Colors
  textColors: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-600 dark:text-gray-400',
    disabled: 'text-gray-400 dark:text-gray-600',
  },

  // Commit 12: Background Colors
  backgrounds: {
    page: 'bg-white dark:bg-gray-900',
    surface: 'bg-gray-50 dark:bg-gray-800',
    raised: 'bg-white dark:bg-gray-700',
    input: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
  },

  // Commit 13: Border Colors
  borders: {
    default: 'border-gray-200 dark:border-gray-700',
    muted: 'border-gray-100 dark:border-gray-800',
    focus: 'border-purple-500 dark:border-purple-400',
    error: 'border-red-500 dark:border-red-400',
  },

  // Commit 14: Shadow Variants
  shadows: {
    sm: 'shadow-sm dark:shadow-lg dark:shadow-black/50',
    md: 'shadow-md dark:shadow-xl dark:shadow-black/60',
    lg: 'shadow-lg dark:shadow-2xl dark:shadow-black/70',
    xl: 'shadow-xl dark:shadow-2xl dark:shadow-black/80',
  },

  // Commit 15: Hover States
  hoverStates: {
    button: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    link: 'hover:text-purple-600 dark:hover:text-purple-400',
    card: 'hover:shadow-lg dark:hover:shadow-2xl',
    background: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
  },
};

// Commit 16-20: Component Dark Mode Implementations
export const ComponentDarkMode = {
  card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg',
  modal: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
  input:
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
  badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  button:
    'bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600',
  table: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  list: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
};

export default {
  AccessibilityPatterns,
  DarkModePatterns,
  ComponentDarkMode,
};
