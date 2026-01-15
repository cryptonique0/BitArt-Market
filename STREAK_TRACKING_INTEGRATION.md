# Streak Tracking Integration Guide

## Overview
Complete streak tracking system for monitoring user activity consistency with automatic daily reset, milestone rewards, and XP bonuses.

## Features

### 1. Daily Activity Tracking
- Track consecutive days of user activity
- Automatic detection of break-in-streak
- Reset when user misses a day
- Time-based reset at midnight UTC

### 2. Streak Rewards
Automatic XP bonuses at milestones:
- **7 days**: 50 XP bonus 🔥 (Week Warrior)
- **14 days**: 100 XP bonus ⚡ (Two Week Champion)
- **30 days**: 250 XP bonus 💪 (Monthly Master)
- **60 days**: 500 XP bonus 👑 (Legendary Contributor)
- **100 days**: 1000 XP bonus 🌟 (Century Achiever)

### 3. Leaderboards
- Streak-based leaderboards
- Ranked by current streak, then longest streak
- Track both current and longest streaks

## Data Structures

### UserStreak
```typescript
interface UserStreak {
  userId: string;
  currentStreak: number;           // Current consecutive days
  longestStreak: number;           // Record longest streak
  lastActiveDate: Date;            // Last activity date
  firstStreakDate: Date;           // Streak start date
  streakBrokenDate?: Date;         // When streak was broken
  totalStreakDays: number;         // Total days tracked
}
```

### StreakStats
```typescript
interface StreakStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;          // Was active today?
  daysUntilReset: number;          // Hours until streak expires
  xpBonus: number;                 // XP earned for today's activity
  milestone: number | null;        // Latest milestone reached
}
```

### StreakReward
```typescript
interface StreakReward {
  dayThreshold: number;
  xpBonus: number;
  badge?: string;
  description: string;
}
```

## Core Methods

### `updateStreak(userId: string): Promise<UserStreak>`
Updates user's streak status. Call once per day when user is active.

```typescript
// When user completes an action
const streak = await achievementService.updateStreak(userId);
console.log(`Current streak: ${streak.currentStreak} days`);
```

**Behavior:**
- If new user: Creates streak with 1 day
- If active today: No change (prevents duplicate counts)
- If active yesterday: Increments streak
- If inactive 2+ days: Resets to 1, marks as broken
- Auto-awards XP bonus if streak > 1

### `getActiveStreak(userId: string): number`
Get current active streak count.

```typescript
const streakDays = achievementService.getActiveStreak(userId);
// Returns: 0 if broken/inactive, or current streak count
```

**Returns:**
- `0` if streak is broken or inactive
- Current streak count if active (today or yesterday)

### `getStreakStats(userId: string): Promise<StreakStats | null>`
Get detailed streak statistics for a user.

```typescript
const stats = await achievementService.getStreakStats(userId);
if (stats) {
  console.log(`Streak: ${stats.currentStreak} days`);
  console.log(`Active today: ${stats.isActiveToday}`);
  console.log(`XP bonus: ${stats.xpBonus}`);
  console.log(`Days until reset: ${stats.daysUntilReset}`);
}
```

## Advanced Methods

### `getUserStreak(userId: string): UserStreak | undefined`
Get raw streak data for a user.

```typescript
const streak = achievementService.getUserStreak(userId);
// Returns: UserStreak or undefined
```

### `getAllStreaks(): Promise<Map<string, UserStreak>>`
Get all users' streak data.

```typescript
const allStreaks = await achievementService.getAllStreaks();
```

### `getStreakLeaderboard(limit?: number): Promise<...[]>`
Get streak-based leaderboard.

```typescript
const topStreaks = await achievementService.getStreakLeaderboard(10);
topStreaks.forEach(entry => {
  console.log(`#${entry.rank}. ${entry.username}: ${entry.currentStreak} days`);
});
```

### `resetStreak(userId: string): void`
Manually reset a user's streak.

```typescript
achievementService.resetStreak(userId);
```

### `getStreakXPBonus(currentStreak: number): number`
Get XP bonus for current streak level.

```typescript
const bonus = achievementService.getStreakXPBonus(30);
// Returns: 250 (matching 30-day milestone)
```

### `getStreakMilestone(currentStreak: number): number | null`
Check if current streak hits a milestone.

```typescript
const milestone = achievementService.getStreakMilestone(30);
// Returns: 30 (hits 30-day milestone)

const milestone = achievementService.getStreakMilestone(25);
// Returns: null (no milestone at 25)
```

### `getStreakRewardConfig(): StreakReward[]`
Get all streak reward thresholds.

```typescript
const rewards = achievementService.getStreakRewardConfig();
rewards.forEach(reward => {
  console.log(`${reward.dayThreshold} days: ${reward.xpBonus} XP ${reward.badge}`);
});
```

### `checkAndResetExpiredStreaks(): Promise<string[]>`
Check all users and reset expired streaks. Call this daily via cron job.

```typescript
// Run at midnight
const resetUsers = await achievementService.checkAndResetExpiredStreaks();
console.log(`Reset streaks for ${resetUsers.length} users`);
```

### `getStreakInsights(userId: string): Promise<...>`
Get comprehensive streak insights.

```typescript
const insights = await achievementService.getStreakInsights(userId);
if (insights) {
  console.log(`Current: ${insights.streak?.currentStreak} days`);
  console.log(`Next milestone: ${insights.nextMilestone?.dayThreshold} days`);
  console.log(`Progress: ${insights.progressToNext.toFixed(1)}%`);
  console.log(`At risk: ${insights.isRiskOfBreak}`);
}
```

## Integration Examples

### Example 1: Daily Activity Check-In
```typescript
// When user performs any activity
async function logActivity(userId: string) {
  const streak = await achievementService.updateStreak(userId);
  const stats = await achievementService.getStreakStats(userId);
  
  console.log(`Day ${streak.currentStreak} of streak!`);
  if (stats?.xpBonus) {
    console.log(`+${stats.xpBonus} XP bonus earned!`);
  }
  
  return streak;
}
```

### Example 2: Streak Progress Widget
```typescript
// Display on user profile
async function getStreakWidget(userId: string) {
  const insights = await achievementService.getStreakInsights(userId);
  
  if (!insights) return "No active streak";
  
  return {
    currentStreak: insights.streak?.currentStreak,
    longestStreak: insights.streak?.longestStreak,
    nextMilestone: insights.nextMilestone?.dayThreshold,
    progress: insights.progressToNext,
    warning: insights.isRiskOfBreak
  };
}
```

### Example 3: Leaderboard Display
```typescript
// Show top streaks
async function displayStreakLeaderboard() {
  const topStreaks = await achievementService.getStreakLeaderboard(10);
  
  return topStreaks.map(entry => ({
    rank: entry.rank,
    user: entry.username,
    current: entry.currentStreak,
    personal: entry.longestStreak,
    badge: getBadgeForStreak(entry.currentStreak)
  }));
}
```

### Example 4: Daily Cron Job
```typescript
// Run at midnight (UTC 00:00)
cron.schedule('0 0 * * *', async () => {
  // Reset expired streaks
  const resetUsers = await achievementService.checkAndResetExpiredStreaks();
  console.log(`Reset ${resetUsers.length} expired streaks`);
  
  // Notify at-risk users (optional)
  // Send notifications to users who haven't been active
});
```

### Example 5: Milestone Achievement
```typescript
// Check for milestone achievements
async function checkStreakMilestones(userId: string) {
  const streak = await achievementService.updateStreak(userId);
  const milestone = achievementService.getStreakMilestone(streak.currentStreak);
  
  if (milestone) {
    // Unlock milestone achievement
    await achievementService.unlockAchievement(userId, `daily_streak_${milestone}`);
  }
}
```

## Automatic Features

### 1. XP Auto-Award
- When streak updates, XP bonus automatically tracked
- Based on milestone thresholds
- No manual XP tracking needed

### 2. Streak Detection
- Checks if user was active today or yesterday
- If today: streak continues
- If yesterday only: streak continues
- If 2+ days ago: streak broken

### 3. Daily Reset
- Call `checkAndResetExpiredStreaks()` nightly
- Automatically resets inactive users
- Sets `streakBrokenDate` timestamp

### 4. Milestone Detection
- `getStreakMilestone()` checks if day hits reward threshold
- Triggered automatically on streak update
- XP bonus auto-applied

## Frontend Integration Points

### Profile Widget
```
Current Streak: 🔥 15 days
Longest Streak: 48 days
Next Milestone: 30 days (69% complete)
```

### Activity Feed
```
"You're on day 15 of your streak! +100 XP bonus"
"Milestone unlocked: 30-Day Dedication! +250 XP"
"Warning: Streak will expire tomorrow if you don't check in"
```

### Leaderboard
```
#1 User123 - 87 days 🌟
#2 User456 - 65 days 👑
#3 User789 - 45 days 💪
```

## Database Persistence Notes

Currently: In-memory Map storage
For production: Implement database persistence with:
- `UserStreak` table
- Index on `userId` and `lastActiveDate`
- Daily cron to clean up expired streaks
- Backup for `longestStreak` record

## Reset Scenarios

| Scenario | Action | Result |
|----------|--------|--------|
| First activity | Create new streak | 1 day streak |
| Active today | No change | Same streak |
| Active yesterday | Increment | +1 day |
| Inactive 2+ days | Reset | 0 day, marked broken |
| Missed midnight | Auto-reset on check | 0 day |

## Tips for Implementation

1. **Call updateStreak() once per session** - Not per action to prevent gaming
2. **Run checkAndResetExpiredStreaks() nightly** - Via cron job at UTC 00:00
3. **Show at-risk warnings** - If `daysUntilReset < 1` and not active today
4. **Celebrate milestones** - Trigger notifications at reward thresholds
5. **Archive longest streak** - Don't let broken streaks affect records
