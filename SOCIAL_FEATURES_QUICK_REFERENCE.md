# Social Features Quick Reference

## Quick Method List

### Achievement Comparison

```typescript
await achievementService.compareAchievements(userId1, userId2);
// Returns: AchievementComparison with mutual, user1Only, user2Only achievements
```

### Friend Achievements

```typescript
await achievementService.getFriendsAchievements(userId);
// Returns: FriendAchievementData[] with achievements, tiers, recent unlocks
```

### Leaderboards

```typescript
await achievementService.getSocialLeaderboard(20);
// Returns: SocialLeaderboardEntry[] (global, by XP)

await achievementService.getFriendsLeaderboard(userId, 20);
// Returns: SocialLeaderboardEntry[] (friends only)
```

### Shareable Badges

```typescript
await achievementService.createShareableAchievementBadge(userId, achievementId);
// Returns: ShareableAchievementBadge with color, icon, shareUrl
```

### Friendships

```typescript
await achievementService.addFriend(userId1, userId2);
await achievementService.removeFriend(userId1, userId2);
achievementService.isFriend(userId1, userId2);
achievementService.getFriends(userId);
await achievementService.getMutualFriends(userId1, userId2);
```

### User Profiles

```typescript
await achievementService.getUserProfile(userId);
// Returns: UserProfile with achievements, XP, tier, friends list

await achievementService.updateUserProfile(userId, updates);
// Updates specific fields

await achievementService.getAchievementComparison(userId1, userId2);
// Returns: comparison + friendship data
```

---

## Data Models

### AchievementComparison

```typescript
{
  user1Id, user2Id, user1Username, user2Username,
  mutualAchievements[], user1OnlyAchievements[], user2OnlyAchievements[],
  mutualCount, similarityPercentage
}
```

### FriendAchievementData

```typescript
{
  userId, username,
  totalAchievements, completionPercentage,
  recentUnlocks[], highestTier
}
```

### SocialLeaderboardEntry

```typescript
{
  userId, username,
  totalAchievements, completionPercentage, totalXP,
  rank, friendsWith?
}
```

### UserProfile

```typescript
{
  userId, username,
  totalAchievements, completionPercentage, totalXP,
  highestTier, friendsList[]
}
```

### ShareableAchievementBadge

```typescript
{
  userId, username, achievement, unlockedAt, shareUrl,
  badge: { text, icon, color }
}
```

---

## API Endpoints (Express.js)

| Method | Endpoint                                        | Handler                         |
| ------ | ----------------------------------------------- | ------------------------------- |
| GET    | `/api/achievements/compare/:userId1/:userId2`   | compareAchievements             |
| GET    | `/api/achievements/friends/:userId`             | getFriendsAchievements          |
| GET    | `/api/achievements/leaderboard?limit=20`        | getSocialLeaderboard            |
| GET    | `/api/achievements/leaderboard/friends/:userId` | getFriendsLeaderboard           |
| POST   | `/api/achievements/:id/badge/:userId`           | createShareableAchievementBadge |
| POST   | `/api/friendships`                              | addFriend                       |
| DELETE | `/api/friendships/:userId1/:userId2`            | removeFriend                    |
| GET    | `/api/users/:userId/profile`                    | getUserProfile                  |
| GET    | `/api/achievements/:userId1/compare/:userId2`   | getAchievementComparison        |

---

## Badge Colors by Rarity

| Rarity    | Color  | Hex     |
| --------- | ------ | ------- |
| Common    | Gray   | #CCCCCC |
| Uncommon  | Green  | #00AA00 |
| Rare      | Blue   | #0055FF |
| Epic      | Purple | #AA00FF |
| Legendary | Orange | #FFAA00 |

---

## Common Patterns

### Render Leaderboard

```typescript
const leaderboard = await achievementService.getSocialLeaderboard(20);
leaderboard.map(entry => ({
  rank: entry.rank,
  user: entry.username,
  xp: entry.totalXP,
  achievements: entry.totalAchievements,
  progress: entry.completionPercentage,
}));
```

### Compare Two Users

```typescript
const comp = await achievementService.compareAchievements(user1, user2);
{
  mutual: comp.mutualCount,
  user1Only: comp.user1OnlyAchievements.length,
  user2Only: comp.user2OnlyAchievements.length,
  similarity: `${comp.similarityPercentage.toFixed(1)}%`
}
```

### Show Friend Achievements

```typescript
const friends = await achievementService.getFriendsAchievements(userId);
friends.map(f => ({
  name: f.username,
  achievements: f.totalAchievements,
  recent: f.recentUnlocks.map(a => a.title),
  bestTier: f.highestTier,
}));
```

### Share Achievement

```typescript
const badge = await achievementService.createShareableAchievementBadge(userId, achId);
const shareText = `I just earned the "${badge.achievement.title}" badge! 🎉`;
const shareUrl = badge.shareUrl;
```

---

## Performance Tips

1. **Cache profiles** - getUserProfile() results cached for 10 minutes
2. **Batch comparisons** - Compare multiple users in parallel
3. **Limit leaderboard** - Query only top 100, not all users
4. **Lazy load friends** - Load friend data on-demand, not on pageload
5. **Use pagination** - Implement cursor-based pagination for large lists

---

## State Management

### Leaderboard Updates

- Recalculate on achievement unlock
- Cache result for 5 minutes
- Invalidate cache on new XP

### Friend List Updates

- Update bidirectionally (addFriend adds to both users)
- Persist to database (not currently implemented)
- Sync across clients via WebSocket

### Profile Caching

- Cache in userProfileMap
- Update on achievement unlock
- Manual refresh with updateUserProfile()

---

## Integration Checklist

- [ ] Create API endpoints for all social methods
- [ ] Implement friendship database schema
- [ ] Add real-time leaderboard updates via WebSocket
- [ ] Create React components for comparison/leaderboards
- [ ] Add profile view pages
- [ ] Implement share buttons for achievements
- [ ] Set up friendship notifications
- [ ] Add friend request system
- [ ] Migrate in-memory maps to database
- [ ] Add caching layer (Redis)

---

## Files Modified

- `achievementService.ts` - Added ~15 social methods
- `gamification.ts` - Added 5 social interfaces
- `SOCIAL_FEATURES_INTEGRATION.md` - Full documentation
- `SOCIAL_FEATURES_QUICK_REFERENCE.md` - This file

---

## Related Guides

- [Full Integration Guide](SOCIAL_FEATURES_INTEGRATION.md)
- [Achievement Notifications](ACHIEVEMENT_NOTIFICATIONS.md)
- [Leaderboards](LEADERBOARD_INTEGRATION.md)
- [Gamification Overview](GAMIFICATION_GUIDE.md)
