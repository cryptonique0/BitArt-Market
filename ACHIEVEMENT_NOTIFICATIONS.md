# Achievement Notifications Integration Guide

## Overview

Complete achievement notification system for alerting users of unlocked achievements, near-completion milestones, and XP rewards.

## Core Notification Methods

### 1. Get Recently Unlocked Achievements

#### `getNewAchievements(userId: string, since: Date): Promise<NewAchievementData[]>`

Get all achievements unlocked since a specific date/time.

```typescript
// Get achievements unlocked in the last 24 hours
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const newAchs = await achievementService.getNewAchievements(userId, oneDayAgo);

newAchs.forEach(data => {
  console.log(`✓ ${data.achievement.title} unlocked at ${data.unlockedAt}`);
  console.log(`  Earned: +${data.xpReward} XP`);
});

// Get achievements unlocked this session
const sessionStart = new Date(sessionStartTimestamp);
const recentUnlocks = await achievementService.getNewAchievements(userId, sessionStart);
```

**Returns:**

```typescript
{
  achievement: Achievement;
  unlockedAt: Date;
  xpReward: number;
}
[];
```

**Use Cases:**

- Show recent achievement unlock feed
- Notification history
- Session summary
- Achievement badges on profile

---

### 2. Get Nearly Completed Achievements

#### `getNearlyCompletedAchievements(userId: string, threshold?: number): Promise<NearCompletionAchievement[]>`

Get achievements close to being unlocked (default 80% threshold).

```typescript
// Get achievements 80%+ complete
const nearly = await achievementService.getNearlyCompletedAchievements(userId);

nearly.forEach(ach => {
  const bar = '█'.repeat(Math.round(ach.progressPercentage / 10));
  const empty = '░'.repeat(10 - bar.length);
  console.log(`${ach.title}`);
  console.log(`${bar}${empty} ${ach.progressPercentage.toFixed(0)}%`);
  console.log(`${ach.progress}/${ach.requirement}`);
});

// Custom threshold - get 90%+ complete
const almostThere = await achievementService.getNearlyCompletedAchievements(userId, 90);

// Very close - 95%+
const soClose = await achievementService.getNearlyCompletedAchievements(userId, 95);
```

**Returns:**

```typescript
{
  ...Achievement;
  progress: number;
  requirement: number;
  progressPercentage: number;
}[]
```

**Use Cases:**

- "Almost there!" notifications
- Encourage next steps
- Progress dashboard highlights
- Milestone alerts

---

## Notification Management

### Create & Store Notifications

#### `createNotification(userId: string, notification: AchievementNotification): Promise<void>`

Create a new notification for a user.

```typescript
const notification: AchievementNotification = {
  userId,
  achievementId: 'milestone_50_creator',
  type: 'unlocked',
  achievement: achievementData,
  xpReward: 500,
  unlockedAt: new Date(),
  read: false,
};

await achievementService.createNotification(userId, notification);
```

---

### Retrieve Notifications

#### `getUnreadNotifications(userId: string): Promise<AchievementNotification[]>`

Get all unread notifications.

```typescript
const unread = await achievementService.getUnreadNotifications(userId);
console.log(`You have ${unread.length} unread notifications`);

unread.forEach(notif => {
  console.log(`${notif.type}: ${notif.achievement.title}`);
});
```

#### `getAllNotifications(userId: string): Promise<AchievementNotification[]>`

Get all notifications (read and unread).

```typescript
const all = await achievementService.getAllNotifications(userId);
```

#### `getRecentNotifications(userId: string, hours?: number): Promise<AchievementNotification[]>`

Get notifications from the last N hours (default 24).

```typescript
// Last 24 hours
const recent = await achievementService.getRecentNotifications(userId);

// Last 1 hour
const lastHour = await achievementService.getRecentNotifications(userId, 1);

// Last 7 days
const week = await achievementService.getRecentNotifications(userId, 168);
```

#### `getNotificationsSince(userId: string, since: Date): Promise<AchievementNotification[]>`

Get notifications since a specific date.

```typescript
const lastLogin = user.lastLoginDate;
const newNotifications = await achievementService.getNotificationsSince(userId, lastLogin);
```

---

### Mark as Read

#### `markNotificationAsRead(userId: string, achievementId: string): Promise<void>`

Mark a specific notification as read.

```typescript
await achievementService.markNotificationAsRead(userId, 'milestone_50_creator');
```

#### `markAllNotificationsAsRead(userId: string): Promise<void>`

Mark all notifications as read.

```typescript
await achievementService.markAllNotificationsAsRead(userId);
```

---

### Notification Statistics

#### `getNotificationCount(userId: string): Promise<{ total: number; unread: number }>`

Get notification counts.

```typescript
const counts = await achievementService.getNotificationCount(userId);
console.log(`Total: ${counts.total}, Unread: ${counts.unread}`);

// Show badge with unread count
if (counts.unread > 0) {
  showBadge(counts.unread);
}
```

#### `getUnreadCount(userId: string): number`

Get synchronous unread count (quick check).

```typescript
const unreadCount = achievementService.getUnreadCount(userId);
// Use for badge updates
```

---

## Automatic Notification Triggers

### Achievement Unlocked

#### `triggerAchievementUnlockedNotification(userId: string, achievementId: string): Promise<AchievementRewardNotification | null>`

Auto-create notification when achievement unlocks.

```typescript
// Called automatically when unlockAchievement() succeeds
await achievementService.triggerAchievementUnlockedNotification(userId, achievementId);

// Returns reward notification with XP info
// Output: { achievementTitle, xpAwarded, totalXP, timestamp }
```

**Automatically:**

- Creates notification record
- Generates reward notification
- Tracks XP earned
- Returns notification data for display

---

### Near Completion Alert

#### `triggerNearCompletionNotification(userId: string, achievementId: string, threshold?: number): Promise<AchievementNotification | null>`

Create notification when achievement nears completion.

```typescript
// Check after progress update
const progress = await achievementService.updateProgress(userId, achievementId, newProgress);

// Only trigger if 90%+ complete
await achievementService.triggerNearCompletionNotification(userId, achievementId, 90);
```

**Use Case:** Alert user "You're 90% done with X achievement!"

---

### Milestone Achieved

#### `triggerMilestoneNotification(userId: string, achievementId: string): Promise<AchievementNotification | null>`

Create notification for milestone achievements (50, 100, 250 NFTs, etc).

```typescript
// Triggered when milestone achievements unlock
await achievementService.triggerMilestoneNotification(userId, 'milestone_50_creator');
// Shows special "Milestone!" notification
```

---

### Tier Achievement

#### `triggerTierAchievedNotification(userId: string, tier: AchievementTier): Promise<AchievementNotification | null>`

Create notification when user reaches a new tier (Bronze → Silver → Gold → Platinum).

```typescript
const userBadges = await achievementService.getUserBadges(userId);
const newTier = achievementService.getHighestTierUnlocked(userAchievements);

// Trigger tier achievement notification
await achievementService.triggerTierAchievedNotification(userId, newTier);
```

---

## Reward Notifications

#### `createRewardNotification(userId: string, achievementId: string, xpAwarded: number, tier?: AchievementTier): Promise<AchievementRewardNotification>`

Generate XP reward notification.

```typescript
const rewardNotif = await achievementService.createRewardNotification(
  userId,
  'milestone_100_creator',
  1000,
  AchievementTier.GOLD
);

// Display: "🏆 Legendary Creator unlocked! +1000 XP"
console.log(`${rewardNotif.achievementTitle} +${rewardNotif.xpAwarded} XP`);
console.log(`Total XP: ${rewardNotif.totalXP}`);
```

**Returns:**

```typescript
{
  userId: string;
  achievementId: string;
  achievementTitle: string;
  xpAwarded: number;
  totalXP: number;
  newLevel?: number;
  tier?: AchievementTier;
  timestamp: Date;
}
```

---

## Notification History & Tracking

#### `clearNotifications(userId: string): Promise<void>`

Clear all notifications for a user.

```typescript
// User cleared notification center
await achievementService.clearNotifications(userId);
```

#### `setLastNotificationView(userId: string): void`

Record when user last viewed notifications.

```typescript
// Called when user opens notification center
achievementService.setLastNotificationView(userId);
```

#### `getLastNotificationView(userId: string): Date | undefined`

Get when user last viewed notifications.

```typescript
const lastView = achievementService.getLastNotificationView(userId);
const newNotifCount = await achievementService.getRecentNotifications(userId);
// Count notifs since lastView
```

---

## Complete Usage Examples

### Example 1: Achievement Unlock Flow

```typescript
async function unlockAchievementWithNotification(userId: string, achievementId: string) {
  // Unlock the achievement
  const userAch = await achievementService.unlockAchievement(userId, achievementId);

  if (!userAch) return null;

  // Create notification
  const rewardNotif = await achievementService.triggerAchievementUnlockedNotification(
    userId,
    achievementId
  );

  // Check if milestone
  const achievement = achievementService.getAchievementDetails(achievementId);
  if (achievement?.milestone) {
    await achievementService.triggerMilestoneNotification(userId, achievementId);
  }

  return {
    achievement: userAch,
    reward: rewardNotif,
  };
}
```

### Example 2: Progress Update with Near-Completion Alert

```typescript
async function updateProgressWithAlert(userId: string, achievementId: string, newProgress: number) {
  const result = await achievementService.updateProgress(userId, achievementId, newProgress);

  if (!result) return null;

  // Check if near completion (90%+)
  const nearly = await achievementService.getNearlyCompletedAchievements(userId, 90);
  const isNearby = nearly.some(a => a.id === achievementId);

  if (isNearby) {
    await achievementService.triggerNearCompletionNotification(userId, achievementId, 90);
  }

  return result;
}
```

### Example 3: Notification Center Display

```typescript
async function getNotificationCenterData(userId: string) {
  const counts = await achievementService.getNotificationCount(userId);
  const recent = await achievementService.getRecentNotifications(userId, 24);

  return {
    unreadCount: counts.unread,
    totalCount: counts.total,
    notifications: recent.map(n => ({
      id: n.achievementId,
      title: n.achievement.title,
      icon: n.achievement.icon,
      type: n.type,
      xpReward: n.xpReward,
      timestamp: n.unlockedAt,
      read: n.read,
    })),
  };
}
```

### Example 4: Session Summary

```typescript
async function getSessionSummary(userId: string, sessionStartTime: Date) {
  const newAchs = await achievementService.getNewAchievements(userId, sessionStartTime);
  const totalXP = newAchs.reduce((sum, a) => sum + a.xpReward, 0);

  return {
    achievementsUnlocked: newAchs.length,
    totalXPEarned: totalXP,
    achievements: newAchs.map(a => ({
      title: a.achievement.title,
      xp: a.xpReward,
      rarity: a.achievement.rarity,
    })),
  };
}
```

---

## Frontend Integration

### Notification Badge

```typescript
function NotificationBadge({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function getCount() {
      const count = await achievementService.getNotificationCount(userId);
      setUnreadCount(count.unread);
    }
    getCount();
  }, [userId]);

  return unreadCount > 0 ? (
    <div className="badge">{unreadCount}</div>
  ) : null;
}
```

### Recent Achievements

```typescript
async function RecentAchievements({ userId }: { userId: string }) {
  const recent = await achievementService.getRecentNotifications(userId, 24);

  return (
    <div className="recent">
      {recent.map(notif => (
        <AchievementNotificationCard key={notif.achievementId} notification={notif} />
      ))}
    </div>
  );
}
```

### Nearly Completed Widget

```typescript
async function AlmostThereWidget({ userId }: { userId: string }) {
  const nearly = await achievementService.getNearlyCompletedAchievements(userId, 80);

  return (
    <div className="almost-there">
      <h3>Almost there!</h3>
      {nearly.slice(0, 3).map(ach => (
        <ProgressItem key={ach.id} achievement={ach} />
      ))}
    </div>
  );
}
```

---

## Notification Types

```typescript
type AchievementNotificationType =
  | 'unlocked' // Achievement just unlocked
  | 'near_completion' // Close to unlocking
  | 'milestone' // Milestone achievement reached
  | 'tier_achieved'; // New tier achieved
```

---

## Real-Time Notifications (Optional Enhancement)

For real-time notifications, integrate with WebSocket:

```typescript
// On achievement unlock, emit to user's socket
socket.emit('achievement.unlocked', {
  achievement,
  xpReward,
  notification,
});

// Client listens
socket.on('achievement.unlocked', data => {
  showAchievementPopup(data);
  updateXPBar(data.xpReward);
  playSound('unlock-sound.mp3');
});
```

---

## Summary

**Core Methods:**
✅ `getNewAchievements()` - Recently unlocked
✅ `getNearlyCompletedAchievements()` - Close to completion
✅ Automatic reward notifications with XP
✅ Full notification lifecycle management
✅ Read/unread tracking
✅ History and filtering
✅ Automatic trigger system

**Ready For:**
✅ Achievement unlock popups
✅ Notification center
✅ Progress alerts
✅ Session summaries
✅ Real-time notifications
✅ Mobile push notifications
✅ Email digests
