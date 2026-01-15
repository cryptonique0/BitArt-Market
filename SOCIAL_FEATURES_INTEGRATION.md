# Social Features Integration Guide

## Overview

The social features module enables users to compare achievements, view friend achievements, create leaderboards among friends, and share achievement badges. This document provides complete integration guidance for the social achievement system.

## Core Social Methods

### 1. Achievement Comparison

**Method:** `compareAchievements(userId1: string, userId2: string): Promise<AchievementComparison>`

Compares achievements between two users, returning mutual and unique achievements with a similarity percentage.

```typescript
// Compare two users' achievements
const comparison = await achievementService.compareAchievements('user1', 'user2');

// Returns:
{
  user1Id: 'user1',
  user2Id: 'user2',
  user1Username: 'User_user1...',
  user2Username: 'User_user2...',
  mutualAchievements: Achievement[],     // Achievements both users have
  user1OnlyAchievements: Achievement[],  // Only user1 has
  user2OnlyAchievements: Achievement[],  // Only user2 has
  mutualCount: 5,                         // Number of mutual achievements
  similarityPercentage: 38.46             // % of total achievements in common
}
```

**Use Cases:**

- Display achievement comparison in user profile pages
- Show profile cards with achievement compatibility
- Social matching/comparison widgets
- Achievement challenge features

---

### 2. Friend Achievements

**Method:** `getFriendsAchievements(userId: string): Promise<FriendAchievementData[]>`

Retrieves achievement summaries for all of a user's friends, including recent unlocks and highest tier.

```typescript
// Get all friend achievements
const friendsAchs = await achievementService.getFriendsAchievements('user123');

// Returns array of:
{
  userId: 'friend1',
  username: 'User_friend1...',
  totalAchievements: 12,
  completionPercentage: 92.31,
  recentUnlocks: Achievement[],  // Last 5 unlocked achievements
  highestTier: AchievementTier.GOLD
}
```

**Use Cases:**

- Friends activity feed
- Friend achievement showcase
- Motivation dashboard (see what friends unlocked)
- Notification triggers for friend achievements
- Comparison prompts

---

### 3. Social Leaderboard (Global)

**Method:** `getSocialLeaderboard(limit: number = 20): Promise<SocialLeaderboardEntry[]>`

Returns global achievement leaderboard sorted by XP and achievement count.

```typescript
// Get top 50 players
const leaderboard = await achievementService.getSocialLeaderboard(50);

// Returns array of:
{
  userId: 'user123',
  username: 'User_user123...',
  totalAchievements: 18,
  completionPercentage: 100,
  totalXP: 5420,
  rank: 1,
  friendsWith?: true  // Optional, true if viewing user is friend
}
```

**Use Cases:**

- Global achievement leaderboard display
- Compete against all players
- Motivational rankings
- Top achievers showcase
- Seasonal leaderboards

---

### 4. Friends Leaderboard

**Method:** `getFriendsLeaderboard(userId: string, limit: number = 20): Promise<SocialLeaderboardEntry[]>`

Returns leaderboard showing only user's friends, ranked by XP and achievement count.

```typescript
// Get friends ranked by achievements
const friendsLeaderboard = await achievementService.getFriendsLeaderboard('user123', 10);

// Same format as global leaderboard but filtered to friends only
```

**Use Cases:**

- Compete specifically with friends
- Friend rankings
- Friendly competition tracker
- Friend performance monitoring

---

### 5. Shareable Achievement Badges

**Method:** `createShareableAchievementBadge(userId: string, achievementId: string): Promise<ShareableAchievementBadge | null>`

Creates a shareable badge for an achievement, including visual styling and share URL.

```typescript
// Create shareable badge
const badge = await achievementService.createShareableAchievementBadge('user123', 'first_nft');

// Returns:
{
  userId: 'user123',
  username: 'User_user123...',
  achievement: Achievement,
  unlockedAt: Date,
  shareUrl: '/achievements/first_nft?user=user123',
  badge: {
    text: '🎨 First NFT Created',
    icon: '🎨',
    color: '#AA00FF'  // Based on rarity (epic = purple)
  }
}
```

**Badge Colors by Rarity:**

- Common: `#CCCCCC` (Gray)
- Uncommon: `#00AA00` (Green)
- Rare: `#0055FF` (Blue)
- Epic: `#AA00FF` (Purple)
- Legendary: `#FFAA00` (Orange)

**Use Cases:**

- Share achievements on social media
- Achievement showcase widgets
- Certificate/badge display
- Social sharing integrations

---

## Friendship Management

### Add Friend

**Method:** `addFriend(userId1: string, userId2: string): Promise<boolean>`

Establishes a bidirectional friendship.

```typescript
// Add friendship
const success = await achievementService.addFriend('user1', 'user2');

// Creates mutual friendship in friendshipMap
```

### Remove Friend

**Method:** `removeFriend(userId1: string, userId2: string): Promise<boolean>`

Removes a bidirectional friendship.

```typescript
// Remove friendship
const success = await achievementService.removeFriend('user1', 'user2');
```

### Get Friends List

**Method:** `getFriends(userId: string): string[]`

Returns array of user's friend IDs.

```typescript
const friends = achievementService.getFriends('user123');
// Returns: ['friend1', 'friend2', 'friend3']
```

### Check Friendship Status

**Method:** `isFriend(userId1: string, userId2: string): boolean`

Checks if two users are friends.

```typescript
const areFriends = achievementService.isFriend('user1', 'user2');
// Returns: true or false
```

### Get Mutual Friends

**Method:** `getMutualFriends(userId1: string, userId2: string): Promise<string[]>`

Returns array of mutual friends between two users.

```typescript
const mutual = await achievementService.getMutualFriends('user1', 'user2');
// Returns: ['friend4', 'friend5']
```

---

## User Profile Management

### Get User Profile

**Method:** `getUserProfile(userId: string): Promise<UserProfile | null>`

Retrieves comprehensive user profile with achievement statistics.

```typescript
// Get user profile
const profile = await achievementService.getUserProfile('user123');

// Returns:
{
  userId: 'user123',
  username: 'User_user123...',
  totalAchievements: 15,
  completionPercentage: 100,
  totalXP: 4250,
  highestTier: AchievementTier.PLATINUM,
  friendsList: ['friend1', 'friend2', 'friend3']
}
```

### Update User Profile

**Method:** `updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>`

Updates specific profile fields.

```typescript
// Update profile
const updated = await achievementService.updateUserProfile('user123', {
  username: 'CustomUsername',
});
```

---

## Advanced Comparisons

### Get Achievement Comparison with Friendship Data

**Method:** `getAchievementComparison(userId1: string, userId2: string): Promise<ComparisonWithContext>`

Combines achievement comparison with friendship and mutual friends data.

```typescript
// Get detailed comparison
const result = await achievementService.getAchievementComparison('user1', 'user2');

// Returns:
{
  comparison: AchievementComparison,
  areFriends: true,
  mutualFriends: ['friend3', 'friend4']  // Mutual friends
}
```

**Use Cases:**

- Detailed profile comparison page
- Friend request suggestions
- Social graph visualization
- Connection strength indicators

---

## Data Structures

### AchievementComparison

```typescript
interface AchievementComparison {
  user1Id: string;
  user2Id: string;
  user1Username: string;
  user2Username: string;
  mutualAchievements: Achievement[];
  user1OnlyAchievements: Achievement[];
  user2OnlyAchievements: Achievement[];
  mutualCount: number;
  similarityPercentage: number;
}
```

### FriendAchievementData

```typescript
interface FriendAchievementData {
  userId: string;
  username: string;
  totalAchievements: number;
  completionPercentage: number;
  recentUnlocks: Achievement[];
  highestTier: AchievementTier;
}
```

### SocialLeaderboardEntry

```typescript
interface SocialLeaderboardEntry {
  userId: string;
  username: string;
  totalAchievements: number;
  completionPercentage: number;
  totalXP: number;
  rank: number;
  friendsWith?: boolean;
}
```

### ShareableAchievementBadge

```typescript
interface ShareableAchievementBadge {
  userId: string;
  username: string;
  achievement: Achievement;
  unlockedAt: Date;
  shareUrl: string;
  badge: {
    text: string;
    icon: string;
    color: string;
  };
}
```

### UserProfile

```typescript
interface UserProfile {
  userId: string;
  username: string;
  totalAchievements: number;
  completionPercentage: number;
  totalXP: number;
  highestTier: AchievementTier;
  friendsList: string[];
}
```

---

## API Endpoint Examples

### Express.js Integration

```typescript
// Compare achievements
app.get('/api/achievements/compare/:userId1/:userId2', async (req, res) => {
  const comparison = await achievementService.compareAchievements(
    req.params.userId1,
    req.params.userId2
  );
  res.json(comparison);
});

// Get friend achievements
app.get('/api/achievements/friends/:userId', async (req, res) => {
  const friends = await achievementService.getFriendsAchievements(req.params.userId);
  res.json(friends);
});

// Get leaderboards
app.get('/api/achievements/leaderboard', async (req, res) => {
  const limit = req.query.limit || 20;
  const leaderboard = await achievementService.getSocialLeaderboard(limit);
  res.json(leaderboard);
});

app.get('/api/achievements/leaderboard/friends/:userId', async (req, res) => {
  const limit = req.query.limit || 20;
  const leaderboard = await achievementService.getFriendsLeaderboard(req.params.userId, limit);
  res.json(leaderboard);
});

// Create shareable badge
app.post('/api/achievements/:achievementId/badge/:userId', async (req, res) => {
  const badge = await achievementService.createShareableAchievementBadge(
    req.params.userId,
    req.params.achievementId
  );
  res.json(badge);
});

// Friendship management
app.post('/api/friendships', async (req, res) => {
  const { userId1, userId2 } = req.body;
  const success = await achievementService.addFriend(userId1, userId2);
  res.json({ success });
});

app.delete('/api/friendships/:userId1/:userId2', async (req, res) => {
  const success = await achievementService.removeFriend(req.params.userId1, req.params.userId2);
  res.json({ success });
});

// User profiles
app.get('/api/users/:userId/profile', async (req, res) => {
  const profile = await achievementService.getUserProfile(req.params.userId);
  res.json(profile);
});

// Get comparison with context
app.get('/api/achievements/:userId1/compare/:userId2', async (req, res) => {
  const comparison = await achievementService.getAchievementComparison(
    req.params.userId1,
    req.params.userId2
  );
  res.json(comparison);
});
```

---

## Frontend Integration Examples

### React Component - Achievement Comparison

```typescript
function AchievementComparison({ userId1, userId2 }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    achievementService.compareAchievements(userId1, userId2)
      .then(setComparison);
  }, [userId1, userId2]);

  return (
    <div className="comparison">
      <div className="user">
        <h3>{comparison.user1Username}</h3>
        <p>Achievements: {comparison.user1OnlyAchievements.length}</p>
      </div>

      <div className="mutual">
        <p>Mutual: {comparison.mutualCount}</p>
        <p>Similarity: {comparison.similarityPercentage.toFixed(1)}%</p>
      </div>

      <div className="user">
        <h3>{comparison.user2Username}</h3>
        <p>Achievements: {comparison.user2OnlyAchievements.length}</p>
      </div>
    </div>
  );
}
```

### React Component - Friends Leaderboard

```typescript
function FriendsLeaderboard({ userId }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    achievementService.getFriendsLeaderboard(userId, 10)
      .then(setLeaderboard);
  }, [userId]);

  return (
    <div className="leaderboard">
      <h2>Friends Leaderboard</h2>
      <ul>
        {leaderboard.map((entry) => (
          <li key={entry.userId}>
            <span className="rank">#{entry.rank}</span>
            <span className="name">{entry.username}</span>
            <span className="xp">{entry.totalXP} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### React Component - Shareable Badge

```typescript
function ShareableAchievementBadge({ userId, achievementId }) {
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    achievementService.createShareableAchievementBadge(userId, achievementId)
      .then(setBadge);
  }, [userId, achievementId]);

  if (!badge) return null;

  return (
    <div className="badge" style={{ backgroundColor: badge.badge.color }}>
      <span className="icon">{badge.badge.icon}</span>
      <span className="text">{badge.badge.text}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}${badge.shareUrl}`
          );
        }}
      >
        Share
      </button>
    </div>
  );
}
```

---

## Performance Considerations

### Caching Strategy

- User profiles are cached in `userProfileMap`
- Call `updateUserProfile()` to refresh cache
- Leaderboard calculations are on-demand (O(n log n) sort)
- Friendship maps use Sets for O(1) lookup

### Optimization Tips

1. **Batch Comparisons:** Load multiple user comparisons in parallel
2. **Lazy Load:** Load friend achievements on demand, not on page load
3. **Cache Leaderboards:** Store leaderboard results with 5-minute TTL
4. **Pagination:** Use `limit` parameter for large friend lists

### Data Storage Limits

- Current: In-memory Maps (max ~100k users on standard hardware)
- Migration: Move `friendshipMap` and `userProfileMap` to database for scaling
- Recommendation: Implement caching layer (Redis) for leaderboards

---

## Testing Examples

```typescript
// Test achievement comparison
async function testComparison() {
  // Add achievements for two users
  await achievementService.unlockAchievement('user1', 'first_nft');
  await achievementService.unlockAchievement('user1', 'creator');
  await achievementService.unlockAchievement('user2', 'first_nft');
  await achievementService.unlockAchievement('user2', 'trader');

  // Compare
  const comparison = await achievementService.compareAchievements('user1', 'user2');

  console.log('Mutual:', comparison.mutualCount); // 1
  console.log('Similarity:', comparison.similarityPercentage); // ~7.69%
  console.log('User1 Only:', comparison.user1OnlyAchievements.length); // 1
  console.log('User2 Only:', comparison.user2OnlyAchievements.length); // 1
}

// Test friendship
async function testFriendship() {
  const added = await achievementService.addFriend('user1', 'user2');
  console.log('Friends added:', added); // true

  const isFriend = achievementService.isFriend('user1', 'user2');
  console.log('Are friends:', isFriend); // true

  const removed = await achievementService.removeFriend('user1', 'user2');
  console.log('Friends removed:', removed); // true
}

// Test leaderboard
async function testLeaderboard() {
  // Add XP for multiple users
  await achievementService.trackUserXP('user1', 100, 'achievement');
  await achievementService.trackUserXP('user2', 200, 'achievement');
  await achievementService.trackUserXP('user3', 50, 'achievement');

  // Get leaderboard
  const leaderboard = await achievementService.getSocialLeaderboard(10);
  console.log('Top user:', leaderboard[0].username);
  console.log(
    'Ranks:',
    leaderboard.map(e => e.rank)
  );
}
```

---

## Common Issues & Solutions

### Issue: Friendship not showing in leaderboard

**Solution:** Ensure bidirectional friendship is established with `addFriend()`

### Issue: Cached profile outdated

**Solution:** Call `updateUserProfile()` after achievement unlock

### Issue: Slow leaderboard queries

**Solution:** Implement Redis caching or limit query scope to top 100

### Issue: Share URLs not working

**Solution:** Ensure backend serves `/achievements/:id` endpoint with proper routing

---

## Next Steps

1. **Database Integration:** Move `friendshipMap` and `userProfileMap` to Supabase
2. **Real-time Updates:** Add WebSocket support for live leaderboard updates
3. **Notifications:** Trigger notifications when friends unlock achievements
4. **Analytics:** Track social engagement metrics
5. **Seasonal Leaderboards:** Implement time-based leaderboard resets

---

## Related Documentation

- [Achievement Tiers Integration](ACHIEVEMENT_TIERS_INTEGRATION.md)
- [Leaderboard Integration](LEADERBOARD_INTEGRATION.md)
- [Achievement Notifications](ACHIEVEMENT_NOTIFICATIONS.md)
- [Gamification Guide](GAMIFICATION_GUIDE.md)
