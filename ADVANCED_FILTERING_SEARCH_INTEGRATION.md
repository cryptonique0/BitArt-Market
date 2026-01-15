# Advanced Filtering & Search - Integration Guide

## Overview

Advanced filtering and search capabilities allow users to discover achievements efficiently through intuitive search functionality and status-based filtering. This feature enhances user experience with powerful discovery tools.

---

## New Types Added

### AchievementStatus

```typescript
type AchievementStatus = 'locked' | 'in-progress' | 'unlocked';
```

### AchievementSearchResult

```typescript
interface AchievementSearchResult {
  achievement: Achievement;
  matchScore: number; // 0-100, higher = better match
  matchReason: string; // 'title' | 'description' | 'both'
}
```

### AchievementsByStatus

```typescript
interface AchievementsByStatus {
  locked: Achievement[];
  inProgress: Achievement[];
  unlocked: Achievement[];
}
```

---

## Core Methods

### `searchAchievements(query: string): Promise<AchievementSearchResult[]>`

Search achievements by title and description with intelligent matching.

**Parameters:**

- `query` - Search term (any string, case-insensitive)

**Returns:** Array of matching achievements sorted by relevance (highest score first)

**Features:**

- **Dual-channel search**: Searches both title and description
- **Relevance scoring**: Matches scored 0-100 based on match quality
- **Smart matching**:
  - Title matches weighted higher (80-100 points)
  - Description matches worth less (60-80 points)
  - Both title AND description matches get highest score (95-100)
- **Case-insensitive**: "NFT" matches "nft"
- **Substring matching**: "collector" matches "Art Collector"
- **Sorted results**: Best matches returned first

**Example:**

```typescript
// Search for all collector-related achievements
const results = await achievementService.searchAchievements('collector');
// Returns:
// [
//   {
//     achievement: { id: 'art_collector', title: 'Art Collector', ... },
//     matchScore: 100,
//     matchReason: 'title'
//   },
//   {
//     achievement: { id: 'nft_hoarder', title: 'NFT Hoarder', description: '...collector...' },
//     matchScore: 85,
//     matchReason: 'both'
//   },
//   ...
// ]
```

**Matching Logic:**

| Scenario             | Score  | Reason                |
| -------------------- | ------ | --------------------- |
| Exact title match    | 100    | Perfect match         |
| Title contains query | 80-95  | Strong match          |
| Title + Description  | 95-100 | Multiple matches      |
| Description only     | 60-80  | Weak match            |
| No match             | 0      | Excluded from results |

**Use Cases:**

- User searches "NFT" → finds all NFT-related achievements
- User searches "trader" → finds trading-related achievements
- User searches "milestone" → finds milestone achievements
- Autocomplete suggestions during achievement discovery

---

### `getAchievementsByStatus(userId: string, status: AchievementStatus): Promise<Achievement[]>`

Get achievements filtered by unlock status for a specific user.

**Parameters:**

- `userId` - User ID to check status for
- `status` - One of: `'locked'`, `'in-progress'`, `'unlocked'`

**Returns:** Array of achievements matching the status

**Status Definitions:**

| Status          | Description                                            |
| --------------- | ------------------------------------------------------ |
| `'unlocked'`    | Already obtained by user                               |
| `'locked'`      | Not started (0 progress)                               |
| `'in-progress'` | Started but not completed (0 < progress < requirement) |

**Example:**

```typescript
// Get all unlocked achievements for a user
const unlocked = await achievementService.getAchievementsByStatus('user123', 'unlocked');
// Returns all achievements the user has obtained

// Get in-progress achievements
const inProgress = await achievementService.getAchievementsByStatus('user123', 'in-progress');
// Returns achievements with progress but not yet unlocked
// { id: 'collector', title: 'Art Collector', requirement: 10, ... }
// User has 7/10 progress on this

// Get locked achievements
const locked = await achievementService.getAchievementsByStatus('user123', 'locked');
// Returns achievements not started (progress = 0)
```

**Practical Usage:**

```typescript
// Display progress view grouped by status
async function getProgressView(userId: string) {
  const unlocked = await achievementService.getAchievementsByStatus(userId, 'unlocked');
  const inProgress = await achievementService.getAchievementsByStatus(userId, 'in-progress');
  const locked = await achievementService.getAchievementsByStatus(userId, 'locked');

  return {
    completed: unlocked.length,
    activeGoals: inProgress.length,
    available: locked.length,
    unlocked,
    inProgress,
    locked,
  };
}
```

---

## Advanced Matching Algorithm

### Search Scoring Details

The search algorithm uses a sophisticated matching system:

1. **Title Match** (higher weight):
   - Exact match: 100
   - Substring at start: 95
   - Substring anywhere: 80-90 (based on character overlap)

2. **Description Match** (medium weight):
   - Substring found: 60-80 (based on character overlap)

3. **Combined Match** (highest weight):
   - Both title and description match: 95-100

4. **Character Overlap Scoring**:
   - Uses simplified Levenshtein distance
   - Calculates percentage of matching characters
   - Higher percentage = higher score

**Example Scoring:**

```
Search: "collector"

Achievement: "Art Collector"
- Title match: "collector" in "Art Collector" = substring
- Score: 85-90
- Reason: 'title'

Achievement: "Hoarder"
- Description: "...become a collector of rare NFTs..."
- No title match, but description contains "collector"
- Score: 70-75
- Reason: 'description'

Achievement: "Elite NFT Collector"
- Title: "Elite NFT Collector" (contains "collector")
- Score: 95-100
- Reason: 'title'
```

---

## API Endpoints

```typescript
// Search endpoint
GET  /api/achievements/search?q=query              Search achievements
     Query params: q (search term)
     Returns: AchievementSearchResult[]

// Filter by status
GET  /api/users/:userId/achievements/status/:status   Filter by status
     Params: status = 'locked' | 'in-progress' | 'unlocked'
     Returns: Achievement[]

// Convenience endpoint - get all statuses at once
GET  /api/users/:userId/achievements/by-status        Get all statuses
     Returns: AchievementsByStatus
```

---

## React Component Examples

### SearchAchievements Component

```typescript
interface SearchAchievementsProps {
  onSelect?: (achievement: Achievement) => void;
}

export function SearchAchievements({ onSelect }: SearchAchievementsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AchievementSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await achievementService.searchAchievements(q);
      setResults(searchResults);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="search-achievements">
      <input
        type="text"
        placeholder="Search achievements..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      {loading && <div className="spinner">Searching...</div>}

      {results.length > 0 && (
        <div className="results">
          {results.map((result) => (
            <div
              key={result.achievement.id}
              className="search-result"
              onClick={() => onSelect?.(result.achievement)}
            >
              <span className="icon">{result.achievement.icon}</span>
              <div className="info">
                <div className="title">{result.achievement.title}</div>
                <div className="match-info">
                  Match: {result.matchScore}% ({result.matchReason})
                </div>
              </div>
              <div className="match-score">{result.matchScore}%</div>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="no-results">No achievements found</div>
      )}
    </div>
  );
}
```

### AchievementStatusFilter Component

```typescript
interface AchievementStatusFilterProps {
  userId: string;
}

export function AchievementStatusFilter({ userId }: AchievementStatusFilterProps) {
  const [activeStatus, setActiveStatus] = useState<AchievementStatus>('unlocked');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      const result = await achievementService.getAchievementsByStatus(
        userId,
        activeStatus
      );
      setAchievements(result);
    };

    loadAchievements();
  }, [userId, activeStatus]);

  const statusLabels = {
    unlocked: `Unlocked (${achievements.length})`,
    'in-progress': `In Progress (${achievements.length})`,
    locked: `Locked (${achievements.length})`,
  };

  return (
    <div className="status-filter">
      <div className="tabs">
        {(['unlocked', 'in-progress', 'locked'] as const).map((status) => (
          <button
            key={status}
            className={`tab ${activeStatus === status ? 'active' : ''}`}
            onClick={() => setActiveStatus(status)}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="achievements-list">
        {achievements.map((ach) => (
          <div key={ach.id} className="achievement-item">
            <span className="icon">{ach.icon}</span>
            <span className="title">{ach.title}</span>
            <span className="xp">+{ach.xpReward} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Combined Search & Filter Component

```typescript
export function AchievementDiscovery() {
  const [searchResults, setSearchResults] = useState<AchievementSearchResult[]>([]);
  const [statusView, setStatusView] = useState<'search' | 'status'>('status');
  const userId = useCurrentUserId();

  return (
    <div className="achievement-discovery">
      <div className="header">
        <h2>Achievement Discovery</h2>
      </div>

      <div className="controls">
        <button
          className={statusView === 'search' ? 'active' : ''}
          onClick={() => setStatusView('search')}
        >
          🔍 Search
        </button>
        <button
          className={statusView === 'status' ? 'active' : ''}
          onClick={() => setStatusView('status')}
        >
          📊 My Progress
        </button>
      </div>

      {statusView === 'search' && (
        <SearchAchievements
          onSelect={(ach) => console.log('Selected:', ach)}
        />
      )}

      {statusView === 'status' && (
        <AchievementStatusFilter userId={userId} />
      )}
    </div>
  );
}
```

---

## Implementation Example

### Complete Search & Filter Workflow

```typescript
// User searches for achievements
async function handleUserSearch(query: string) {
  const results = await achievementService.searchAchievements(query);
  displaySearchResults(results);
}

// User views their progress by status
async function loadUserProgress(userId: string) {
  const unlocked = await achievementService.getAchievementsByStatus(userId, 'unlocked');
  const inProgress = await achievementService.getAchievementsByStatus(userId, 'in-progress');
  const locked = await achievementService.getAchievementsByStatus(userId, 'locked');

  return {
    unlocked,
    inProgress,
    locked,
    progressPercentage:
      (unlocked.length / (unlocked.length + locked.length + inProgress.length)) * 100,
  };
}

// Display search result with match reasoning
function displaySearchResult(result: AchievementSearchResult) {
  const { achievement, matchScore, matchReason } = result;

  console.log(`
    ${achievement.icon} ${achievement.title}
    Match: ${matchScore}% (${matchReason})
    ${achievement.description}
  `);
}
```

---

## Performance Considerations

- **Search**: O(n) where n = total achievements (~100-200)
- **Status Filter**: O(m) where m = user achievements + all achievements
- **Caching**: Consider caching search results for 5 minutes
- **Debouncing**: Debounce search input (300ms recommended)

---

## Database Schema (Future)

```sql
-- Optional: Search index table for faster queries
CREATE TABLE achievement_search_index (
  achievement_id VARCHAR(100) PRIMARY KEY,
  title_lowercase VARCHAR(255),
  description_lowercase TEXT,
  search_text TSVECTOR,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Create GiST index for full-text search
CREATE INDEX idx_achievement_search_gin
ON achievement_search_index USING GIN (search_text);
```

---

## Key Features

✅ **Intelligent Search** - Matches both title and description  
✅ **Relevance Scoring** - Results ranked by match quality (0-100)  
✅ **Fast Filtering** - Quick status-based lookup  
✅ **User-Specific** - Status reflects individual user progress  
✅ **Case-Insensitive** - Matches work regardless of case  
✅ **Substring Matching** - Finds partial matches  
✅ **Three Status Categories** - Locked, in-progress, unlocked

---

## Integration Checklist

- [ ] Add `searchAchievements()` method to achievementService
- [ ] Add `getAchievementsByStatus()` method to achievementService
- [ ] Add type definitions (AchievementStatus, AchievementSearchResult, AchievementsByStatus)
- [ ] Implement search API endpoint: `GET /api/achievements/search`
- [ ] Implement filter API endpoint: `GET /api/users/:userId/achievements/status/:status`
- [ ] Create SearchAchievements React component
- [ ] Create AchievementStatusFilter React component
- [ ] Add search to achievement discovery page
- [ ] Add status filter to user profile/achievements view
- [ ] Add debouncing to search input (300-500ms)
- [ ] Add keyboard navigation to search results
- [ ] Test with various search queries
- [ ] Add search analytics tracking

---

## Search Examples

| Query       | Returns                                 |
| ----------- | --------------------------------------- |
| "collector" | Art Collector, NFT Hoarder, Rare Hunter |
| "nft"       | All NFT-related achievements            |
| "trader"    | Trading achievements                    |
| "social"    | Social sharing achievements             |
| "milestone" | All milestone achievements              |
| "1000"      | Achievements with 1000 in description   |
| "create"    | Creator achievements                    |
| "daily"     | Daily reward achievements               |

---

## Status Filter Examples

```typescript
// User wants to see what they've accomplished
const completed = await achievementService.getAchievementsByStatus(userId, 'unlocked');

// User wants to see current goals
const goals = await achievementService.getAchievementsByStatus(userId, 'in-progress');

// User wants to see what's available
const available = await achievementService.getAchievementsByStatus(userId, 'locked');

// Combine for complete progress view
const unlocked = await achievementService.getAchievementsByStatus(userId, 'unlocked');
const inProgress = await achievementService.getAchievementsByStatus(userId, 'in-progress');
const locked = await achievementService.getAchievementsByStatus(userId, 'locked');

const totalPossible = unlocked.length + inProgress.length + locked.length;
const progressPercentage = (unlocked.length / totalPossible) * 100;
```

---

## Frontend Integration Points

1. **Achievement Discovery Page** - Add search bar + status tabs
2. **User Profile** - Show progress by status (pie chart)
3. **Achievement List** - Filter button for status
4. **Search Page** - Dedicated search interface
5. **Dashboard** - Quick search widget
6. **Mobile App** - Search overlay/modal

---

## Future Enhancements

- [ ] Advanced filters (by rarity, type, tier, season)
- [ ] Saved searches
- [ ] Search history
- [ ] Autocomplete suggestions
- [ ] Trending searches
- [ ] Similar achievements recommendations
- [ ] Full-text search on database
- [ ] Search analytics dashboard

---

## Related Documentation

- [Complete Gamification System](COMPLETE_GAMIFICATION_SYSTEM.md)
- [Gamification Method Index](GAMIFICATION_METHOD_INDEX.md)
- [Achievement Types Reference](ACHIEVEMENT_TYPES_REFERENCE.md)
- [Seasonal Achievements](SEASONAL_ACHIEVEMENTS_INTEGRATION.md)

---

## Method Signature Reference

```typescript
// Search by title and description
searchAchievements(query: string): Promise<AchievementSearchResult[]>

// Filter by unlock status
getAchievementsByStatus(
  userId: string,
  status: 'locked' | 'in-progress' | 'unlocked'
): Promise<Achievement[]>
```

---

**Last Updated:** Session 2 (Jan 15, 2026)  
**Status:** ✅ Backend Implementation Complete | 🔄 Frontend Components | 🔄 API Endpoints | 🔄 Testing
