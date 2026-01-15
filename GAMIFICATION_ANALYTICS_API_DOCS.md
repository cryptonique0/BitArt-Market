# Gamification Analytics API Documentation

## Overview

The Gamification Analytics API provides comprehensive statistics and insights about user achievements, engagement metrics, and system-wide gamification performance. All endpoints are protected with JWT authentication.

**Base URL:** `/api/gamification/analytics`

---

## Authentication

All endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. User Achievement Statistics

#### GET `/api/gamification/analytics/user/:userId/achievements`

Retrieves comprehensive achievement statistics for a specific user.

**Parameters:**

- `userId` (string, required) - The user ID

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalXP": 15250,
    "currentLevel": 8,
    "totalAchievementsUnlocked": 24,
    "totalAchievementsAvailable": 50,
    "overallUnlockRate": 0.48,
    "recentUnlocksCount": 3,
    "achievements": {
      "locked": 26,
      "inProgress": 5,
      "unlocked": 24
    },
    "byType": {
      "milestone": 5,
      "challenge": 8,
      "seasonal": 2,
      "special": 2,
      "event": 7
    },
    "byRarity": {
      "common": 15,
      "uncommon": 5,
      "rare": 3,
      "epic": 1,
      "legendary": 0
    },
    "byTier": {
      "tier1": 8,
      "tier2": 10,
      "tier3": 6
    },
    "streakStats": {
      "currentStreak": 7,
      "longestStreak": 34,
      "totalStreaks": 12
    },
    "lastActivityDate": "2024-01-15T10:30:00Z",
    "firstUnlockDate": "2024-01-01T00:00:00Z"
  },
  "message": "User achievement statistics retrieved successfully"
}
```

**Error Responses:**

- `400`: userId is required
- `500`: Failed to retrieve user statistics

---

#### GET `/api/gamification/analytics/user/:userId/summary`

Retrieves a simplified summary of user achievement statistics.

**Parameters:**

- `userId` (string, required) - The user ID

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalXP": 15250,
    "currentLevel": 8,
    "totalAchievementsUnlocked": 24,
    "totalAchievementsAvailable": 50,
    "overallUnlockRate": 0.48,
    "recentUnlocksCount": 3,
    "achievements": {
      "locked": 26,
      "inProgress": 5,
      "unlocked": 24
    },
    "lastActivityDate": "2024-01-15T10:30:00Z"
  },
  "message": "User summary retrieved successfully"
}
```

---

### 2. Achievement Popularity

#### GET `/api/gamification/analytics/achievements/:achievementId/popularity`

Retrieves popularity metrics for a specific achievement.

**Parameters:**

- `achievementId` (string, required) - The achievement ID

**Response:**

```json
{
  "success": true,
  "data": {
    "achievementId": "first_nft",
    "title": "First NFT Purchase",
    "totalUnlocks": 342,
    "uniqueUsers": 320,
    "unlockRate": 0.64,
    "averageProgressByLockedUsers": 0.35,
    "daysToUnlockMedian": 3,
    "trendingScore": 0.78,
    "isPopular": true,
    "isRare": false,
    "popularityLevel": "common",
    "recentUnlocksCount": 45,
    "lastUnlockDate": "2024-01-15T10:30:00Z"
  },
  "message": "Achievement popularity retrieved successfully"
}
```

**Error Responses:**

- `400`: achievementId is required
- `500`: Failed to retrieve achievement popularity

---

#### GET `/api/gamification/analytics/achievements/:achievementId/unlock-rate`

Retrieves the unlock rate for a specific achievement.

**Parameters:**

- `achievementId` (string, required) - The achievement ID

**Response:**

```json
{
  "success": true,
  "data": {
    "achievementId": "first_nft",
    "title": "First NFT Purchase",
    "unlockRate": 0.64,
    "totalUnlocks": 342,
    "totalUsers": 534,
    "popularityLevel": "common",
    "trend": "increasing"
  },
  "message": "Achievement unlock rate retrieved successfully"
}
```

**Error Responses:**

- `400`: achievementId is required
- `500`: Failed to retrieve unlock rate

---

### 3. Achievement Unlock Rates (All Achievements)

#### GET `/api/gamification/analytics/achievements-rates?sort=desc&limit=50`

Retrieves unlock rates for all achievements with optional sorting and limiting.

**Query Parameters:**

- `sort` (string, optional, default: "desc") - Sort order: "asc" or "desc"
- `limit` (number, optional, default: 50) - Maximum number of results

**Response:**

```json
{
  "success": true,
  "count": 50,
  "total": 105,
  "data": [
    {
      "achievementId": "first_nft",
      "title": "First NFT Purchase",
      "unlockRate": 0.64,
      "totalUnlocks": 342,
      "totalUsers": 534,
      "popularityLevel": "common",
      "trend": "increasing"
    },
    {
      "achievementId": "collector_100",
      "title": "Collector's Dozen",
      "unlockRate": 0.12,
      "totalUnlocks": 64,
      "totalUsers": 534,
      "popularityLevel": "rare",
      "trend": "stable"
    }
  ],
  "message": "Retrieved 50 achievement unlock rates"
}
```

---

### 4. Achievement Engagement Metrics

#### GET `/api/gamification/analytics/achievements/:achievementId/engagement`

Retrieves engagement metrics for a specific achievement.

**Parameters:**

- `achievementId` (string, required) - The achievement ID

**Response:**

```json
{
  "success": true,
  "data": {
    "achievementId": "first_nft",
    "unlockVelocity": 2.3,
    "recentUnlocks": 45,
    "engagementScore": 0.82,
    "isEngaging": true,
    "usersInProgress": 156,
    "averageProgressPercentage": 0.35
  },
  "message": "Achievement engagement metrics retrieved successfully"
}
```

**Error Responses:**

- `400`: achievementId is required
- `500`: Failed to retrieve engagement metrics

---

### 5. System-Wide Statistics

#### GET `/api/gamification/analytics/system/stats`

Retrieves comprehensive system-wide statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 534,
    "totalUnlockedAchievements": 8567,
    "totalXPDistributed": 2145000,
    "averageUserLevel": 4.2,
    "averageXPPerUser": 4017,
    "averageAchievementsPerUser": 16.03,
    "mostPopularAchievement": {
      "id": "first_nft",
      "title": "First NFT Purchase",
      "unlocks": 342
    },
    "rarestAchievement": {
      "id": "god_collector",
      "title": "God's Collection",
      "unlocks": 2
    },
    "totalSeasonalAchievements": 24,
    "activeSeasons": 2,
    "unlockRateByRarity": {
      "common": 0.68,
      "uncommon": 0.42,
      "rare": 0.18,
      "epic": 0.08,
      "legendary": 0.02
    },
    "unlockRateByType": {
      "milestone": 0.55,
      "challenge": 0.38,
      "seasonal": 0.25,
      "special": 0.12,
      "event": 0.45
    }
  },
  "message": "System-wide statistics retrieved successfully"
}
```

---

#### GET `/api/gamification/analytics/dashboard/overview`

Retrieves a dashboard-friendly overview of system statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 534,
      "totalAchievements": 8567,
      "totalXPDistributed": 2145000,
      "averageUserLevel": 4.2
    },
    "topMetrics": {
      "mostPopular": {
        "id": "first_nft",
        "title": "First NFT Purchase",
        "unlocks": 342
      },
      "rarest": {
        "id": "god_collector",
        "title": "God's Collection",
        "unlocks": 2
      },
      "averageXPPerUser": 4017,
      "averageAchievementsPerUser": 16.03
    },
    "seasonal": {
      "totalSeasonalAchievements": 24,
      "activeSeasons": 2
    },
    "distribution": {
      "byRarity": {
        "common": 0.68,
        "uncommon": 0.42,
        "rare": 0.18,
        "epic": 0.08,
        "legendary": 0.02
      },
      "byType": {
        "milestone": 0.55,
        "challenge": 0.38,
        "seasonal": 0.25,
        "special": 0.12,
        "event": 0.45
      }
    }
  },
  "message": "Dashboard overview retrieved successfully"
}
```

---

### 6. Top Unlocked Achievements

#### GET `/api/gamification/analytics/achievements/top-unlocked?limit=10`

Retrieves the most unlocked achievements.

**Query Parameters:**

- `limit` (number, optional, default: 10) - Number of results to return

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "achievementId": "first_nft",
      "title": "First NFT Purchase",
      "unlockRate": 0.64,
      "totalUnlocks": 342,
      "totalUsers": 534,
      "popularityLevel": "common",
      "trend": "increasing"
    }
  ],
  "message": "Retrieved top 10 most unlocked achievements"
}
```

---

### 7. Rarest Achievements

#### GET `/api/gamification/analytics/achievements/rarest?limit=10`

Retrieves the rarest (least unlocked) achievements.

**Query Parameters:**

- `limit` (number, optional, default: 10) - Number of results to return

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "achievementId": "god_collector",
      "title": "God's Collection",
      "unlockRate": 0.004,
      "totalUnlocks": 2,
      "totalUsers": 534,
      "popularityLevel": "legendary",
      "trend": "stable"
    }
  ],
  "message": "Retrieved 10 rarest achievements"
}
```

---

### 8. Trending Achievements

#### GET `/api/gamification/analytics/achievements/trending?limit=10`

Retrieves trending achievements with high recent engagement.

**Query Parameters:**

- `limit` (number, optional, default: 10) - Number of results to return

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "achievementId": "winter_collector",
      "title": "Winter Collector",
      "unlockRate": 0.35,
      "totalUnlocks": 187,
      "totalUsers": 534,
      "popularityLevel": "uncommon",
      "trend": "increasing"
    }
  ],
  "message": "Retrieved 5 trending achievements"
}
```

---

## Data Types

### UserAchievementStats

```typescript
interface UserAchievementStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  totalAchievementsUnlocked: number;
  totalAchievementsAvailable: number;
  overallUnlockRate: number;
  recentUnlocksCount: number;
  achievements: {
    locked: number;
    inProgress: number;
    unlocked: number;
  };
  byType: Record<string, number>;
  byRarity: Record<string, number>;
  byTier: Record<string, number>;
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    totalStreaks: number;
  };
  lastActivityDate: Date;
  firstUnlockDate: Date;
}
```

### AchievementPopularity

```typescript
interface AchievementPopularity {
  achievementId: string;
  title: string;
  totalUnlocks: number;
  uniqueUsers: number;
  unlockRate: number;
  averageProgressByLockedUsers: number;
  daysToUnlockMedian: number;
  trendingScore: number;
  isPopular: boolean;
  isRare: boolean;
  popularityLevel: string;
  recentUnlocksCount: number;
  lastUnlockDate: Date;
}
```

### AchievementUnlockRate

```typescript
interface AchievementUnlockRate {
  achievementId: string;
  title: string;
  unlockRate: number;
  totalUnlocks: number;
  totalUsers: number;
  popularityLevel: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}
```

### AchievementEngagementMetrics

```typescript
interface AchievementEngagementMetrics {
  achievementId: string;
  unlockVelocity: number;
  recentUnlocks: number;
  engagementScore: number;
  isEngaging: boolean;
  usersInProgress: number;
  averageProgressPercentage: number;
}
```

### SystemwideStats

```typescript
interface SystemwideStats {
  totalUsers: number;
  totalUnlockedAchievements: number;
  totalXPDistributed: number;
  averageUserLevel: number;
  averageXPPerUser: number;
  averageAchievementsPerUser: number;
  mostPopularAchievement: Achievement;
  rarestAchievement: Achievement;
  totalSeasonalAchievements: number;
  activeSeasons: number;
  unlockRateByRarity: Record<string, number>;
  unlockRateByType: Record<string, number>;
}
```

---

## Error Handling

All endpoints follow a consistent error handling pattern:

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Code | Message               | Cause                                              |
| ---- | --------------------- | -------------------------------------------------- |
| 400  | Parameter is required | Missing required query parameter or path parameter |
| 401  | Unauthorized          | Missing or invalid JWT token                       |
| 404  | Not Found             | Achievement or user not found                      |
| 500  | Failed to retrieve    | Server-side error processing request               |

---

## Performance Considerations

1. **Caching**: System statistics endpoints should be cached for 5-15 minutes
2. **Pagination**: For large datasets, implement pagination using the `limit` parameter
3. **Real-time**: User statistics are calculated on-demand; cache for 1-5 minutes
4. **Database Indexes**: Ensure indexes on `userId`, `achievementId`, and unlock timestamps

---

## Usage Examples

### Get User Stats

```bash
curl -X GET https://api.bitart.com/api/gamification/analytics/user/user123/achievements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Most Unlocked Achievements

```bash
curl -X GET 'https://api.bitart.com/api/gamification/analytics/achievements/top-unlocked?limit=5' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get System Dashboard Overview

```bash
curl -X GET https://api.bitart.com/api/gamification/analytics/dashboard/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Integration Notes

### Frontend Integration

The analytics endpoints are designed to work seamlessly with frontend dashboard components:

1. **User Profile Dashboard**: Use `/user/:userId/summary` endpoint
2. **Analytics Dashboard**: Use `/system/stats` or `/dashboard/overview` endpoint
3. **Achievement Details**: Use `/achievements/:achievementId/popularity` and `/engagement` endpoints
4. **Rankings**: Use `/achievements/top-unlocked`, `/achievements/rarest`, and `/achievements/trending` endpoints

### Performance Optimization

- Use `/user/:userId/summary` for light-weight user stats
- Cache system statistics with 15-minute TTL
- Load trending achievements asynchronously
- Implement pagination for large result sets

---

## Related Services

- [Gamification Service Documentation](./GAMIFICATION_GUIDE.md)
- [Achievement Service Documentation](./ACHIEVEMENTS_GUIDE.md)
- [Persistence Layer Documentation](./PERSISTENCE_GUIDE.md)

---

## Version History

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 1.0     | 2024-01-15 | Initial release with 8 core endpoints |

---

## Support

For issues or questions about the Analytics API:

1. Check the [Gamification Documentation](./GAMIFICATION_GUIDE.md)
2. Review error messages and [Common Issues](./TROUBLESHOOTING.md)
3. Contact the development team
