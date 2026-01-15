# Seasonal Achievements - Quick Reference

## 14 Core Methods

| Method                                              | Purpose                                | Returns                                                        |
| --------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `createSeason(season)`                              | Create new season                      | void                                                           |
| `getSeason(seasonId)`                               | Get season config                      | SeasonConfig \| undefined                                      |
| `getAllSeasons()`                                   | Get all seasons                        | SeasonConfig[]                                                 |
| `getActiveSeasons()`                                | Get active seasons                     | SeasonConfig[]                                                 |
| `getSeasonalAchievements(seasonId)`                 | Get season achievements                | SeasonalAchievement[]                                          |
| `getActiveSeasonsAchievements()`                    | Get achievements in all active seasons | Map<string, SeasonalAchievement[]>                             |
| `getUserSeasonalAchievements(userId, seasonId)`     | Get user's achievements                | SeasonalAchievement[]                                          |
| `getSeasonalLeaderboard(seasonId, limit)`           | Get season leaderboard                 | SeasonalLeaderboardEntry[]                                     |
| `trackSeasonalXP(userId, seasonId, amount)`         | Add seasonal XP                        | void                                                           |
| `getUserSeasonalProgress(userId, seasonId)`         | Get user's progress                    | {xp, achievements, rank}                                       |
| `getSeasonTimeline()`                               | Get season timeline                    | {currentSeason?, upcomingSeason?, pastSeasons}                 |
| `getSeasonalAchievementCount(seasonId)`             | Count achievements                     | number                                                         |
| `getSeasonalCompletionPercentage(userId, seasonId)` | Get completion %                       | number                                                         |
| `getSeasonalRewards(userId, seasonId)`              | Calculate rewards                      | {totalSeasonalXP, seasonalAchievements, bonusXP, seasonReward} |

---

## Quick Examples

### Create Season

```typescript
await achievementService.createSeason({
  id: 'summer_2024',
  name: 'Summer Fun',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-08-31'),
  isActive: true,
  theme: 'summer',
  color: '#FFD700',
  icon: '☀️',
  description: 'Summer event season',
});
```

### Get Seasonal Achievements

```typescript
const achievements = await achievementService.getSeasonalAchievements('summer_2024');
// Returns with daysRemaining, isExpired, seasonName, etc.
```

### Get Season Leaderboard

```typescript
const top50 = await achievementService.getSeasonalLeaderboard('summer_2024', 50);
// Sorted by seasonalXP, cached for performance
```

### Track Progress

```typescript
// User completes achievement
await achievementService.trackSeasonalXP('userId', 'summer_2024', 100);

// View progress
const progress = await achievementService.getUserSeasonalProgress('userId', 'summer_2024');
// { xp: 1500, achievements: 8, rank: 5 }
```

### Get Timeline

```typescript
const timeline = await achievementService.getSeasonTimeline();
// { currentSeason: {...}, upcomingSeason: {...}, pastSeasons: [...] }
```

### Get Rewards

```typescript
const rewards = await achievementService.getSeasonalRewards('userId', 'summer_2024');
// { totalSeasonalXP: 2500, seasonalAchievements: 12, bonusXP: 1000, seasonReward: '👑 Season Master' }
```

---

## New Achievement Fields

```typescript
// Optional seasonal fields in Achievement interface
seasonId?: string;              // 'summer_2024'
seasonStartDate?: Date;         // Season begins
seasonEndDate?: Date;           // Season expires
isSeasonal?: boolean;           // true for seasonal achievements
```

---

## New Types

```typescript
interface SeasonConfig {
  id: string; // 'summer_2024'
  name: string; // 'Summer Fun'
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string; // 'summer', 'winter', etc.
  color: string; // '#FFD700'
  icon: string; // '☀️'
  isActive: boolean;
}

interface SeasonalAchievement extends Achievement {
  seasonId: string;
  seasonName: string;
  seasonStartDate: Date;
  seasonEndDate: Date;
  daysRemaining?: number; // Auto-calculated
  isExpired?: boolean; // Auto-detected
}

interface SeasonalLeaderboardEntry extends LeaderboardEntry {
  seasonId: string;
  seasonalXP: number;
  seasonalAchievements: number;
}
```

---

## New Data Structures

```typescript
// In achievementService.ts
const seasonConfigMap = new Map<string, SeasonConfig>(); // Stores seasons
const userSeasonalProgressMap = new Map<string, Map<string, number>>(); // User seasonal XP
const seasonalLeaderboardCache = new Map<string, SeasonalLeaderboardEntry[]>(); // Cached leaderboards
```

---

## API Endpoints

```
Season Management:
POST   /api/seasons                          Create season
GET    /api/seasons                          Get all seasons
GET    /api/seasons/:seasonId                Get specific season
GET    /api/seasons/active                   Get active seasons
GET    /api/seasons/timeline                 Get timeline

Achievements:
GET    /api/seasons/:seasonId/achievements   Get season's achievements
GET    /api/seasons/active/achievements      Get all active season achievements
GET    /api/users/:userId/seasons/:seasonId/achievements

Leaderboards & Progress:
GET    /api/seasons/:seasonId/leaderboard    Get season leaderboard
GET    /api/users/:userId/seasons/:seasonId/progress

Rewards:
GET    /api/users/:userId/seasons/:seasonId/rewards
POST   /api/users/:userId/seasons/:seasonId/expire
```

---

## Completion Bonuses

| Completion | Bonus XP | Reward Title          |
| ---------- | -------- | --------------------- |
| 100%       | 1000 XP  | 👑 Season Master      |
| 75%+       | 500 XP   | 🌟 Season Champion    |
| 50%+       | 250 XP   | ⭐ Season Participant |
| 25%+       | 100 XP   | 💫 Season Explorer    |
| <25%       | —        | —                     |

---

## Backward Compatibility

✅ All seasonal fields are **optional** - existing achievements work unchanged  
✅ LeaderboardEntry extended with seasonal fields - base functionality preserved  
✅ Integration with existing 81 methods - no breaking changes  
✅ Separate leaderboard tracking - doesn't affect global leaderboards

---

## Performance Features

- **Cached Leaderboards** - getSeasonalLeaderboard() results cached by seasonId
- **Automatic Caching** - Cache cleared when season expires
- **Efficient Sorting** - Sorted by seasonalXP primary, totalXP secondary
- **Date-Based Filtering** - Fast expiry detection using Date comparisons

---

## Integration Points

1. **ACHIEVEMENTS array** - Add seasonal flag and dates to seasonal achievements
2. **Achievement Unlock** - Call `trackSeasonalXP()` when seasonal achievement unlocked
3. **Frontend UI** - Display seasonal badge, timer, expired status
4. **Leaderboard View** - Add "Seasonal" tab filtering by season
5. **User Profile** - Show seasonal badges and progress
6. **Admin Panel** - Create seasons, manage duration
7. **Email/Notifications** - Alert when season ending soon

---

## Common Workflows

### End-of-Season Process

```typescript
// 1. When season ends
const expiredCount = await achievementService.expireSeasonalAchievements('summer_2024');

// 2. Calculate final rewards for all users
const users = await getUserList();
for (const user of users) {
  const rewards = await achievementService.getSeasonalRewards(user.id, 'summer_2024');
  await awardBonusXP(user.id, rewards.bonusXP);
  await grantBadge(user.id, rewards.seasonReward);
}
```

### Create New Season

```typescript
// 1. Create season config
const newSeason = {
  id: 'fall_2024',
  name: 'Autumn Harvest',
  description: 'Fall season special achievements',
  startDate: new Date('2024-09-01'),
  endDate: new Date('2024-11-30'),
  theme: 'autumn',
  color: '#FF8C00',
  icon: '🍂',
  isActive: true,
};

// 2. Save season
await achievementService.createSeason(newSeason);

// 3. Add seasonal achievements
const seasonalAchievements = [
  { ...achievement1, seasonId: 'fall_2024', isSeasonal: true },
  { ...achievement2, seasonId: 'fall_2024', isSeasonal: true },
];

// 4. Display in UI with timers
```

### Display Seasonal Content

```typescript
// Get active seasons achievements
const activeSeasonal = await achievementService.getActiveSeasonsAchievements();

// Group by season in UI
for (const [seasonId, achievements] of activeSeasonal) {
  const season = await achievementService.getSeason(seasonId);
  // Render seasonal section with countdown timer
}
```

---

## Testing Checklist

- [ ] Create season with createSeason()
- [ ] Retrieve season with getSeason()
- [ ] Get active seasons with getActiveSeasons()
- [ ] Verify achievements return daysRemaining
- [ ] Verify achievements return isExpired
- [ ] Get leaderboard and verify caching
- [ ] Track seasonal XP and verify progress
- [ ] Get user progress and verify rankings
- [ ] Get timeline and verify current/upcoming/past
- [ ] Expire season and verify cache cleared
- [ ] Calculate completion % correctly
- [ ] Calculate end-of-season rewards with bonuses

---

## File Locations

- **Type Definitions**: [gamification.ts](src/types/gamification.ts) (lines 16-33, 250-318)
- **Methods**: [achievementService.ts](src/services/achievementService.ts) (lines 1705-1902)
- **Data Structures**: [achievementService.ts](src/services/achievementService.ts) (lines 39-42)

---

## Related Features

- **Achievements** - Base achievement system (13+ types)
- **Tiers** - 4-tier ranking system (Bronze/Silver/Gold/Platinum)
- **Leaderboards** - Global and category leaderboards
- **Streaks** - Daily and collection streaks
- **Notifications** - Achievement unlock notifications
- **Social Features** - Follow/unfollow, dueling profiles

---

## Next Steps

1. Add seasonal achievements to ACHIEVEMENTS array
2. Create React components for seasonal UI
3. Add seasonal endpoints to API
4. Implement seasonal dashboard
5. Set up season schedule
6. Create season creation admin panel
7. Add seasonal notifications
8. Archive seasonal data

---

## Support

For detailed documentation, see [SEASONAL_ACHIEVEMENTS_INTEGRATION.md](SEASONAL_ACHIEVEMENTS_INTEGRATION.md)

Questions? Refer to [Gamification Method Index](GAMIFICATION_METHOD_INDEX.md) for all 95+ methods.
