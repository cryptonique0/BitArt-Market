# User Following System - Quick Reference

## What's New

### Files Created

```
Backend:
  ✅ /backend/src/types/following.ts
  ✅ /backend/src/services/following.service.ts
  ✅ /backend/src/routes/follows.ts (migrated to new service)
  ✅ database-migration-following-system.sql

Frontend:
  ✅ /frontend/src/components/FollowButton.tsx
  ✅ /frontend/src/components/FollowersList.tsx
  ✅ /frontend/src/components/FollowingList.tsx
  ✅ /frontend/src/components/FollowNotifications.tsx

Documentation:
  ✅ FOLLOWING_SYSTEM_INTEGRATION.md
```

## Core API Endpoints

| Method | Endpoint                                          | Auth | Description                  |
| ------ | ------------------------------------------------- | ---- | ---------------------------- |
| POST   | `/api/follows`                                    | ✅   | Follow a user                |
| DELETE | `/api/follows/:followingId`                       | ✅   | Unfollow a user              |
| GET    | `/api/follows/status/:followingId`                | ✅   | Check if following           |
| GET    | `/api/follows/followers/:userId`                  | ❌   | Get follower list            |
| GET    | `/api/follows/following/:userId`                  | ❌   | Get following list           |
| GET    | `/api/follows/stats/:userId`                      | ❌   | Get follower stats           |
| GET    | `/api/follows/popular`                            | ❌   | Get popular creators         |
| GET    | `/api/follows/recommendations/:userId`            | ✅   | Get recommendations          |
| GET    | `/api/follows/notifications/:userId`              | ❌   | Get notifications            |
| PUT    | `/api/follows/notifications/:notificationId/read` | ❌   | Mark as read                 |
| POST   | `/api/follows/notify-followers`                   | ✅   | Notify followers on NFT drop |

## Key Features

### Follow Management

```typescript
// Follow a user
POST /api/follows
{ "followingId": "uuid" }

// Unfollow a user
DELETE /api/follows/:followingId

// Check follow status
GET /api/follows/status/:followingId
// Response: { "isFollowing": true|false }
```

### Discovery

```typescript
// Get popular creators
GET /api/follows/popular?limit=20
// Response: { creators: PopularCreators[], count: number }

// Get recommendations
GET /api/follows/recommendations/:userId?limit=10
// Response: { recommendations: FollowRecommendation[], count: number }
```

### Statistics

```typescript
// Get follow stats
GET /api/follows/stats/:userId
// Response: { followerCount: number, followingCount: number }

// Get follower list
GET /api/follows/followers/:userId?limit=20&offset=0
// Response: { followers: FollowerProfile[], count: number }

// Get following list
GET /api/follows/following/:userId?limit=20&offset=0
// Response: { following: FollowingProfile[], count: number }
```

### Notifications

```typescript
// Get notifications
GET /api/follows/notifications/:userId?limit=20
// Response: { notifications: FollowNotification[], count: number }

// Mark notification as read
PUT /api/follows/notifications/:notificationId/read
// Response: { success: boolean }

// Notify followers on NFT drop
POST /api/follows/notify-followers
{ "nftId": "uuid", "nftTitle": "NFT Name" }
// Response: { success: true }
```

## React Component Usage

### FollowButton

```typescript
<FollowButton
  userId="creator-id"
  creatorUsername="john_doe"
  onFollowChange={(isFollowing) => console.log(isFollowing)}
/>
```

### FollowersList

```typescript
<FollowersList
  userId="creator-id"
  limit={20}
/>
```

### FollowingList

```typescript
<FollowingList
  userId="user-id"
  limit={20}
/>
```

### FollowNotifications

```typescript
<FollowNotifications
  userId="user-id"
  limit={10}
  onNotificationClick={(notification) => {
    if (notification.actionUrl) navigate(notification.actionUrl);
  }}
/>
```

## Database Tables

### user_follows

```sql
- id (UUID, PK)
- follower_id (UUID, FK to users)
- following_id (UUID, FK to users)
- created_at
- updated_at
- Constraint: no_self_follow
- Unique: (follower_id, following_id)
```

### follow_notifications

```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- actor_id (UUID, FK to users)
- type (follow | nft_drop | new_collection)
- title (string)
- message (text)
- nft_id (UUID, FK to nfts)
- action_url (string)
- read (boolean)
- created_at
- updated_at
```

## Service Methods

### FollowingService

```typescript
// Follow operations
followUser(followerId, followingId): Promise<UserFollow>
unfollowUser(followerId, followingId): Promise<boolean>
isFollowing(followerId, followingId): Promise<boolean>

// List operations
getFollowers(userId, limit, offset): Promise<FollowerProfile[]>
getFollowing(userId, limit, offset): Promise<FollowingProfile[]>

// Stats
getFollowStats(userId): Promise<UserFollowStats>
getPopularCreators(limit): Promise<PopularCreators[]>
getFollowRecommendations(userId, limit): Promise<FollowRecommendation[]>

// Notifications
notifyFollowersAboutDrop(creatorId, nftId, nftTitle): Promise<void>
getFollowNotifications(userId, limit): Promise<FollowNotification[]>
markNotificationAsRead(notificationId): Promise<boolean>
```

## Integration Checklist

- [ ] Run database migration: `database-migration-following-system.sql`
- [ ] Import FollowingService in API routes (already done in follows.ts)
- [ ] Mount /api/follows routes in main server file (if not already mounted)
- [ ] Import components in UI pages (FollowButton, FollowersList, etc.)
- [ ] Test follow/unfollow functionality
- [ ] Test follower list display
- [ ] Test notifications on NFT drop
- [ ] Verify authentication on protected endpoints
- [ ] Test pagination with limit/offset params
- [ ] Verify dark mode styling works

## Response Type Examples

### FollowNotification

```typescript
{
  id: "uuid",
  type: "nft_drop",
  actorId: "creator-uuid",
  actorUsername: "john_doe",
  title: "New NFT Drop",
  message: "john_doe dropped a new NFT",
  nftId: "nft-uuid",
  createdAt: "2024-01-15T10:30:00Z",
  read: false,
  actionUrl: "/nft/nft-uuid"
}
```

### UserFollowStats

```typescript
{
  userId: "uuid",
  followerCount: 150,
  followingCount: 45
}
```

### PopularCreators

```typescript
{
  userId: "uuid",
  username: "john_doe",
  followerCount: 5000,
  totalXP: 15000,
  creatorScore: 92.5
}
```

### FollowRecommendation

```typescript
{
  userId: "uuid",
  username: "jane_artist",
  reason: "Similar achievement interests",
  commonAchievements: 8,
  followerCount: 1200,
  isCreator: true
}
```

## Common Use Cases

### Display Creator Profile with Follow Button

```typescript
import FollowButton from './components/FollowButton';
import FollowersList from './components/FollowersList';

<div className="creator-profile">
  <h1>{creator.username}</h1>
  <FollowButton userId={creator.id} creatorUsername={creator.username} />
  <FollowersList userId={creator.id} limit={5} />
</div>
```

### Show User's Following List

```typescript
import FollowingList from './components/FollowingList';

<FollowingList userId={currentUser.id} limit={10} />
```

### Display Notifications Center

```typescript
import FollowNotifications from './components/FollowNotifications';

<FollowNotifications
  userId={currentUser.id}
  onNotificationClick={(notif) => navigate(notif.actionUrl)}
/>
```

### Notify Followers on NFT Drop

```typescript
const response = await fetch('/api/follows/notify-followers', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nftId: newNFT.id,
    nftTitle: newNFT.title,
  }),
});
```

## Migration from Old System

Old endpoint: `POST /api/follows/:creator` → New: `POST /api/follows`
Old param: `follower, following` (addresses) → New: `followingId` (UUID)
Old system: Simple address-based → New: User UUID-based with full profiles

## Error Codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 400  | Missing required parameters or invalid data     |
| 401  | Authentication required (missing/invalid token) |
| 500  | Server error (database, configuration)          |

## Next Steps

1. ✅ Backend types and service created
2. ✅ API routes migrated and updated
3. ✅ Frontend components created
4. ✅ Database schema defined
5. 🔄 Apply database migration to Supabase
6. 🔄 Integrate components into UI pages
7. 🔄 Test full flow (follow → notification → view)
8. 🔄 Add WebSocket support for real-time notifications (future)

## Performance Tips

- Use pagination (limit/offset) for large lists
- Cache popular creators list (rarely changes)
- Load notifications async to not block UI
- Debounce follow/unfollow buttons
- Use optimistic updates in UI before API response

## Security Notes

- JWT authentication required for follow operations
- RLS policies enforce user data privacy
- No self-follow constraint at database level
- User can only see their own notifications
- Rate limiting recommended on follow endpoints (future)
