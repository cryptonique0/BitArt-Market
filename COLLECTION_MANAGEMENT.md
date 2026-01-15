# Collection Management Integration Guide

## Overview

Complete achievement collection management system with filtering, grouping, and progress tracking capabilities for displaying user achievement collections.

## Core Collection Management Methods

### 1. Filter Achievements by Type

#### `getAchievementsByType(type: AchievementType): Achievement[]`

Get all achievements filtered by a specific category type.

```typescript
// Get all creator achievements
const creatorAchs = achievementService.getAchievementsByType(AchievementType.CREATOR);

// Get all collector achievements
const collectorAchs = achievementService.getAchievementsByType(AchievementType.COLLECTOR);

// Get all trader achievements
const traderAchs = achievementService.getAchievementsByType(AchievementType.TRADER);
```

**Returns:** Array of Achievement objects matching the type

**Use Cases:**

- Display achievements grouped by category
- Show category-specific achievement lists
- Filter achievements in achievement browser
- Count achievements per category

---

### 2. Group Achievements by Rarity

#### `getAchievementsByRarity(rarity: string): Achievement[]`

Get all achievements filtered by rarity level.

```typescript
// Get all common achievements
const common = achievementService.getAchievementsByRarity('common');

// Get all legendary achievements
const legendary = achievementService.getAchievementsByRarity('legendary');

// Get epic achievements
const epic = achievementService.getAchievementsByRarity('epic');
```

**Returns:** Array of achievements for the specified rarity

**Rarity Levels:**

- `'common'` - Base achievements
- `'uncommon'` - Standard difficulty
- `'rare'` - Challenging
- `'epic'` - Very difficult
- `'legendary'` - Extremely difficult

#### `getAchievementsByRarityGrouped(): Record<string, Achievement[]>`

Get all achievements grouped by rarity in one call.

```typescript
const grouped = achievementService.getAchievementsByRarityGrouped();

console.log(`Common: ${grouped['common'].length} achievements`);
console.log(`Legendary: ${grouped['legendary'].length} achievements`);

// Render by rarity
Object.entries(grouped).forEach(([rarity, achievements]) => {
  console.log(`${rarity}: ${achievements.length} total`);
});
```

**Returns:** Object with rarity levels as keys, achievement arrays as values

---

### 3. Calculate Completion Progress

#### `getCompletionPercentage(userId: string): Promise<number>`

Get the overall completion percentage for a user across all achievements.

```typescript
const percentage = await achievementService.getCompletionPercentage(userId);
console.log(`You've completed ${percentage.toFixed(1)}% of all achievements`);

// Display as progress bar
if (percentage >= 100) {
  console.log('🎉 Perfect Collection!');
} else if (percentage >= 75) {
  console.log('Almost there! Keep going!');
}
```

**Returns:** Number between 0-100 representing completion percentage

**Use Cases:**

- Display on user profile
- Show progress bar in collection view
- Achievement browser completion indicator
- Milestone notifications

---

#### `getCompletionStats(userId: string): Promise<CompletionStatsObject>`

Get detailed completion statistics for a user.

```typescript
const stats = await achievementService.getCompletionStats(userId);

console.log(`Total: ${stats.totalAchievements}`);
console.log(`Unlocked: ${stats.unlockedAchievements}`);
console.log(`Locked: ${stats.lockedAchievements}`);
console.log(`In Progress: ${stats.inProgressAchievements}`);
console.log(`Completion: ${stats.completionPercentage.toFixed(1)}%`);
```

**Returns:**

```typescript
{
  totalAchievements: number; // Total in system
  unlockedAchievements: number; // User has unlocked
  completionPercentage: number; // 0-100
  lockedAchievements: number; // Never started
  inProgressAchievements: number; // Started but not finished
}
```

---

## Advanced Collection Analysis

### Collection by Rarity

#### `getCollectionByRarity(userId: string): Promise<RarityBreakdown>`

Get completion stats broken down by rarity level.

```typescript
const rarityStats = await achievementService.getCollectionByRarity(userId);

Object.entries(rarityStats).forEach(([rarity, data]) => {
  const percent = data.percentage.toFixed(1);
  console.log(`${rarity}: ${data.unlocked}/${data.total} (${percent}%)`);
});
```

**Returns:**

```typescript
{
  'common': { unlocked: 8, total: 10, percentage: 80 },
  'uncommon': { unlocked: 5, total: 8, percentage: 62.5 },
  'rare': { unlocked: 3, total: 6, percentage: 50 },
  ...
}
```

**Use Cases:**

- Rarity-based collection display
- Completion by difficulty level
- Identify easiest/hardest rarities to complete

---

### Collection by Type

#### `getCollectionByType(userId: string): Promise<TypeBreakdown>`

Get completion stats broken down by achievement type (Creator, Collector, Trader, etc).

```typescript
const typeStats = await achievementService.getCollectionByType(userId);

console.log(
  `Creator: ${typeStats[AchievementType.CREATOR].unlocked}/${typeStats[AchievementType.CREATOR].total}`
);
console.log(
  `Collector: ${typeStats[AchievementType.COLLECTOR].unlocked}/${typeStats[AchievementType.COLLECTOR].total}`
);

// Find which type needs most work
let lowestPercent = 100;
let lowestType = null;

Object.entries(typeStats).forEach(([type, data]) => {
  if (data.percentage < lowestPercent && data.total > 0) {
    lowestPercent = data.percentage;
    lowestType = type;
  }
});

console.log(`Focus on: ${lowestType} (${lowestPercent.toFixed(0)}% complete)`);
```

**Returns:** Object with achievement types as keys, stats as values

---

### Collection by Tier

#### `getCollectionByTier(userId: string): Promise<TierBreakdown>`

Get completion stats broken down by achievement tier (Bronze, Silver, Gold, Platinum).

```typescript
const tierStats = await achievementService.getCollectionByTier(userId);

console.log(`🥉 Bronze: ${tierStats[AchievementTier.BRONZE].percentage.toFixed(0)}%`);
console.log(`🥈 Silver: ${tierStats[AchievementTier.SILVER].percentage.toFixed(0)}%`);
console.log(`🥇 Gold: ${tierStats[AchievementTier.GOLD].percentage.toFixed(0)}%`);
console.log(`💎 Platinum: ${tierStats[AchievementTier.PLATINUM].percentage.toFixed(0)}%`);
```

**Returns:** Object with tiers as keys, completion data as values

---

## Progress Tracking

### Next Unlockable Achievements

#### `getNextUnlockableAchievements(userId: string, limit?: number): Promise<AchievementWithProgress[]>`

Get achievements closest to being unlocked, sorted by progress.

```typescript
const nextUnlocks = await achievementService.getNextUnlockableAchievements(userId, 5);

nextUnlocks.forEach(ach => {
  const bar = createProgressBar(ach.progressPercentage);
  console.log(`${ach.title}: ${bar} ${ach.progressPercentage.toFixed(0)}%`);
  console.log(`  Progress: ${ach.progress}/${ach.requirement}`);
});
```

**Returns:** Achievements sorted by progress percentage (closest to unlock first)

**Use Cases:**

- "Almost there!" notifications
- Encouraging next steps
- Daily challenge suggestions
- Progress dashboard

---

### Achievement Progress Details

#### `getAchievementProgress(userId: string, achievementId: string): Promise<ProgressDetails>`

Get detailed progress information for a specific achievement.

```typescript
const progress = await achievementService.getAchievementProgress(userId, 'milestone_50_creator');

if (progress) {
  console.log(`Achievement: ${progress.achievement.title}`);
  console.log(`Progress: ${progress.progress}/${progress.requirement}`);
  console.log(`Percentage: ${progress.progressPercentage.toFixed(1)}%`);
  console.log(`Unlocked: ${progress.isUnlocked ? 'Yes ✓' : 'No'}`);
}
```

**Returns:**

```typescript
{
  achievement: Achievement | null;
  progress: number;
  requirement: number;
  progressPercentage: number;
  isUnlocked: boolean;
}
```

---

### Missing Achievements

#### `getMissingAchievements(userId: string, limit?: number): Promise<Achievement[]>`

Get a random sample of locked achievements user hasn't started.

```typescript
const missing = await achievementService.getMissingAchievements(userId, 10);

console.log("Here are 10 achievements you haven't started yet:");
missing.forEach(ach => {
  console.log(`- ${ach.title}: ${ach.description}`);
});
```

**Returns:** Random sample of locked achievements

**Use Cases:**

- Suggest new achievements
- Discovery recommendations
- Achievement browser
- Challenge suggestions

---

## Collection Summary

#### `getAchievementSummary(userId: string): Promise<AchievementSummary>`

Get comprehensive collection summary with all stats at once.

```typescript
const summary = await achievementService.getAchievementSummary(userId);

console.log(`=== COLLECTION SUMMARY ===`);
console.log(`Overall: ${summary.completionPercentage.toFixed(1)}% (${summary.totalCount} total)`);

console.log(`\nBY RARITY:`);
Object.entries(summary.byRarity).forEach(([rarity, data]) => {
  console.log(`  ${rarity}: ${data.unlocked}/${data.total}`);
});

console.log(`\nBY TYPE:`);
Object.entries(summary.byType).forEach(([type, data]) => {
  console.log(`  ${type}: ${data.unlocked}/${data.total}`);
});

console.log(`\nBY TIER:`);
Object.entries(summary.byTier).forEach(([tier, data]) => {
  console.log(`  ${tier}: ${data.unlocked}/${data.total}`);
});

console.log(`\nNEXT TO UNLOCK:`);
summary.nextMilestones.forEach(ach => {
  console.log(`  ${ach.title} (${ach.progressPercentage.toFixed(0)}%)`);
});
```

**Returns:** Complete summary object with all breakdowns

---

## User Achievement Collections

### By Rarity

#### `getUserAchievementsByRarity(userId: string): Promise<Record<string, Achievement[]>>`

Get user's unlocked achievements grouped by rarity.

```typescript
const byRarity = await achievementService.getUserAchievementsByRarity(userId);

Object.entries(byRarity).forEach(([rarity, achievements]) => {
  console.log(`${rarity}: ${achievements.length} unlocked`);
  achievements.forEach(ach => {
    console.log(`  ✓ ${ach.title}`);
  });
});
```

---

### By Type

#### `getUserAchievementsByType(userId: string): Promise<Record<AchievementType, Achievement[]>>`

Get user's unlocked achievements grouped by type.

```typescript
const byType = await achievementService.getUserAchievementsByType(userId);

console.log(`Creator Achievements: ${byType[AchievementType.CREATOR].length}`);
console.log(`Collector Achievements: ${byType[AchievementType.COLLECTOR].length}`);
console.log(`Trader Achievements: ${byType[AchievementType.TRADER].length}`);
```

---

### By Tier

#### `getUserAchievementsByTier(userId: string): Promise<Record<AchievementTier, Achievement[]>>`

Get user's unlocked achievements grouped by tier.

```typescript
const byTier = await achievementService.getUserAchievementsByTier(userId);

const bronzeCount = byTier[AchievementTier.BRONZE].length;
const silverCount = byTier[AchievementTier.SILVER].length;
const goldCount = byTier[AchievementTier.GOLD].length;
const platinumCount = byTier[AchievementTier.PLATINUM].length;

console.log(`🥉 ${bronzeCount} | 🥈 ${silverCount} | 🥇 ${goldCount} | 💎 ${platinumCount}`);
```

---

## Complete Usage Examples

### Example 1: Achievement Collection Display

```typescript
async function renderAchievementCollection(userId: string) {
  const summary = await achievementService.getAchievementSummary(userId);
  const byRarity = await achievementService.getCollectionByRarity(userId);

  return {
    overall: {
      percentage: summary.completionPercentage,
      total: summary.totalCount,
      unlocked: summary.totalCount * (summary.completionPercentage / 100),
    },
    byRarity: Object.entries(byRarity).map(([rarity, data]) => ({
      rarity,
      unlocked: data.unlocked,
      total: data.total,
      percentage: data.percentage,
    })),
    nextMilestones: summary.nextMilestones.slice(0, 3),
  };
}
```

### Example 2: Achievement Browser

```typescript
async function getAchievementBrowser(type?: AchievementType) {
  // Get all or filtered achievements
  const allAchs = type
    ? achievementService.getAchievementsByType(type)
    : achievementService.getAllAchievements();

  // Group by rarity
  const byRarity = achievementService.getAchievementsByRarityGrouped();

  return {
    total: allAchs.length,
    byRarity: Object.entries(byRarity).map(([rarity, achs]) => ({
      rarity,
      count: achs.length,
      achievements: achs,
    })),
  };
}
```

### Example 3: Achievement Suggestions

```typescript
async function getSuggestedAchievements(userId: string) {
  // Get nearly completed
  const almostThere = await achievementService.getNextUnlockableAchievements(userId, 3);

  // Get random locked ones
  const explore = await achievementService.getMissingAchievements(userId, 5);

  return {
    almostThere: almostThere.map(a => ({
      title: a.title,
      progress: `${a.progress}/${a.requirement}`,
      percentage: a.progressPercentage,
    })),
    explore: explore.map(a => ({
      title: a.title,
      description: a.description,
      rarity: a.rarity,
    })),
  };
}
```

### Example 4: Profile Achievement Badges

```typescript
async function getProfileBadges(userId: string) {
  const summary = await achievementService.getAchievementSummary(userId);
  const byTier = await achievementService.getCollectionByTier(userId);

  return {
    completion: {
      percentage: summary.completionPercentage,
      badge:
        summary.completionPercentage === 100
          ? '🏆'
          : summary.completionPercentage >= 75
            ? '🥇'
            : summary.completionPercentage >= 50
              ? '🥈'
              : '🥉',
    },
    tiers: {
      bronze: byTier[AchievementTier.BRONZE].unlocked,
      silver: byTier[AchievementTier.SILVER].unlocked,
      gold: byTier[AchievementTier.GOLD].unlocked,
      platinum: byTier[AchievementTier.PLATINUM].unlocked,
    },
  };
}
```

---

## Frontend Components

### Collection Progress Bar

```typescript
function CollectionProgressBar({ userId }: { userId: string }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    achievementService.getCompletionStats(userId).then(setStats);
  }, [userId]);

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${stats?.completionPercentage}%` }} />
      <span>{stats?.unlockedAchievements}/{stats?.totalAchievements}</span>
    </div>
  );
}
```

### Rarity Filter

```typescript
function RarityFilter({ onSelect }: { onSelect: (rarity: string) => void }) {
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  return (
    <div className="rarity-filter">
      {rarities.map(rarity => (
        <button key={rarity} onClick={() => onSelect(rarity)}>
          {rarity}
        </button>
      ))}
    </div>
  );
}
```

### Achievement Browser

```typescript
async function AchievementBrowser({ userId, type }: Props) {
  const achievements = type
    ? achievementService.getAchievementsByType(type)
    : achievementService.getAllAchievements();

  return (
    <div className="achievement-grid">
      {achievements.map(ach => (
        <AchievementCard key={ach.id} achievement={ach} userId={userId} />
      ))}
    </div>
  );
}
```

---

## Performance Tips

1. **Cache collection stats** - Recompute only when achievements unlock
2. **Lazy load** - Load summary stats first, details on demand
3. **Batch queries** - Use `getAchievementSummary()` for all stats at once
4. **Pagination** - Show 10-20 achievements at a time in browser

---

## Summary

**Collection Management Features:**
✅ Filter achievements by type
✅ Group by rarity levels
✅ Calculate completion percentages
✅ Track progress toward unlocks
✅ Identify next achievements
✅ Comprehensive statistics
✅ User-specific collections
✅ Multiple grouping options

**Ready for:**
✅ Achievement collection displays
✅ Achievement browsers
✅ Progress tracking
✅ Profile badges
✅ Suggestions/recommendations
✅ Statistics dashboards
