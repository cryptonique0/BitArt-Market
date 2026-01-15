import React, { useState, useCallback, useMemo } from 'react';
import { useAchievementService, AchievementSearchResult } from './useAchievementService';

interface SearchAchievementsProps {
  onSelectAchievement?: (achievement: any) => void;
  className?: string;
}

export const SearchAchievements: React.FC<SearchAchievementsProps> = ({
  onSelectAchievement,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AchievementSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const service = useAchievementService();

  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await service.searchAchievements(searchQuery);
        setResults(searchResults.slice(0, 10)); // Top 10 results
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    const timer = setTimeout(() => debouncedSearch(value), 300);
    return () => clearTimeout(timer);
  };

  const handleSelectAchievement = (achievement: any) => {
    onSelectAchievement?.(achievement);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-500',
      uncommon: 'text-green-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500',
    };
    return colors[rarity] || 'text-gray-500';
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search achievements..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map(result => (
            <div
              key={result.achievement.id}
              onClick={() => handleSelectAchievement(result.achievement)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{result.achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {result.achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {result.achievement.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-semibold ${getRarityColor(result.achievement.rarity)}`}
                    >
                      {result.achievement.rarity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Match: {result.matchScore}% ({result.matchReason})
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-bold text-blue-500">{result.matchScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          No achievements found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchAchievements;
