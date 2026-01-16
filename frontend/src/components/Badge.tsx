import React from 'react';

export type BadgeType = 'base-native' | 'base-og' | 'verified' | 'trending' | 'featured' | 'new';

interface BadgeProps {
  type: BadgeType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const badgeConfig: Record<BadgeType, {
  label: string;
  icon: string;
  bgColor: string;
  bgGradient: string;
  textColor: string;
  tooltip: string;
  borderColor: string;
}> = {
  'base-native': {
    label: 'Built on Base',
    icon: '🔵',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40',
    textColor: 'text-blue-800 dark:text-blue-300',
    tooltip: 'This NFT is minted on Base Mainnet',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'base-og': {
    label: 'Base OG',
    icon: '👑',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40',
    textColor: 'text-purple-800 dark:text-purple-300',
    tooltip: 'Early Base Mainnet supporter',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  'verified': {
    label: 'Verified',
    icon: '✓',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40',
    textColor: 'text-green-800 dark:text-green-300',
    tooltip: 'Creator identity verified',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  'trending': {
    label: 'Trending',
    icon: '📈',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40',
    textColor: 'text-orange-800 dark:text-orange-300',
    tooltip: 'Trending in the last 7 days',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  'featured': {
    label: 'Featured',
    icon: '⭐',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    bgGradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/40',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    tooltip: 'Featured by BitArt curators',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  'new': {
    label: 'New',
    icon: '🆕',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    bgGradient: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/40',
    textColor: 'text-pink-800 dark:text-pink-300',
    tooltip: 'Newly minted (< 7 days)',
    borderColor: 'border-pink-200 dark:border-pink-800'
  }
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
};

/**
 * Base-native badge component
 * Shows badges for Base-specific features, verified creators, trending, etc.
 * Enhanced with gradients and animations
 */
export const Badge: React.FC<BadgeProps> = ({ type, className = '', size = 'md', animated = false }) => {
  const config = badgeConfig[type];
  const sizeClass = sizeConfig[size];
  const animationClass = animated ? 'animate-pulse hover:animate-none' : '';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} ${config.textColor} ${sizeClass} ${animationClass} transition-all duration-200 hover:shadow-md cursor-default ${className}`}
    >
      <span className="inline-block">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

interface BadgeGroupProps {
  badges: BadgeType[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number; // Show +X more indicator if exceeds
}

/**
 * Group multiple badges together
 */
export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  badges,
  className = '',
  size = 'sm',
  maxVisible = 3
}) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = badges.length - visibleBadges.length;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleBadges.map((badge, idx) => (
        <Badge key={idx} type={badge} size={size} />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
};

interface NFTBadgesProps {
  isBaseNative?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBaseOG?: boolean; // User is early adopter
  className?: string;
}

/**
 * Pre-configured badge set for NFT cards
 */
export const NFTBadges: React.FC<NFTBadgesProps> = ({
  isBaseNative = true,
  isVerified = false,
  isTrending = false,
  isFeatured = false,
  isNew = false,
  isBaseOG = false,
  className = ''
}) => {
  const badges: BadgeType[] = [];

  if (isBaseNative) badges.push('base-native');
  if (isBaseOG) badges.push('base-og');
  if (isVerified) badges.push('verified');
  if (isTrending) badges.push('trending');
  if (isFeatured) badges.push('featured');
  if (isNew) badges.push('new');

  return <BadgeGroup badges={badges} size="sm" className={className} />;
};

interface CreatorBadgesProps {
  isVerified?: boolean;
  isBaseOG?: boolean;
  badgeCount?: number; // Number of verified sales
  className?: string;
}

/**
 * Pre-configured badge set for creator profiles
 */
export const CreatorBadges: React.FC<CreatorBadgesProps> = ({
  isVerified = false,
  isBaseOG = false,
  badgeCount = 0,
  className = ''
}) => {
  const badges: BadgeType[] = [];

  if (isVerified) badges.push('verified');
  if (isBaseOG) badges.push('base-og');

  return (
    <div className={className}>
      <BadgeGroup badges={badges} size="sm" />
      {badgeCount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {badgeCount} verified sales
        </p>
      )}
    </div>
  );
};

/**
 * Inline Base badge for header/branding
 */
export const BaseNativeBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full ${className}`}>
      <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
      Built on Base
    </span>
  );
};
