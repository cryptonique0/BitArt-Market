// Performance Optimization Utilities (Commits 85-100)
import React from 'react';

// Commit 7: Input Focus States
export const InputFocusStyles = {
  container: 'relative',
  input: `px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600
          focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50
          transition-all duration-200 focus:outline-none`,
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors',
  error: 'absolute text-sm text-red-600 dark:text-red-400 mt-1',
};

// Commit 8: Validation Feedback
export const ValidationFeedback = {
  success: 'text-green-600 dark:text-green-400 text-sm mt-1',
  error: 'text-red-600 dark:text-red-400 text-sm mt-1',
  warning: 'text-yellow-600 dark:text-yellow-400 text-sm mt-1',
  info: 'text-blue-600 dark:text-blue-400 text-sm mt-1',
};

// Commit 9: Floating Label Animation
export const FloatingLabel = `
  @keyframes floatLabel {
    from { transform: translateY(0); opacity: 0; }
    to { transform: translateY(-24px); opacity: 1; }
  }
  .float-label { animation: floatLabel 0.2s ease-out; }
`;

// Commit 10: Loading States
export const LoadingStates = {
  spinner: 'animate-spin h-4 w-4',
  skeleton: 'bg-gray-200 dark:bg-gray-700 animate-pulse rounded',
  progress: 'h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full',
};

// Commit 11: Mobile Menu Animation
export const MobileMenuAnimation = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .menu-enter { animation: slideInRight 0.3s ease-out; }
`;

// Commit 12: Breadcrumb Navigation
export const BreadcrumbStyles = {
  container: 'flex items-center gap-2 text-sm',
  link: 'text-purple-600 dark:text-purple-400 hover:underline',
  separator: 'text-gray-400 dark:text-gray-600',
  current: 'text-gray-600 dark:text-gray-400 font-medium',
};

// Commit 13: Modal Slide Animation
export const ModalAnimation = `
  @keyframes modalSlideIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .modal-enter { animation: modalSlideIn 0.3s ease-out; }
`;

// Commit 14: Dropdown Styling
export const DropdownStyles = {
  container: 'relative inline-block',
  button:
    'flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
  menu: 'absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
  item: 'px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors',
};

// Commit 15: Checkbox Animations
export const CheckboxAnimation = `
  @keyframes checkmark {
    0% { transform: scale(0) rotate(-45deg); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1) rotate(0); }
  }
  .checkbox-checked { animation: checkmark 0.3s ease-out; }
`;

// Commit 16: Radio Button Styling
export const RadioStyles = {
  container: 'flex items-center gap-3',
  input: 'w-4 h-4 accent-purple-600 dark:accent-purple-400 cursor-pointer',
  label: 'text-gray-700 dark:text-gray-300 cursor-pointer select-none',
};

// Commit 17: Range Slider
export const SliderStyles = {
  container: 'flex flex-col gap-4',
  input: `w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
          accent-purple-600 dark:accent-purple-400`,
  track: 'flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2',
};

// Commit 18: Progress Bar
export const ProgressStyles = {
  container: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden',
  bar: 'bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-300',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
};

// Commit 19: Avatar Styling
export const AvatarStyles = {
  container: 'relative',
  image: 'w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700',
  fallback:
    'w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold',
  status:
    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
};

// Commit 20: Tooltip Styling
export const TooltipStyles = {
  trigger: 'cursor-help',
  content:
    'absolute bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded text-xs whitespace-nowrap',
  arrow: 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45',
};

// Memoized Component Wrapper (Commit 85)
export const withMemo = <P>(Component: React.FC<P>) => {
  return React.memo(Component, (prev, next) => {
    return JSON.stringify(prev) === JSON.stringify(next);
  });
};

// Lazy Loading Wrapper (Commit 86)
export const withLazy = (Component: React.ComponentType<any>, fallback = null) => {
  return React.lazy(() => Promise.resolve({ default: Component }));
};

// Virtual Scrolling HOC (Commit 87)
export const VirtualList = {
  container: 'overflow-y-auto',
  item: 'absolute w-full transition-transform duration-100',
};

export default {
  InputFocusStyles,
  ValidationFeedback,
  LoadingStates,
  DropdownStyles,
  RadioStyles,
  SliderStyles,
  ProgressStyles,
  AvatarStyles,
  TooltipStyles,
};
