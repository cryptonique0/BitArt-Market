# Analytics Routes - Quick Reference Guide

## Routes at a Glance

### Base URL

```
/api/gamification/analytics
```

### All 11 Endpoints

| Method | Endpoint                              | Purpose               | Auth   |
| ------ | ------------------------------------- | --------------------- | ------ |
| GET    | `/user/:userId/achievements`          | Full user stats       | ✅ JWT |
| GET    | `/user/:userId/summary`               | Quick user summary    | ✅ JWT |
| GET    | `/achievements/:id/popularity`        | Popularity metrics    | ✅ JWT |
| GET    | `/achievements/:id/unlock-rate`       | Single unlock rate    | ✅ JWT |
| GET    | `/achievements-rates?limit=50`        | All unlock rates      | ✅ JWT |
| GET    | `/achievements/:id/engagement`        | Engagement metrics    | ✅ JWT |
| GET    | `/system/stats`                       | System-wide stats     | ✅ JWT |
| GET    | `/dashboard/overview`                 | Dashboard overview    | ✅ JWT |
| GET    | `/achievements/top-unlocked?limit=10` | Top achievements      | ✅ JWT |
| GET    | `/achievements/rarest?limit=10`       | Rarest achievements   | ✅ JWT |
| GET    | `/achievements/trending?limit=10`     | Trending achievements | ✅ JWT |

---

## Service Methods

```typescript
// Import
import analyticsService from '../services/analyticsService';

// Methods
await analyticsService.getUserAchievementStats(userId);
await analyticsService.getAchievementPopularity(achievementId);
await analyticsService.getAchievementUnlockRates();
await analyticsService.getAchievementUnlockRate(achievementId);
await analyticsService.getSystemwideStats();
await analyticsService.getAchievementEngagementMetrics(achievementId);
```

---

## Response Examples

### User Stats

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "totalXP": 15250,
    "currentLevel": 8,
    "totalAchievementsUnlocked": 24,
    "overallUnlockRate": 0.48,
    "achievements": {
      "locked": 26,
      "inProgress": 5,
      "unlocked": 24
    }
  }
}
```

### Achievement Popularity

```json
{
  "success": true,
  "data": {
    "achievementId": "first_nft",
    "title": "First NFT Purchase",
    "unlockRate": 0.64,
    "totalUnlocks": 342,
    "isPopular": true
  }
}
```

### System Stats

```json
{
  "success": true,
  "data": {
    "totalUsers": 534,
    "totalXPDistributed": 2145000,
    "averageUserLevel": 4.2,
    "mostPopularAchievement": { ... }
  }
}
```

---

## Common Requests

### Fetch user stats

```bash
curl -X GET /api/gamification/analytics/user/user123/achievements \
  -H "Authorization: Bearer TOKEN"
```

### Get top 5 achievements

```bash
curl -X GET '/api/gamification/analytics/achievements/top-unlocked?limit=5' \
  -H "Authorization: Bearer TOKEN"
```

### Get system dashboard

```bash
curl -X GET /api/gamification/analytics/dashboard/overview \
  -H "Authorization: Bearer TOKEN"
```

### Get trending achievements

```bash
curl -X GET '/api/gamification/analytics/achievements/trending?limit=10' \
  -H "Authorization: Bearer TOKEN"
```

---

## Key Files

| File                                       | Purpose          | Lines   |
| ------------------------------------------ | ---------------- | ------- |
| `backend/src/routes/analyticsRoutes.ts`    | API endpoints    | 320     |
| `backend/src/services/analyticsService.ts` | Business logic   | 600+    |
| `backend/src/types/gamification.ts`        | Type definitions | 45+     |
| `backend/src/index.ts`                     | App registration | 2 lines |

---

## Integration in Express

```typescript
// In backend/src/index.ts
import gamificationAnalyticsRoutes from './routes/analyticsRoutes';

app.use('/api/gamification/analytics', gamificationAnalyticsRoutes);
```

---

## Type Definitions

```typescript
interface UserAchievementStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  totalAchievementsUnlocked: number;
  overallUnlockRate: number;
  achievements: { locked: number; inProgress: number; unlocked: number };
  // ... 20+ more properties
}

interface AchievementPopularity {
  achievementId: string;
  title: string;
  totalUnlocks: number;
  unlockRate: number;
  isPopular: boolean;
  // ... 10+ more properties
}

interface SystemwideStats {
  totalUsers: number;
  totalXPDistributed: number;
  averageUserLevel: number;
  unlockRateByType: Record<string, number>;
  // ... 10+ more properties
}
```

---

## Error Codes

| Code | Error                 | Cause                    |
| ---- | --------------------- | ------------------------ |
| 400  | Parameter is required | Missing path/query param |
| 401  | Unauthorized          | Invalid JWT token        |
| 404  | Not Found             | Resource doesn't exist   |
| 500  | Failed to retrieve    | Server error             |

---

## Frontend Usage

### Fetch User Stats

```typescript
const response = await fetch(`/api/gamification/analytics/user/${userId}/summary`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await response.json();
```

### Fetch System Overview

```typescript
const response = await fetch('/api/gamification/analytics/dashboard/overview', {
  headers: { Authorization: `Bearer ${token}` },
});
const { data } = await response.json();
```

### Custom Hook Example

```typescript
function useGameificationAnalytics(userId: string) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gamification/analytics/user/${userId}/achievements`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setStats(data.data))
      .finally(() => setLoading(false));
  }, [userId]);

  return { stats, loading };
}
```

---

## Caching Recommendations

| Endpoint               | TTL     | Reason                          |
| ---------------------- | ------- | ------------------------------- |
| User stats             | 1-5 min | User-specific, frequent changes |
| Achievement popularity | 5 min   | Changes with new unlocks        |
| System stats           | 15 min  | Aggregate, slower changes       |
| Trending               | 10 min  | Dynamic ranking                 |
| Unlock rates           | 15 min  | Relatively stable               |

---

## Performance Tips

1. **Cache Summary Endpoints**
   - User summary (1-5 min)
   - System overview (15 min)

2. **Lazy Load Details**
   - Load full stats on demand
   - Stream trending data
   - Paginate large lists

3. **Batch Requests**
   - Fetch multiple endpoints in parallel
   - Combine related data

4. **Monitor Performance**
   - Track response times
   - Log slow queries
   - Monitor cache hits

---

## Deployment Checklist

- [ ] Routes file created at `backend/src/routes/analyticsRoutes.ts`
- [ ] Service file exists at `backend/src/services/analyticsService.ts`
- [ ] Route imported in `backend/src/index.ts`
- [ ] Route mounted at `/api/gamification/analytics`
- [ ] JWT middleware applied to all routes
- [ ] Database indexes created
- [ ] Caching layer configured
- [ ] Error monitoring enabled
- [ ] Rate limiting configured
- [ ] Documentation deployed

---

## Testing

### Unit Test Template

```typescript
describe('analyticsService.getUserAchievementStats', () => {
  it('should return user stats', async () => {
    const stats = await analyticsService.getUserAchievementStats('user123');
    expect(stats.totalXP).toBeGreaterThanOrEqual(0);
    expect(stats.overallUnlockRate).toBeLessThanOrEqual(1);
  });
});
```

### Integration Test Template

```typescript
describe('GET /user/:userId/achievements', () => {
  it('should return 200 with stats', async () => {
    const res = await request(app)
      .get('/api/gamification/analytics/user/user123/achievements')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should return 400 without userId', async () => {
    const res = await request(app)
      .get('/api/gamification/analytics/user//achievements')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
```

---

## Documentation Links

- [Full API Docs](./GAMIFICATION_ANALYTICS_API_DOCS.md)
- [Integration Guide](./GAMIFICATION_ANALYTICS_INTEGRATION.md)
- [Completion Report](./ANALYTICS_ROUTES_COMPLETION_REPORT.md)
- [Phase 3 Summary](./GAMIFICATION_PHASE_3_COMPLETION_SUMMARY.md)

---

## Quick Start

1. **Route is registered** - Already mounted in Express app
2. **Endpoints are live** - 11 analytics endpoints ready
3. **Service is ready** - analyticsService has 6 methods
4. **Documentation complete** - Full API docs available
5. **Frontend ready** - Create React components to consume endpoints

---

**Status:** ✅ Production Ready  
**Last Updated:** January 15, 2024  
**Next Step:** Build Frontend Components
