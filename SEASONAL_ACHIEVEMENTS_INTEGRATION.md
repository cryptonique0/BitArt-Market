# Seasonal/Time-Based Achievements - Integration Guide

## Overview

Seasonal achievements are limited-time achievements that are available only during specific seasons or time periods. This feature enables time-based challenges, special events, and rotating content.

---

## New Types Added

### SeasonConfig

```typescript
interface SeasonConfig {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  color: string;
  icon: string;
  isActive: boolean;
}
```

### SeasonalAchievement

```typescript
interface SeasonalAchievement extends Achievement {
  seasonId: string;
  seasonName: string;
  seasonStartDate: Date;
  seasonEndDate: Date;
  daysRemaining?: number;
  isExpired?: boolean;
}
```

### SeasonalLeaderboardEntry

```typescript
interface SeasonalLeaderboardEntry extends LeaderboardEntry {
  seasonId: string;
  seasonalXP: number;
  seasonalAchievements: number;
}
```

---

## Achievement Fields Enhanced

The Achievement interface now includes:

```typescript
seasonId?: string;              // Seasonal achievement identifier
seasonStartDate?: Date;         // When the seasonal achievement period starts
seasonEndDate?: Date;           // When the seasonal achievement expires
isSeasonal?: boolean;           // Mark as seasonal achievement
```

---

## Core Methods

### Season Management

#### `createSeason(season: SeasonConfig): Promise<void>`

Create a new season with dates and theme.

```typescript
await achievementService.createSeason({
  id: 'winter_2024',
  name: 'Winter Wonderland',
  description: 'Holiday season special achievements',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2025-01-31'),
  theme: 'winter',
  color: '#0066ff',
  icon: '❄️',
  isActive: true,
});
```

#### `getSeason(seasonId: string): Promise<SeasonConfig | undefined>`

Get a specific season's configuration.

```typescript
const season = await achievementService.getSeason('winter_2024');
```

#### `getAllSeasons(): Promise<SeasonConfig[]>`

Get all seasons (past, present, future).

```typescript
const seasons = await achievementService.getAllSeasons();
```

#### `getActiveSeasons(): Promise<SeasonConfig[]>`

Get currently active seasons.

```typescript
const activeSeason = await achievementService.getActiveSeasons();
// Returns only seasons where startDate <= now <= endDate
```

---

### Seasonal Achievement Queries

#### `getSeasonalAchievements(seasonId: string): Promise<SeasonalAchievement[]>`

Get all achievements for a specific season, including expiry info.

```typescript
const winterAchs = await achievementService.getSeasonalAchievements('winter_2024');
// Returns:
// {
//   id: 'winter_gift',
//   title: 'Holiday Gift Giver',
//   seasonId: 'winter_2024',
//   seasonName: 'Winter Wonderland',
//   seasonStartDate: Date,
//   seasonEndDate: Date,
//   daysRemaining: 45,
//   isExpired: false
// }
```

#### `getActiveSeasonsAchievements(): Promise<Map<string, SeasonalAchievement[]>>`

Get all achievements across all active seasons.

```typescript
const allSeasonalAchs = await achievementService.getActiveSeasonsAchievements();
// Returns: Map<seasonId, SeasonalAchievement[]>
```

#### `getUserSeasonalAchievements(userId: string, seasonId: string): Promise<SeasonalAchievement[]>`

Get a user's achievements for a specific season with progress.

```typescript
const userWinterAchs = await achievementService.getUserSeasonalAchievements(
  'user123',
  'winter_2024'
);
```

---

### Seasonal Leaderboards

#### `getSeasonalLeaderboard(seasonId: string, limit: number = 20): Promise<SeasonalLeaderboardEntry[]>`

Get leaderboard for a specific season, ranked by seasonal XP.

```typescript
const winterLeaderboard = await achievementService.getSeasonalLeaderboard('winter_2024', 50);
// Returns users sorted by seasonal XP for winter_2024
// {
//   userId: 'user123',
//   username: 'User_user123...',
//   totalXP: 5000,
//   seasonId: 'winter_2024',
//   seasonalXP: 2500,
//   seasonalAchievements: 8,
//   rank: 1
// }
```

**Features:**

- Cached for performance
- Separate from global leaderboard
- Ranked by seasonal XP first, total XP second
- Includes completion metrics

---

### Seasonal Progress Tracking

#### `trackSeasonalXP(userId: string, seasonId: string, amount: number): Promise<void>`

Add XP to user's seasonal progress.

```typescript
// User completes a winter achievement
await achievementService.trackSeasonalXP('user123', 'winter_2024', 100);
```

#### `getUserSeasonalProgress(userId: string, seasonId: string): Promise<{xp, achievements, rank}>`

Get user's progress in a specific season.

```typescript
const progress = await achievementService.getUserSeasonalProgress('user123', 'winter_2024');
// {
//   xp: 2500,
//   achievements: 8,
//   rank: 1
// }
```

#### `getSeasonalCompletionPercentage(userId: string, seasonId: string): Promise<number>`

Get user's completion % for a season.

```typescript
const completion = await achievementService.getSeasonalCompletionPercentage(
  'user123',
  'winter_2024'
);
// Returns: 85.5 (meaning 85.5% of seasonal achievements unlocked)
```

---

### Timeline & Analytics

#### `getSeasonTimeline(): Promise<{currentSeason?, upcomingSeason?, pastSeasons}>`

Get season timeline (current, upcoming, past).

```typescript
const timeline = await achievementService.getSeasonTimeline();
// {
//   currentSeason: SeasonConfig,
//   upcomingSeason: SeasonConfig,
//   pastSeasons: SeasonConfig[]
// }
```

#### `getSeasonalAchievementCount(seasonId: string): Promise<number>`

Get total number of achievements in a season.

```typescript
const count = await achievementService.getSeasonalAchievementCount('winter_2024');
// Returns: 12
```

---

### Season Management

#### `expireSeasonalAchievements(seasonId: string): Promise<number>`

Mark a season as inactive and clear cache.

```typescript
const count = await achievementService.expireSeasonalAchievements('winter_2024');
// Returns count of achievements that expired
```

#### `getSeasonalRewards(userId: string, seasonId: string): Promise<{totalSeasonalXP, seasonalAchievements, bonusXP, seasonReward}>`

Calculate end-of-season rewards.

```typescript
const rewards = await achievementService.getSeasonalRewards('user123', 'winter_2024');
// {
//   totalSeasonalXP: 2500,
//   seasonalAchievements: 12,
//   bonusXP: 1000,  // 👑 Season Master (100% completion)
//   seasonReward: '👑 Season Master'
// }
```

**Completion Bonuses:**

- 100% completion: 1000 XP + 👑 Season Master
- 75%+ completion: 500 XP + 🌟 Season Champion
- 50%+ completion: 250 XP + ⭐ Season Participant
- 25%+ completion: 100 XP
- Below 25%: No bonus

---

## API Endpoints

```typescript
// Season Management
POST   /api/seasons                                    Create season
GET    /api/seasons/:seasonId                          Get season
GET    /api/seasons                                    Get all seasons
GET    /api/seasons/active                             Get active seasons
GET    /api/seasons/timeline                           Get timeline

// Seasonal Achievements
GET    /api/seasons/:seasonId/achievements             Get season achievements
GET    /api/seasons/active/achievements                Get active achievements
GET    /api/users/:userId/seasons/:seasonId/achievements  User's achievements

// Seasonal Leaderboards
GET    /api/seasons/:seasonId/leaderboard              Season leaderboard
GET    /api/users/:userId/seasons/:seasonId/progress   User progress

// Rewards
GET    /api/users/:userId/seasons/:seasonId/rewards    End-of-season rewards
POST   /api/users/:userId/seasons/:seasonId/expire     Expire achievements
```

---

## Implementation Example

### Create a Winter Season

```typescript
const winterSeason: SeasonConfig = {
  id: 'winter_2024',
  name: 'Winter Wonderland',
  description: 'Holiday season special achievements',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2025-01-31'),
  theme: 'winter',
  color: '#0066ff',
  icon: '❄️',
  isActive: true,
};

await achievementService.createSeason(winterSeason);
```

### Add Seasonal Achievements

```typescript
// Add winter-specific achievements to ACHIEVEMENTS array
const winterAchievements = [
  {
    id: 'winter_collector',
    title: 'Winter Collector',
    description: 'Collect 5 winter-themed NFTs',
    icon: '⛄',
    type: AchievementType.COLLECTOR,
    requirement: 5,
    xpReward: 150,
    rarity: 'uncommon',
    seasonId: 'winter_2024',
    seasonStartDate: new Date('2024-12-01'),
    seasonEndDate: new Date('2025-01-31'),
    isSeasonal: true,
  },
  {
    id: 'holiday_trader',
    title: 'Holiday Trader',
    description: 'Trade 10 items during holiday season',
    icon: '🎁',
    type: AchievementType.TRADER,
    requirement: 10,
    xpReward: 200,
    rarity: 'rare',
    seasonId: 'winter_2024',
    seasonStartDate: new Date('2024-12-01'),
    seasonEndDate: new Date('2025-01-31'),
    isSeasonal: true,
  },
];
```

### Track Seasonal Progress

```typescript
// User completes winter achievement
await achievementService.unlockAchievement('user123', 'winter_collector');
await achievementService.trackSeasonalXP('user123', 'winter_2024', 150);

// View user's winter progress
const progress = await achievementService.getUserSeasonalProgress('user123', 'winter_2024');
console.log(
  `Winter XP: ${progress.xp}, Achievements: ${progress.achievements}, Rank: ${progress.rank}`
);

// View winter leaderboard
const leaderboard = await achievementService.getSeasonalLeaderboard('winter_2024', 20);
```

---

## React Component Example

### Seasonal Achievement Display

```typescript
interface SeasonalAchievementProps {
  achievement: SeasonalAchievement;
  unlocked: boolean;
}

export function SeasonalAchievementBadge({ achievement, unlocked }: SeasonalAchievementProps) {
  const daysLeft = achievement.daysRemaining || 0;

  return (
    <div className={`seasonal-badge ${achievement.rarity} ${unlocked ? 'unlocked' : 'locked'}`}>
      <span className="icon">{achievement.icon}</span>
      <span className="title">{achievement.title}</span>
      <span className="season">{achievement.seasonName}</span>

      {!achievement.isExpired && daysLeft > 0 && (
        <span className="timer">⏱️ {daysLeft} days left</span>
      )}

      {achievement.isExpired && (
        <span className="expired">❌ Expired</span>
      )}

      {!unlocked && (
        <span className="locked">🔒</span>
      )}
    </div>
  );
}
```

### Seasonal Leaderboard Component

```typescript
interface SeasonalLeaderboardProps {
  seasonId: string;
  limit?: number;
}

export function SeasonalLeaderboard({ seasonId, limit = 20 }: SeasonalLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<SeasonalLeaderboardEntry[]>([]);

  useEffect(() => {
    achievementService.getSeasonalLeaderboard(seasonId, limit)
      .then(setLeaderboard);
  }, [seasonId, limit]);

  return (
    <div className="seasonal-leaderboard">
      <table>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.userId}>
              <td className="rank">#{entry.rank}</td>
              <td className="user">{entry.username}</td>
              <td className="seasonal-xp">{entry.seasonalXP} XP</td>
              <td className="achievements">{entry.seasonalAchievements} 🏆</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Key Features

✅ **Time-Limited Achievements** - Auto-expire after season ends  
✅ **Separate Leaderboards** - Track progress per season  
✅ **Completion Bonuses** - Extra XP for high completion %  
✅ **Season Timeline** - View current/upcoming/past seasons  
✅ **Cached Performance** - Fast seasonal leaderboard queries  
✅ **Progress Tracking** - Track individual user seasonal progress  
✅ **Expiry Management** - Auto-mark as expired  
✅ **End-of-Season Rewards** - Bonus XP and badges

---

## Database Schema (Future Migration)

```sql
CREATE TABLE seasons (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  theme VARCHAR(50),
  color VARCHAR(7),
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seasonal_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  season_id VARCHAR(100) REFERENCES seasons(id),
  seasonal_xp INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  rewards_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

CREATE TABLE seasonal_achievements (
  id VARCHAR(100) PRIMARY KEY,
  season_id VARCHAR(100) REFERENCES seasons(id),
  achievement_id VARCHAR(100),
  UNIQUE(season_id, achievement_id)
);
```

---

## Performance Considerations

- **Leaderboard Caching:** Seasonal leaderboards are cached by seasonId and limit
- **Automatic Expiry:** Call `expireSeasonalAchievements()` when season ends
- **Cleanup:** Archive old seasonal data periodically
- **Query Optimization:** Index on seasonId and userId for fast lookups

---

## Integration Checklist

- [ ] Add seasonal achievements to ACHIEVEMENTS array
- [ ] Create seasons using `createSeason()`
- [ ] Implement season management UI
- [ ] Display seasonal achievements in achievement view
- [ ] Show seasonal leaderboard
- [ ] Track seasonal XP on achievement unlock
- [ ] Display end-of-season rewards
- [ ] Auto-expire seasons on schedule
- [ ] Migrate to database schema when ready

---

## Examples: Season Ideas

### Winter Wonderland (Dec-Jan)

- Holiday gift giver
- Winter collector
- Festive trader
- Snowflake hunter

### Spring Renewal (Mar-May)

- Spring creator
- Garden grower
- Flower collector
- Renewal artist

### Summer Fun (Jun-Aug)

- Beach party collector
- Summer creator
- Hot trades
- Island explorer

### Autumn Harvest (Sep-Nov)

- Harvest collector
- Fall creator
- Thanksgiving trader
- Pumpkin patch explorer

---

## Related Documentation

- [Complete Gamification System](COMPLETE_GAMIFICATION_SYSTEM.md)
- [Gamification Method Index](GAMIFICATION_METHOD_INDEX.md)
- [Achievement Notifications](ACHIEVEMENT_NOTIFICATIONS.md)
- [Leaderboard Integration](LEADERBOARD_INTEGRATION.md)
