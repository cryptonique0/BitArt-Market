# Advanced Leaderboard Queries Integration Guide

## Overview

Complete advanced leaderboard system with category filtering, contextual rankings, and comprehensive statistics for the achievement and gamification system.

## Data Structures

### UserXPTracker

Tracks all XP sources per user for comprehensive performance metrics.

```typescript
interface UserXPTracker {
  userId: string;
  totalXP: number; // Total XP from all sources
  achievementXP: number; // XP from achievement unlocks
  dailyStreakXP: number; // XP from daily streaks
  lastUpdated: Date; // Last update timestamp
}
```

**Usage Example:**

```typescript
const tracker = achievementService.getUserXPTracker(userId);
console.log(`Total XP: ${tracker.totalXP}`);
console.log(`Achievement XP: ${tracker.achievementXP}`);
console.log(`Streak Bonus XP: ${tracker.dailyStreakXP}`);
```

### CategoryLeaderboardEntry

Represents a single leaderboard entry with ranking information.

```typescript
interface CategoryLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number; // XP in category or globally
  achievementCount: number; // Achievements unlocked in category
  rank: number; // Current ranking position
  type: AchievementType; // Category type
}
```

## Advanced Leaderboard Methods

### 1. Category-Based Leaderboards

#### `getLeaderboardByType(type: AchievementType, limit?: number): Promise<CategoryLeaderboardEntry[]>`

Get leaderboard filtered by achievement category.

```typescript
// Get top 10 creators
const topCreators = await achievementService.getLeaderboardByType(AchievementType.CREATOR, 10);

// Get top 20 collectors
const topCollectors = await achievementService.getLeaderboardByType(AchievementType.COLLECTOR, 20);

// Get all traders (no limit)
const allTraders = await achievementService.getLeaderboardByType(AchievementType.TRADER, 1000);
```

**Returns:** Sorted by XP (descending) → Achievement count (descending)

**Use Cases:**

- Display category-specific leaderboards on separate tabs
- Show "Top Creators" widget
- Category badges on user profiles
- Achievement category rankings

---

### 2. Contextual User Rankings

#### `getLeaderboardAroundUser(userId: string, range?: number, type?: AchievementType): Promise<CategoryLeaderboardEntry[]>`

Get leaderboard entries around a specific user for contextual view.

```typescript
// Get user with 5 entries above and below
const context = await achievementService.getLeaderboardAroundUser(userId, 5);

// Get creator leaderboard context
const creatorContext = await achievementService.getLeaderboardAroundUser(
  userId,
  3,
  AchievementType.CREATOR
);

// Get wider context (10 above/below)
const wideContext = await achievementService.getLeaderboardAroundUser(userId, 10);
```

**Returns:** Array of leaderboard entries centered around the user

**Display Example:**

```
      #42 UserA - 5000 XP
      #43 UserB - 4950 XP
      #44 UserC - 4900 XP
      #45 >>> YOU <<< - 4850 XP ← Current user
      #46 UserD - 4800 XP
      #47 UserE - 4750 XP
      #48 UserF - 4700 XP
```

**Use Cases:**

- "Where do you rank?" widget on profile
- Leaderboard context page
- Competitive ranking view
- Local area rankings

---

### 3. Overall Statistics

#### `getLeaderboardStats(): Promise<LeaderboardStatsObject>`

Get comprehensive leaderboard statistics and metrics.

```typescript
const stats = await achievementService.getLeaderboardStats();

console.log(`Total Players: ${stats.totalPlayers}`);
console.log(`Total XP Distributed: ${stats.totalXPDistributed}`);
console.log(`Average XP per Player: ${stats.averageUserXP.toFixed(0)}`);
console.log(`Current Leader: ${stats.topUser?.username} (${stats.topUser?.totalXP} XP)`);
```

**Returns:**

```typescript
{
  totalPlayers: number; // Active users in system
  totalXPDistributed: number; // Sum of all user XP
  averageUserXP: number; // Mean XP per player
  topUser: CategoryLeaderboardEntry | null; // #1 ranked user
}
```

**Use Cases:**

- Dashboard analytics
- System statistics page
- Health metrics
- Progress tracking
- Engagement analytics

---

### 4. User-Specific Ranking

#### `getUserLeaderboardPosition(userId: string): Promise<UserPositionObject>`

Get detailed ranking information for a specific user.

```typescript
const position = await achievementService.getUserLeaderboardPosition(userId);

if (position) {
  console.log(`Global Rank: #${position.rank}`);
  console.log(`Total XP: ${position.totalXP}`);
  console.log(`Top ${position.percentile.toFixed(1)}%`);
  console.log(`Achievements: ${position.achievementCount}`);
}
```

**Returns:**

```typescript
{
  userId: string;
  rank: number;                      // Global ranking position
  totalXP: number;                   // Total XP accumulated
  percentile: number;                // 0-100 percentile ranking
  achievementCount: number;          // Total achievements unlocked
} | null
```

**Percentile Calculation:**

- 100% = Last place (lowest XP)
- 50% = Median player
- 0.1% = Top 0.1% (approaching #1)

**Use Cases:**

- User profile badge ("Top 5%")
- Achievement unlock message
- Competitive milestones
- Progress notifications

---

### 5. Core Leaderboard Method

#### `getLeaderboard(type?: AchievementType, limit?: number): Promise<CategoryLeaderboardEntry[]>`

Base leaderboard method supporting all queries.

```typescript
// Global leaderboard - top 100
const global = await achievementService.getLeaderboard(undefined, 100);

// Category leaderboard - top 50 collectors
const collectors = await achievementService.getLeaderboard(AchievementType.COLLECTOR, 50);
```

**Sorting Logic:**

1. Total XP (highest first)
2. Achievement count (most first)
3. Last updated timestamp (most recent first)

---

## Complete Usage Examples

### Example 1: Leaderboard Dashboard

```typescript
async function buildLeaderboardDashboard() {
  // Global stats
  const stats = await achievementService.getLeaderboardStats();

  // Category leaders
  const creators = await achievementService.getLeaderboardByType(AchievementType.CREATOR, 5);
  const collectors = await achievementService.getLeaderboardByType(AchievementType.COLLECTOR, 5);
  const traders = await achievementService.getLeaderboardByType(AchievementType.TRADER, 5);

  return {
    stats: {
      totalPlayers: stats.totalPlayers,
      avgXP: stats.averageUserXP,
      leader: stats.topUser?.username,
    },
    topCreators: creators,
    topCollectors: collectors,
    topTraders: traders,
  };
}
```

### Example 2: User Profile Widget

```typescript
async function getUserProfileBadges(userId: string) {
  const position = await achievementService.getUserLeaderboardPosition(userId);
  const userStreak = await achievementService.getStreakStats(userId);
  const badges = await achievementService.getUserBadges(userId);

  return {
    rank: `#${position?.rank}`,
    percentile: `Top ${position?.percentile.toFixed(0)}%`,
    xp: position?.totalXP,
    achievements: position?.achievementCount,
    streak: userStreak?.currentStreak,
    badges: badges,
  };
}
```

### Example 3: Competitive Ranking View

```typescript
async function getRankingContext(userId: string) {
  const userPos = await achievementService.getUserLeaderboardPosition(userId);
  const context = await achievementService.getLeaderboardAroundUser(userId, 4);

  return {
    yourRank: userPos?.rank,
    yourXP: userPos?.totalXP,
    context: context.map(entry => ({
      rank: entry.rank,
      username: entry.username,
      xp: entry.totalXP,
      isYou: entry.userId === userId,
    })),
  };
}
```

### Example 4: Category Leaders Page

```typescript
async function getCategoryLeaders(category: AchievementType) {
  const leaders = await achievementService.getLeaderboardByType(category, 20);

  return {
    category: category,
    leaders: leaders.map(entry => ({
      rank: entry.rank,
      username: entry.username,
      xp: entry.totalXP,
      achievements: entry.achievementCount,
      badge: getRankBadge(entry.rank),
    })),
  };
}

function getRankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '⭐';
  return null;
}
```

### Example 5: XP Breakdown View

```typescript
async function getDetailedXPBreakdown(userId: string) {
  const tracker = achievementService.getUserXPTracker(userId);

  if (!tracker) return null;

  const achievementPct = (tracker.achievementXP / tracker.totalXP) * 100;
  const streakPct = (tracker.dailyStreakXP / tracker.totalXP) * 100;

  return {
    totalXP: tracker.totalXP,
    sources: {
      achievements: {
        xp: tracker.achievementXP,
        percent: achievementPct.toFixed(1),
      },
      dailyStreaks: {
        xp: tracker.dailyStreakXP,
        percent: streakPct.toFixed(1),
      },
    },
    lastUpdated: tracker.lastUpdated,
  };
}
```

---

## Frontend Integration Points

### Leaderboard Pages

```typescript
// pages/leaderboard.tsx
export async function LeaderboardPage() {
  const [category, setCategory] = useState<AchievementType>(AchievementType.CREATOR);

  const leaders = await achievementService.getLeaderboardByType(category, 100);

  return (
    <div>
      <CategoryTabs current={category} onChange={setCategory} />
      <LeaderboardTable entries={leaders} />
    </div>
  );
}
```

### User Profile

```typescript
// components/profile/RankingBadge.tsx
export async function RankingBadge({ userId }: { userId: string }) {
  const position = await achievementService.getUserLeaderboardPosition(userId);

  return (
    <div className="ranking-badge">
      <span>Rank: #{position?.rank}</span>
      <span>Top {position?.percentile.toFixed(0)}%</span>
    </div>
  );
}
```

### Contextual Ranking Widget

```typescript
// components/leaderboard/RankingContext.tsx
export async function RankingContext({ userId }: { userId: string }) {
  const context = await achievementService.getLeaderboardAroundUser(userId, 3);

  return (
    <ul className="ranking-context">
      {context.map(entry => (
        <li key={entry.userId} className={entry.userId === userId ? 'current' : ''}>
          #{entry.rank} - {entry.username} ({entry.totalXP} XP)
        </li>
      ))}
    </ul>
  );
}
```

### Dashboard Statistics

```typescript
// components/dashboard/LeaderboardStats.tsx
export async function LeaderboardStats() {
  const stats = await achievementService.getLeaderboardStats();

  return (
    <div className="stats-grid">
      <StatCard title="Total Players" value={stats.totalPlayers} />
      <StatCard title="Avg XP/Player" value={Math.floor(stats.averageUserXP)} />
      <StatCard
        title="Current Leader"
        value={stats.topUser?.username}
        subtitle={`${stats.topUser?.totalXP} XP`}
      />
      <StatCard title="Total XP Distributed" value={stats.totalXPDistributed} />
    </div>
  );
}
```

---

## Performance Optimization

### Caching Strategy

```typescript
// Cache leaderboards for 5 minutes
const leaderboardCache = new Map<
  string,
  {
    data: CategoryLeaderboardEntry[];
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedLeaderboard(type?: AchievementType, limit?: number) {
  const cacheKey = `${type || 'global'}_${limit}`;
  const cached = leaderboardCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await achievementService.getLeaderboard(type, limit);
  leaderboardCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
```

### Pagination

```typescript
// Get page 2 of leaderboard (25 per page)
const pageSize = 25;
const page = 2;
const allLeaders = await achievementService.getLeaderboard(undefined, 10000);
const pageData = allLeaders.slice((page - 1) * pageSize, page * pageSize);
```

---

## Data Accuracy

### Automatic Updates

- XP automatically tracked on achievement unlock
- Leaderboard recalculated on each query
- Category filters applied in real-time

### Manual Sync

```typescript
// Refresh all leaderboards
const allXP = achievementService.getAllUserXP();
allXP.forEach((tracker, userId) => {
  // Process each user's XP data
});
```

---

## API Endpoints (If REST)

```typescript
// GET /api/leaderboard
// Returns: Global top 100

// GET /api/leaderboard?type=creator&limit=20
// Returns: Top 20 creators

// GET /api/leaderboard/user/:userId
// Returns: User's position and stats

// GET /api/leaderboard/user/:userId/context?range=5
// Returns: User with 5 above/below

// GET /api/leaderboard/stats
// Returns: Global statistics

// GET /api/leaderboard/:type
// Returns: Category-specific leaders
```

---

## Summary

**Advanced Leaderboard Features:**
✅ Category filtering by achievement type
✅ Contextual user rankings with nearby players
✅ Comprehensive system statistics
✅ XP source breakdown (achievements vs streaks)
✅ Percentile-based rankings
✅ Real-time sorting and filtering
✅ Multiple view types (global, category, personal, contextual)

**Integration Ready:**
✅ Dashboard widgets
✅ Profile badges
✅ Leaderboard pages
✅ Competitive features
✅ Analytics dashboard
✅ Notification triggers
