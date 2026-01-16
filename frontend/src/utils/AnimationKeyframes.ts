// Animation Keyframes and Utilities (Commits 21-35)

export const AnimationKeyframes = `
/* Entrance Animations */
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Hover Animations */
@keyframes cardLift {
  0% { transform: translateY(0); }
  100% { transform: translateY(-4px); }
}

@keyframes imageSway {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Scroll Animations */
@keyframes revealOnScroll {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Loading Animations */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Success Animation */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Error Animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
`;

export const UtilityClasses = {
  // Commit 22: Scroll animations
  scrollReveal: 'animate-in fade-in slide-in-from-bottom-10 duration-700',
  staggerDelay: 'animation-delay-100 animation-delay-200 animation-delay-300',

  // Commit 23: Hover effects
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  imageZoom: 'group-hover:scale-110 transition-transform duration-300',

  // Commit 24: Focus effects
  focusRing: 'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none',
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',

  // Commit 25: Loading states
  loadingPulse: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  loadingShimmer: 'animate-shimmer bg-gradient-to-r from-gray-100 via-white to-gray-100',

  // Commit 26: Transition timing
  transitionFast: 'transition-all duration-150 ease-out',
  transitionNormal: 'transition-all duration-300 ease-in-out',
  transitionSlow: 'transition-all duration-500 ease-in-out',

  // Commit 27: Transform utilities
  scaleOnHover: 'hover:scale-105 transition-transform duration-200',
  rotateOnHover: 'hover:rotate-1 transition-transform duration-200',
  skewOnHover: 'hover:skew-x-1 transition-transform duration-200',

  // Commit 28: Opacity transitions
  fadeOnHover: 'group-hover:opacity-100 opacity-0 transition-opacity duration-200',
  dimOnHover: 'group-hover:opacity-50 transition-opacity duration-200',

  // Commit 29: Color transitions
  colorOnHover: 'hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200',
  bgOnHover: 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200',

  // Commit 30: Combined effects
  cardInteractive:
    'hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer',
  buttonInteractive: 'hover:brightness-110 active:scale-95 transition-all duration-150',
};

export const ResponsiveAnimations = {
  // Commit 31: Mobile-first animations
  mobileSlide: 'sm:slide-in-from-left lg:slide-in-from-bottom',
  tabletStagger: 'sm:animation-delay-100 md:animation-delay-200',
  desktopParallax: 'lg:parallax',
};

export default {
  AnimationKeyframes,
  UtilityClasses,
  ResponsiveAnimations,
};
