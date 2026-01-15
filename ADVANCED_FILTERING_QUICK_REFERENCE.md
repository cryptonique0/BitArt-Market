# Advanced Filtering & Search - Quick Reference

## 2 New Methods

| Method                                    | Purpose                                            | Returns                   |
| ----------------------------------------- | -------------------------------------------------- | ------------------------- |
| `searchAchievements(query)`               | Search by title/description with relevance scoring | AchievementSearchResult[] |
| `getAchievementsByStatus(userId, status)` | Filter by unlock status for user                   | Achievement[]             |

---

## Quick Examples

### Search Achievements

```typescript
// Find achievements matching "collector"
const results = await achievementService.searchAchievements('collector');
// Returns achievements ranked by relevance

// Process results
results.forEach(result => {
  console.log(`${result.achievement.title}`);
  console.log(`Score: ${result.matchScore}% (${result.matchReason})`);
});
```

### Filter by Status

```typescript
// Get user's unlocked achievements
const unlocked = await achievementService.getAchievementsByStatus(userId, 'unlocked');

// Get achievements they're working on
const inProgress = await achievementService.getAchievementsByStatus(userId, 'in-progress');

// Get available achievements (not started)
const locked = await achievementService.getAchievementsByStatus(userId, 'locked');
```

---

## Search Results

### AchievementSearchResult

```typescript
{
  achievement: Achievement; // The achievement object
  matchScore: number; // 0-100, higher = better
  matchReason: 'title' | 'description' | 'both';
}
```

**Score Ranges:**

- Title match: 80-100
- Description match: 60-80
- Both: 95-100

### Status Types

```typescript
type AchievementStatus = 'locked' | 'in-progress' | 'unlocked';
```

---

## Achievement Status Definition

| Status          | Meaning                   | Progress |
| --------------- | ------------------------- | -------- |
| `'unlocked'`    | User has obtained it      | 100%     |
| `'in-progress'` | User started but not done | 1-99%    |
| `'locked'`      | User hasn't started       | 0%       |

---

## Real-World Examples

### Search Use Cases

```typescript
// Search for NFT-related achievements
const nftAchs = await achievementService.searchAchievements('NFT');

// Search for trading achievements
const tradeAchs = await achievementService.searchAchievements('trader');

// Search for social achievements
const socialAchs = await achievementService.searchAchievements('social');

// Autocomplete suggestions
const suggestions = await achievementService.searchAchievements('coll');
// Returns "Art Collector", "Collector Pro", etc.
```

### Status Filter Use Cases

```typescript
// Display user's progress
async function displayProgress(userId: string) {
  const unlocked = await achievementService.getAchievementsByStatus(userId, 'unlocked');
  const inProgress = await achievementService.getAchievementsByStatus(userId, 'in-progress');
  const locked = await achievementService.getAchievementsByStatus(userId, 'locked');

  console.log(`
    ✅ Completed: ${unlocked.length}
    🔄 In Progress: ${inProgress.length}
    🔒 Available: ${locked.length}
  `);
}

// Show current goals (in-progress achievements)
async function showCurrentGoals(userId: string) {
  const goals = await achievementService.getAchievementsByStatus(userId, 'in-progress');
  goals.forEach(goal => {
    console.log(`Working on: ${goal.title}`);
  });
}
```

---

## Search Algorithm

**Steps:**

1. Check if title contains query
2. Check if description contains query
3. Calculate match score based on both
4. Sort by score (highest first)

**Score Calculation:**

- Exact title match: 100
- Title substring: 80-95 (based on match quality)
- Description match: 60-80
- Both title and description: 95-100

---

## API Endpoints

```
Search:
GET /api/achievements/search?q=collector
    Returns: AchievementSearchResult[]

Filter by Status:
GET /api/users/user123/achievements/status/unlocked
    Returns: Achievement[]

Options:
GET /api/users/user123/achievements/status/in-progress
GET /api/users/user123/achievements/status/locked
```

---

## React Component Usage

### Basic Search

```typescript
const [results, setResults] = useState<AchievementSearchResult[]>([]);

const handleSearch = async (query: string) => {
  const results = await achievementService.searchAchievements(query);
  setResults(results);
};

// Display results
{results.map(result => (
  <div key={result.achievement.id}>
    <h3>{result.achievement.title}</h3>
    <p>Match: {result.matchScore}%</p>
  </div>
))}
```

### Status Filter

```typescript
const [status, setStatus] = useState<AchievementStatus>('unlocked');
const [achievements, setAchievements] = useState<Achievement[]>([]);

useEffect(() => {
  (async () => {
    const ach = await achievementService.getAchievementsByStatus(userId, status);
    setAchievements(ach);
  })();
}, [status, userId]);
```

---

## Matching Examples

```
Search: "collect"

Achievement "Art Collector"
- Title contains "collect" ✓
- Score: 90
- Reason: 'title'

Achievement "Hoarder Pro"
- Description: "become a collector..."
- Score: 75
- Reason: 'description'

Achievement "Elite NFT Collector"
- Title: "Elite NFT Collector" (exact substring)
- Score: 95+
- Reason: 'title'
```

---

## Type Definitions

```typescript
export type AchievementStatus = 'locked' | 'in-progress' | 'unlocked';

export interface AchievementSearchResult {
  achievement: Achievement;
  matchScore: number;
  matchReason: string;
}

export interface AchievementsByStatus {
  locked: Achievement[];
  inProgress: Achievement[];
  unlocked: Achievement[];
}
```

---

## Integration Points

1. **Search Bar** - Add to achievement page header
2. **Status Tabs** - Add to achievements view (Unlocked | In Progress | Locked)
3. **Discovery** - New discovery/search page
4. **Profile** - Show progress by status
5. **Dashboard** - Quick search widget
6. **Mobile** - Search modal/overlay

---

## Common Workflows

### Display Achievement Dashboard

```typescript
async function getAchievementDashboard(userId: string) {
  const [unlocked, inProgress, locked] = await Promise.all([
    achievementService.getAchievementsByStatus(userId, 'unlocked'),
    achievementService.getAchievementsByStatus(userId, 'in-progress'),
    achievementService.getAchievementsByStatus(userId, 'locked'),
  ]);

  return {
    completed: unlocked.length,
    goals: inProgress.length,
    available: locked.length,
    progress: (unlocked.length / (unlocked.length + locked.length)) * 100,
  };
}
```

### Search with Autocomplete

```typescript
async function handleSearchInput(query: string) {
  if (query.length < 2) return [];

  const results = await achievementService.searchAchievements(query);
  // Return top 5 matches for autocomplete
  return results.slice(0, 5);
}
```

### Find Similar Achievements

```typescript
async function findSimilar(achievementTitle: string) {
  // Search for achievements with similar words
  const words = achievementTitle.split(' ');
  const results = [];

  for (const word of words) {
    const matches = await achievementService.searchAchievements(word);
    results.push(...matches);
  }

  // Return unique, sorted by score
  return [...new Set(results)].sort((a, b) => b.matchScore - a.matchScore);
}
```

---

## Performance Tips

- Debounce search input: `300-500ms`
- Cache search results: `5 minutes`
- Paginate large result sets: `10-20 per page`
- Use status filters instead of search for quick views

---

## File Locations

- **Type Definitions**: [gamification.ts](src/types/gamification.ts)
- **Methods**: [achievementService.ts](src/services/achievementService.ts)
- **Documentation**: [ADVANCED_FILTERING_SEARCH_INTEGRATION.md](ADVANCED_FILTERING_SEARCH_INTEGRATION.md)

---

## Testing Checklist

- [ ] Search returns empty array for empty query
- [ ] Search returns results for valid queries
- [ ] Results sorted by match score (descending)
- [ ] Title matches score higher than description
- [ ] Case-insensitive matching works
- [ ] getAchievementsByStatus returns unlocked achievements
- [ ] getAchievementsByStatus returns in-progress achievements
- [ ] getAchievementsByStatus returns locked achievements
- [ ] Status filter respects user progress
- [ ] Performance acceptable (< 100ms for search)

---

## System Total

- **Total Methods**: 97+ (81 + 14 seasonal + 2 filtering/search)
- **Features**: 10 (8 + seasonal + filtering/search)
- **Type Definitions**: 30+
- **Lines of Code**: 2000+

---

## Related Features

- **Achievements** - Base achievement system (13+ types)
- **Leaderboards** - Global and category leaderboards
- **Seasonal** - Time-limited seasonal achievements
- **Notifications** - Achievement unlock notifications
- **Social** - Follow/compare with friends

---

**Last Updated:** Session 2 (Jan 15, 2026)  
**Methods:** 2 ✅ | **Status:** ✅ Complete
