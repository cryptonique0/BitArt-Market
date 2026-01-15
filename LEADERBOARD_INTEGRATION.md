# Leaderboard Integration Guide

## Overview

Complete leaderboard system integrated into the achievement service with XP tracking, ranking, and category-based filtering.

## Key Features

### 1. XP Tracking System

- **Automatic XP Recording**: XP automatically tracked when achievements are unlocked
- **Sources**: Achievement completion and daily streak bonuses
- **User XP Tracker**: Tracks total XP, achievement XP, and daily streak XP separately

### 2. Global Leaderboards

- **Top Players**: Get global rankings by total XP
- **Time-based**: Tracks last updated timestamp for each user
- **Sorted by**: Primary: Total XP (descending) | Secondary: Achievement count

### 3. Category-Specific Leaderboards

- **Creator Leaderboard**: Top creators by XP and achievements
- **Collector Leaderboard**: Top collectors by XP and achievements
- **Trader Leaderboard**: Top traders by XP and achievements
- **Social Leaderboard**: Top social achievers

### 4. User Ranking System

- **Rank Calculation**: Real-time ranking based on total XP
- **Percentile**: User's percentile ranking among all players
- **Position Info**: Rank, XP, achievements, percentile

## New Data Types

### UserXPTracker

```typescript
interface UserXPTracker {
  userId: string;
  totalXP: number; // Total XP from all sources
  achievementXP: number; // XP from achievement unlocks
  dailyStreakXP: number; // XP from daily streaks
  lastUpdated: Date; // Last update timestamp
}
```

### CategoryLeaderboardEntry

```typescript
interface CategoryLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number; // XP in this category
  achievementCount: number; // Achievements unlocked in category
  rank: number; // Current ranking
  type: AchievementType; // Category type
}
```

## New Service Methods

### XP Tracking Methods

#### `trackUserXP(userId, xpAmount, source)`

Manually track XP for a user from a specific source.

```typescript
await achievementService.trackUserXP(userId, 100, 'achievement');
// Returns: UserXPTracker
```

#### `getUserXPTracker(userId)`

Get XP tracking data for a specific user.

```typescript
const tracker = achievementService.getUserXPTracker(userId);
// Returns: UserXPTracker | undefined
```

#### `getAllUserXP()`

Get all users' XP data.

```typescript
const allXP = achievementService.getAllUserXP();
// Returns: Map<string, UserXPTracker>
```

### Leaderboard Methods

#### `getLeaderboard(type?, limit)`

Get global leaderboard, optionally filtered by achievement type.

```typescript
// Global leaderboard - top 10
const global = await achievementService.getLeaderboard(undefined, 10);

// Creator leaderboard - top 20
const creators = await achievementService.getLeaderboard(AchievementType.CREATOR, 20);

// Returns: CategoryLeaderboardEntry[]
```

#### `getUserRank(userId, type?)`

Get user's current ranking position.

```typescript
const rank = await achievementService.getUserRank(userId);
// Returns: number | null

const creatorRank = await achievementService.getUserRank(userId, AchievementType.CREATOR);
```

#### `getLeaderboardAroundUser(userId, range?, type?)`

Get leaderboard entries around a user's position.

```typescript
// User's position with 5 entries above and below
const around = await achievementService.getLeaderboardAroundUser(userId, 5);
// Returns: CategoryLeaderboardEntry[]
```

#### `getLeaderboardByType(type, limit)`

Get leaderboard filtered by achievement type.

```typescript
const collectors = await achievementService.getLeaderboardByType(AchievementType.COLLECTOR, 10);
```

#### `getLeaderboardStats()`

Get overall leaderboard statistics.

```typescript
const stats = await achievementService.getLeaderboardStats();
// Returns: {
//   totalPlayers: number,
//   totalXPDistributed: number,
//   averageUserXP: number,
//   topUser: CategoryLeaderboardEntry | null
// }
```

#### `getUserLeaderboardPosition(userId)`

Get detailed position info for a user.

```typescript
const position = await achievementService.getUserLeaderboardPosition(userId);
// Returns: {
//   userId: string,
//   rank: number,
//   totalXP: number,
//   percentile: number,    // 0-100
//   achievementCount: number
// } | null
```

## Usage Examples

### Example 1: Display Global Top 10

```typescript
const topPlayers = await achievementService.getLeaderboard(undefined, 10);
topPlayers.forEach(entry => {
  console.log(`#${entry.rank}. ${entry.username}: ${entry.totalXP} XP`);
});
```

### Example 2: Check User's Rank

```typescript
const userPosition = await achievementService.getUserLeaderboardPosition(userId);
console.log(`You are rank #${userPosition.rank} in the top ${userPosition.percentile}%`);
```

### Example 3: Creator Category Leaderboard

```typescript
const creatorLeaders = await achievementService.getLeaderboardByType(AchievementType.CREATOR, 20);
console.log('Top 20 Creators:', creatorLeaders);
```

### Example 4: Leaderboard Around User

```typescript
const context = await achievementService.getLeaderboardAroundUser(userId, 3);
// Shows user with 3 above and 3 below for context
```

### Example 5: Statistics

```typescript
const stats = await achievementService.getLeaderboardStats();
console.log(`Total Players: ${stats.totalPlayers}`);
console.log(`Total XP Distributed: ${stats.totalXPDistributed}`);
console.log(`Average XP per Player: ${stats.averageUserXP}`);
console.log(`Current Leader: ${stats.topUser?.username} (${stats.topUser?.totalXP} XP)`);
```

## Automatic XP Tracking

XP is automatically tracked in these scenarios:

### 1. Achievement Unlock

```typescript
// When achievement is unlocked directly
await achievementService.unlockAchievement(userId, achievementId);
// XP from achievement automatically added to achievementXP
```

### 2. Progress-based Achievement

```typescript
// When achievement is completed through progress update
await achievementService.updateProgress(userId, achievementId, progressValue);
// XP automatically added when progress >= requirement
```

### 3. Manual XP Tracking

```typescript
// For daily streaks or other sources
await achievementService.trackUserXP(userId, xpAmount, 'daily_streak');
```

## Frontend Integration Points

### Display Global Ranking

```typescript
const leaderboard = await achievementService.getLeaderboard(undefined, 10);
// Render leaderboard with rank, username, XP, achievements
```

### Show User's Position

```typescript
const position = await achievementService.getUserLeaderboardPosition(userId);
// Display: "You are ranked #47 globally in top 95%"
```

### Category Leaders

```typescript
const categories = [AchievementType.CREATOR, AchievementType.COLLECTOR, AchievementType.TRADER];

for (const type of categories) {
  const leaders = await achievementService.getLeaderboardByType(type, 3);
  // Display top 3 in each category
}
```

### User Profile Widget

```typescript
const userData = await achievementService.getUserLeaderboardPosition(userId);
// Show rank badge on user profile
// "Global Rank: #47 | Percentile: 95"
```

## Data Structure

### XP Distribution

- Achievement XP: Added when achievement is unlocked
- Daily Streak XP: Added through streak bonuses
- Total XP: Sum of all sources

### Sorting Rules

1. **Primary**: Total XP (highest first)
2. **Secondary**: Achievement count (most first)
3. **Tertiary**: Last updated date (recent first)

### Ranking Rules

- Rank #1 = Highest total XP
- Ties resolved by achievement count
- Percentile = (Total Players - Rank) / Total Players \* 100

## Performance Considerations

- Leaderboard data stored in-memory Maps
- `getLeaderboard()` performs full sort on each call
- For production: Consider database storage and caching
- Category filtering done client-side after full fetch

## Future Enhancements

- [ ] Persist leaderboard data to database
- [ ] Time-based leaderboards (weekly, monthly, seasonal)
- [ ] Friend leaderboards
- [ ] Leaderboard caching for performance
- [ ] Detailed XP history per user
- [ ] Leaderboard achievements (e.g., "Rank in Top 100")
- [ ] Regional/guild leaderboards
