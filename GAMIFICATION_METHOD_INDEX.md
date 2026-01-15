# Gamification System - Complete Method Index

## Quick Navigation

### 📊 Core Methods (4)

- [`unlockAchievement()`](#unlockachievement) - Unlock achievement for user
- [`updateProgress()`](#updateprogress) - Update achievement progress
- [`getAchievementDetails()`](#getachievementdetails) - Get single achievement
- [`getAllAchievements()`](#getallachievements) - Get all system achievements

### 👤 User Methods (3)

- [`getUserAchievements()`](#getuserachievements) - Get user's achievements
- [`getUnlockedCount()`](#getunlockedcount) - Count unlocked achievements
- [`getUserBadges()`](#getuserbadges) - Get user's badges by tier

### ⭐ Tier & Rarity Methods (8)

- [`getAchievementsByTier()`](#getachievementsbytier) - Get by tier
- [`getAchievementsByRarityGrouped()`](#getachievementsbyraritygrouped) - Group by rarity
- [`getHighestTierUnlocked()`](#gethighestitierunlocked) - Find highest tier
- [`getUserBadges()`](#getuserbadges) - Get badges
- [`getUserTierProgress()`](#getusertierprogress) - Progress to next tier
- [`getTierAchievements()`](#gettierachievements) - Get all by tier
- [`getAllTiers()`](#getalltiers) - List all tiers
- [`getMilestoneAchievements()`](#getmilestoneachievements) - Get milestones

### 💰 XP & Tracking Methods (4)

- [`trackUserXP()`](#trackuserxp) - Add XP for user
- [`getUserXPTracker()`](#getuserxptracker) - Get XP data
- [`getAllUserXP()`](#getalluserxp) - Get all users' XP
- [`getLeaderboardStats()`](#getleaderboardstats) - Global statistics

### 🏆 Leaderboard Methods (7)

- [`getLeaderboard()`](#getleaderboard) - Global leaderboard
- [`getLeaderboardByType()`](#getleaderboardbytype) - Filter by type
- [`getLeaderboardAroundUser()`](#getleaderboardarounduser) - Context view
- [`getUserRank()`](#getuserrank) - Get user's rank
- [`getUserLeaderboardPosition()`](#getuserleaderboardposition) - Get position data
- [`getLeaderboardByType()`](#getleaderboardbytype) - Category leaderboard
- [`getLeaderboardStats()`](#getleaderboardstats) - Statistics

### 🔥 Streak Methods (12)

- [`updateStreak()`](#updatestreak) - Update daily streak
- [`getActiveStreak()`](#getactivestreak) - Current streak
- [`getStreakStats()`](#getstreakstats) - Detailed stats
- [`resetStreak()`](#resetstreak) - Manual reset
- [`getStreakXPBonus()`](#getstreakxpbonus) - Calculate bonus
- [`getStreakMilestone()`](#getstreakmilestone) - Check milestone
- [`getUserStreak()`](#getuserstreak) - Get streak data
- [`getAllStreaks()`](#getallstreaks) - All users' streaks
- [`getStreakLeaderboard()`](#getstreakleaderboard) - Streak ranking
- [`getStreakRewardConfig()`](#getstreakRewardconfig) - Reward settings
- [`checkAndResetExpiredStreaks()`](#checkandresetexpiredstreaks) - Auto-reset
- [`getStreakInsights()`](#getstreakinsights) - Advanced stats

### 📋 Collection Methods (18)

- [`getAchievementsByType()`](#getachievementsbytype) - Filter by type
- [`getCompletionPercentage()`](#getcompletionpercentage) - Completion %
- [`getCompletionStats()`](#getcompletionstats) - Detailed stats
- [`getCollectionByRarity()`](#getcollectionbyarity) - Group by rarity
- [`getCollectionByType()`](#getcollectionbytype) - Group by type
- [`getCollectionByTier()`](#getcollectionbytier) - Group by tier
- [`getNextUnlockableAchievements()`](#getnextunlockableachievements) - Goals
- [`getMissingAchievements()`](#getmissingachievements) - Not unlocked
- [`getAchievementProgress()`](#getachievementprogress) - Single progress
- [`getAchievementSummary()`](#getachievementsummary) - Complete summary
- [`getUserAchievementsByRarity()`](#getuserachievementsbyarity) - User rarity
- [`getUserAchievementsByType()`](#getuserachievementsbytype) - User type
- [`getUserAchievementsByTier()`](#getuserachievementsbytier) - User tier
- [`getAchievementsByRarityGrouped()`](#getachievementsbyraritygrouped) - All grouped
- [`getMilestonesByType()`](#getmilestonesbytype) - Milestone filter
- [`getHighestTierUnlocked()`](#gethighestitierunlocked) - Highest tier
- [`getUserBadges()`](#getuserbadges) - User badges
- [`getUserTierProgress()`](#getusertierprogress) - Tier progress

### 🔔 Notification Methods (17)

- [`createNotification()`](#createnotification) - Create notification
- [`getUnreadNotifications()`](#getunreadnotifications) - Unread only
- [`getAllNotifications()`](#getallnotifications) - All messages
- [`markNotificationAsRead()`](#marknotificationasread) - Mark single
- [`markAllNotificationsAsRead()`](#markallnotificationsasread) - Mark all
- [`clearNotifications()`](#clearnotifications) - Delete all
- [`createRewardNotification()`](#createrewardnotification) - Create reward
- [`getRecentNotifications()`](#getrecentnotifications) - Recent (hours)
- [`getNotificationsSince()`](#getnotificationssince) - Since date
- [`getNotificationCount()`](#getnotificationcount) - Count
- [`triggerAchievementUnlockedNotification()`](#triggerachievementunlockednotification) - Unlock alert
- [`triggerNearCompletionNotification()`](#triggernearcompletionnotification) - 90% alert
- [`triggerMilestoneNotification()`](#triggermilestonenotification) - Milestone alert
- [`triggerTierAchievedNotification()`](#triggertierachievednotification) - Tier alert
- [`getNewAchievements()`](#getnewachievements) - Recent unlocks
- [`getNearlyCompletedAchievements()`](#getnearlycompletedachievements) - Near done
- [`getUnreadCount()`](#getunreadcount) - Unread count

### 👥 Social Features Methods (15)

- [`compareAchievements()`](#compareachievements) - Compare users
- [`getFriendsAchievements()`](#getfriendsachievements) - Friend data
- [`getSocialLeaderboard()`](#getsocialleaderboard) - Global leaderboard
- [`getFriendsLeaderboard()`](#getfriendsleaderboard) - Friends ranking
- [`createShareableAchievementBadge()`](#createsharableachievementbadge) - Shareable badge
- [`addFriend()`](#addfriend) - Add friendship
- [`removeFriend()`](#removefriend) - Remove friendship
- [`getFriends()`](#getfriends) - Get friends list
- [`isFriend()`](#isfriend) - Check friendship
- [`getUserProfile()`](#getuserprofile) - Get profile
- [`updateUserProfile()`](#updateuserprofile) - Update profile
- [`getMutualFriends()`](#getmutualfriends) - Common friends
- [`getAchievementComparison()`](#getachievementcomparison) - Compare with context
- [`setLastNotificationView()`](#setlastnotificationview) - Track view time
- [`getLastNotificationView()`](#getlastnotificationview) - Get view time

---

## Method Details

### Core Methods

#### `unlockAchievement()`

```typescript
async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null>
```

Unlocks an achievement for a user, records timestamp, and awards XP.

#### `updateProgress()`

```typescript
async updateProgress(
  userId: string,
  achievementId: string,
  progressAmount: number
): Promise<UserAchievement | null>
```

Updates progress toward achievement completion.

#### `getAchievementDetails()`

```typescript
getAchievementDetails(achievementId: string): Achievement | undefined
```

Retrieves details for a single achievement.

#### `getAllAchievements()`

```typescript
getAllAchievements(): Achievement[]
```

Returns all system achievements.

---

### User Methods

#### `getUserAchievements()`

```typescript
async getUserAchievements(userId: string): Promise<UserAchievement[]>
```

Gets all achievements for a user with progress data.

#### `getUnlockedCount()`

```typescript
async getUnlockedCount(userId: string): Promise<number>
```

Returns count of user's unlocked achievements.

#### `getUserBadges()`

```typescript
async getUserBadges(userId: string): Promise<{ tier: AchievementTier; count: number }[]>
```

Gets user's badge counts by tier.

---

### Tier & Rarity Methods

#### `getAchievementsByTier()`

```typescript
getAchievementsByTier(tier: AchievementTier): Achievement[]
```

Get all achievements for a specific tier.

#### `getHighestTierUnlocked()`

```typescript
getHighestTierUnlocked(achievements: Achievement[]): AchievementTier
```

Find the highest tier from a list of achievements.

#### `getUserTierProgress()`

```typescript
async getUserTierProgress(userId: string): Promise<{
  currentTier: AchievementTier;
  nextTier: AchievementTier | null;
  achievementCount: number;
  nextTierAt: number;
}>
```

Get user's tier and progress to next tier.

---

### XP & Leaderboard

#### `trackUserXP()`

```typescript
async trackUserXP(userId: string, amount: number, source: string): Promise<void>
```

Track XP from various sources (achievements, streaks, etc.)

#### `getLeaderboard()`

```typescript
async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]>
```

Get global XP leaderboard.

#### `getUserRank()`

```typescript
async getUserRank(userId: string, type?: AchievementType): Promise<number | null>
```

Get user's global rank.

#### `getLeaderboardAroundUser()`

```typescript
async getLeaderboardAroundUser(
  userId: string,
  range: number = 5
): Promise<LeaderboardEntry[]>
```

Get users ranked around target user.

---

### Streak Methods

#### `updateStreak()`

```typescript
async updateStreak(userId: string): Promise<UserStreak>
```

Record daily activity and update streak. Auto-resets if expired.

#### `getActiveStreak()`

```typescript
getActiveStreak(userId: string): number
```

Get current streak length for user.

#### `getStreakXPBonus()`

```typescript
getStreakXPBonus(currentStreak: number): number
```

Calculate XP bonus for streak length.

**Bonus Scale:**

- 1-6 days: 10-60 XP
- 7-29 days: 70-200 XP
- 30+ days: 300+ XP

#### `getStreakMilestone()`

```typescript
getStreakMilestone(currentStreak: number): number | null
```

Check if streak hits milestone (7, 30, 100 days).

#### `resetStreak()`

```typescript
resetStreak(userId: string): void
```

Manually reset user's streak.

---

### Collection Management

#### `getCompletionPercentage()`

```typescript
async getCompletionPercentage(userId: string): Promise<number>
```

Get percentage of achievements user has completed.

#### `getCompletionStats()`

```typescript
async getCompletionStats(userId: string): Promise<{
  total: number;
  unlocked: number;
  locked: number;
  percentages: Record<AchievementType, number>;
  rarityBreakdown: Record<string, number>;
}>
```

Get detailed completion statistics.

#### `getCollectionByRarity()`

```typescript
async getCollectionByRarity(userId: string): Promise<Record<string, Achievement[]>>
```

Group user's achievements by rarity.

#### `getCollectionByType()`

```typescript
async getCollectionByType(userId: string): Promise<Record<AchievementType, Achievement[]>>
```

Group user's achievements by type.

#### `getCollectionByTier()`

```typescript
async getCollectionByTier(userId: string): Promise<Record<AchievementTier, Achievement[]>>
```

Group user's achievements by tier.

#### `getNextUnlockableAchievements()`

```typescript
async getNextUnlockableAchievements(
  userId: string,
  limit: number = 5
): Promise<Achievement[]>
```

Get achievable goals (closest to completion).

#### `getMissingAchievements()`

```typescript
async getMissingAchievements(userId: string, limit: number = 10): Promise<Achievement[]>
```

Get achievements user hasn't unlocked yet.

#### `getAchievementSummary()`

```typescript
async getAchievementSummary(userId: string): Promise<{
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  byRarity: Record<string, number>;
  byType: Record<AchievementType, number>;
  byTier: Record<AchievementTier, number>;
  highestTier: AchievementTier;
}>
```

Get comprehensive achievement summary.

---

### Notifications

#### `createNotification()`

```typescript
async createNotification(userId: string, notification: AchievementNotification): Promise<void>
```

Create new notification for user.

#### `getUnreadNotifications()`

```typescript
async getUnreadNotifications(userId: string): Promise<AchievementNotification[]>
```

Get unread notifications only.

#### `getAllNotifications()`

```typescript
async getAllNotifications(userId: string): Promise<AchievementNotification[]>
```

Get all notifications (read and unread).

#### `markNotificationAsRead()`

```typescript
async markNotificationAsRead(userId: string, achievementId: string): Promise<void>
```

Mark single notification as read.

#### `getNewAchievements()`

```typescript
async getNewAchievements(userId: string, since: Date): Promise<NewAchievementData[]>
```

Get achievements unlocked since specific date.

#### `getNearlyCompletedAchievements()`

```typescript
async getNearlyCompletedAchievements(userId: string): Promise<Achievement[]>
```

Get achievements that are 90%+ complete.

#### `triggerAchievementUnlockedNotification()`

```typescript
async triggerAchievementUnlockedNotification(
  userId: string,
  achievement: Achievement
): Promise<void>
```

Send notification when achievement unlocked.

---

### Social Features

#### `compareAchievements()`

```typescript
async compareAchievements(userId1: string, userId2: string): Promise<AchievementComparison>
```

Compare two users' achievements. Returns:

- `mutualAchievements` - Achievements both have
- `user1OnlyAchievements` - Only user1 has
- `user2OnlyAchievements` - Only user2 has
- `similarityPercentage` - % match

#### `getFriendsAchievements()`

```typescript
async getFriendsAchievements(userId: string): Promise<FriendAchievementData[]>
```

Get friend achievements including:

- Recent unlocks (last 5)
- Completion percentage
- Highest tier

#### `getSocialLeaderboard()`

```typescript
async getSocialLeaderboard(limit: number = 20): Promise<SocialLeaderboardEntry[]>
```

Global leaderboard sorted by XP and achievement count.

#### `getFriendsLeaderboard()`

```typescript
async getFriendsLeaderboard(userId: string, limit: number = 20): Promise<SocialLeaderboardEntry[]>
```

Leaderboard showing only user's friends.

#### `createShareableAchievementBadge()`

```typescript
async createShareableAchievementBadge(
  userId: string,
  achievementId: string
): Promise<ShareableAchievementBadge | null>
```

Create shareable badge with:

- Share URL
- Color based on rarity
- Icon and text

#### `addFriend()`

```typescript
async addFriend(userId1: string, userId2: string): Promise<boolean>
```

Establish bidirectional friendship.

#### `removeFriend()`

```typescript
async removeFriend(userId1: string, userId2: string): Promise<boolean>
```

Remove bidirectional friendship.

#### `getFriends()`

```typescript
getFriends(userId: string): string[]
```

Get user's friend list.

#### `isFriend()`

```typescript
isFriend(userId1: string, userId2: string): boolean
```

Check if two users are friends.

#### `getUserProfile()`

```typescript
async getUserProfile(userId: string): Promise<UserProfile | null>
```

Get comprehensive user profile with achievements and friends.

#### `getMutualFriends()`

```typescript
async getMutualFriends(userId1: string, userId2: string): Promise<string[]>
```

Get common friends between two users.

#### `getAchievementComparison()`

```typescript
async getAchievementComparison(userId1: string, userId2: string): Promise<{
  comparison: AchievementComparison;
  areFriends: boolean;
  mutualFriends: string[];
}>
```

Get comparison with friendship context.

---

## Usage Patterns

### Get User's Achievement Status

```typescript
const userAchs = await achievementService.getUserAchievements(userId);
const stats = await achievementService.getCompletionStats(userId);
const profile = await achievementService.getUserProfile(userId);
```

### Show Leaderboard

```typescript
const leaderboard = await achievementService.getLeaderboard(20);
const position = await achievementService.getUserLeaderboardPosition(userId);
const around = await achievementService.getLeaderboardAroundUser(userId, 5);
```

### Track Daily Activity

```typescript
await achievementService.updateStreak(userId);
const bonus = achievementService.getStreakXPBonus(streak);
await achievementService.trackUserXP(userId, bonus, 'daily_streak');
```

### Show Notifications

```typescript
const unread = await achievementService.getUnreadNotifications(userId);
await achievementService.markAllNotificationsAsRead(userId);
```

### Compare Users

```typescript
const comparison = await achievementService.compareAchievements(user1, user2);
const withContext = await achievementService.getAchievementComparison(user1, user2);
```

---

## Performance Tips

1. **Cache user profiles** - Results cached in `userProfileMap`
2. **Batch leaderboard queries** - Query all users once, not per user
3. **Lazy load notifications** - Load only unread by default
4. **Pagination** - Limit leaderboard to top 100, not all users
5. **Streaks async** - Call `checkAndResetExpiredStreaks()` hourly

---

## Files Reference

| File                    | Methods  | Purpose                    |
| ----------------------- | -------- | -------------------------- |
| `achievementService.ts` | 81+      | All methods implementation |
| `gamification.ts`       | Types    | Type definitions           |
| Documentation           | 11 files | Guides and examples        |

---

**Status:** ✅ All 81 methods implemented and documented
