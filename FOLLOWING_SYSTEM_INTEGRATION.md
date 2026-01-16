# User Following System - Integration Guide

## Overview

The User Following System enables users to follow creators and collectors, receive notifications about new NFT drops, and discover creators based on achievements and activity.

## Components Implemented

### Backend Components

#### 1. Type Definitions (`/backend/src/types/following.ts`)

```typescript
- UserFollow: Follow relationship between users
- UserFollowStats: Follower/following counts
- FollowerProfile: User info for followers list
- FollowingProfile: User info for following list
- FollowNotification: Follow-related notifications
- FollowingNotificationPreferences: User notification settings
- PopularCreators: Top creators by followers/XP
- FollowRecommendation: Suggested users to follow
```

#### 2. FollowingService (`/backend/src/services/following.service.ts`)

**Core Methods:**

- `followUser(followerId, followingId)` - Create follow relationship
- `unfollowUser(followerId, followingId)` - Remove follow relationship
- `isFollowing(followerId, followingId)` - Check follow status
- `getFollowers(userId, limit, offset)` - Get follower list with pagination
- `getFollowing(userId, limit, offset)` - Get following list with pagination
- `getFollowStats(userId)` - Get follower/following counts
- `getPopularCreators(limit)` - Get top creators by followers
- `getFollowRecommendations(userId, limit)` - Get suggested creators
- `notifyFollowersAboutDrop(creatorId, nftId, nftTitle)` - Notify followers on NFT drop
- `getFollowNotifications(userId, limit)` - Get user notifications
- `markNotificationAsRead(notificationId)` - Mark notification as read

**Safety Features:**

- All methods check `isSupabaseAvailable()` before database operations
- Graceful error handling with console logging
- Returns empty arrays/false on database errors

#### 3. API Routes (`/backend/src/routes/follows.ts`)

**Endpoints:**

```
POST   /api/follows                           - Follow a user (requires auth)
DELETE /api/follows/:followingId              - Unfollow a user (requires auth)
GET    /api/follows/status/:followingId       - Check follow status (requires auth)
GET    /api/follows/followers/:userId         - Get follower list
GET    /api/follows/following/:userId         - Get following list
GET    /api/follows/stats/:userId             - Get follow statistics
GET    /api/follows/popular                   - Get popular creators
GET    /api/follows/recommendations/:userId   - Get recommendations (requires auth)
GET    /api/follows/notifications/:userId     - Get notifications
PUT    /api/follows/notifications/:notificationId/read - Mark as read
POST   /api/follows/notify-followers          - Notify followers (requires auth)
```

### Frontend Components

#### 1. FollowButton (`/frontend/src/components/FollowButton.tsx`)

**Features:**

- Toggle follow/unfollow with smooth animations
- Shows loading state during API calls
- Displays follower count
- Dark mode support
- Optimistic UI updates

**Props:**

```typescript
interface FollowButtonProps {
  userId: string;
  creatorUsername: string;
  onFollowChange?: (isFollowing: boolean) => void;
}
```

#### 2. FollowersList (`/frontend/src/components/FollowersList.tsx`)

**Features:**

- Displays list of users following the creator
- Shows user level and achievement count
- Pagination support
- Smooth animations
- Mobile responsive

**Props:**

```typescript
interface FollowersListProps {
  userId: string;
  limit?: number;
}
```

#### 3. FollowingList (`/frontend/src/components/FollowingList.tsx`)

**Features:**

- Shows users the current user is following
- Displays creator stats (NFTs, followers)
- One-click unfollow button
- Creator badge indicator
- Mobile responsive

**Props:**

```typescript
interface FollowingListProps {
  userId: string;
  limit?: number;
}
```

#### 4. FollowNotifications (`/frontend/src/components/FollowNotifications.tsx`)

**Features:**

- Real-time notification display
- Unread notification counter
- Mark as read functionality
- Auto-refresh every 30 seconds
- Type-based styling (follow, nft_drop, new_collection)
- Dismiss notifications
- Action links for notifications

**Props:**

```typescript
interface FollowNotificationsProps {
  userId: string;
  limit?: number;
  onNotificationClick?: (notification: FollowNotification) => void;
}
```

### Database Schema

#### Tables Created

1. **user_follows**
   - Stores follow relationships between users
   - Enforces no self-follow rule
   - Unique constraint on (follower_id, following_id)

2. **follow_notifications**
   - Stores notifications for users
   - Supports multiple notification types: follow, nft_drop, new_collection
   - Read/unread status tracking

#### Views Created

- **follower_stats**: Aggregated follower/following counts per user

#### Triggers Created

- **nft_drop_notification_trigger**: Auto-notifies followers when creator drops NFT

## Integration Steps

### 1. Database Setup

```bash
# Apply the migration
psql -U postgres -h localhost < database-migration-following-system.sql

# Or use Supabase dashboard:
# 1. Go to SQL Editor
# 2. Paste content of database-migration-following-system.sql
# 3. Run query
```

### 2. Backend Integration

```typescript
// In main server file (e.g., index.ts)
import followsRouter from './routes/follows';

app.use('/api/follows', followsRouter);
```

### 3. Frontend Integration

#### Add to Creator Profile Page

```typescript
import FollowButton from './components/FollowButton';
import FollowersList from './components/FollowersList';

function CreatorProfile({ userId }) {
  return (
    <div>
      <FollowButton
        userId={userId}
        creatorUsername={username}
        onFollowChange={(isFollowing) => {
          // Update UI based on follow status
        }}
      />
      <FollowersList userId={userId} limit={10} />
    </div>
  );
}
```

#### Add to User Dashboard

```typescript
import FollowingList from './components/FollowingList';
import FollowNotifications from './components/FollowNotifications';

function UserDashboard({ userId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FollowingList userId={userId} limit={20} />
      <FollowNotifications userId={userId} limit={10} />
    </div>
  );
}
```

#### Add to Notification Center

```typescript
import FollowNotifications from './components/FollowNotifications';

function NotificationCenter({ userId }) {
  return (
    <FollowNotifications
      userId={userId}
      limit={20}
      onNotificationClick={(notification) => {
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
      }}
    />
  );
}
```

## Features

### Core Features

- ✅ Follow/unfollow users
- ✅ View follower and following lists
- ✅ Get follower statistics
- ✅ Discover popular creators
- ✅ Get personalized follow recommendations
- ✅ Automatic notifications on NFT drops
- ✅ Manual notifications for new releases
- ✅ Read/unread notification tracking

### Advanced Features

- ✅ Creator badge system
- ✅ Level and achievement display
- ✅ NFT creation count tracking
- ✅ Follower growth statistics
- ✅ Real-time notification polling
- ✅ Recommendation algorithm (similar achievements)

## Configuration

### Environment Variables

No additional environment variables required. Uses existing Supabase configuration.

### Authentication

- All POST/DELETE/UPDATE operations require JWT authentication via `requireAppJWT` middleware
- GET operations are publicly accessible (except recommendations)
- Recommendations require authentication to personalize

## Error Handling

### Service-Level

- All Supabase operations wrapped in try-catch
- `isSupabaseAvailable()` check prevents crashes when database is unavailable
- Returns sensible defaults on errors

### API-Level

- HTTP 400: Bad request (missing parameters)
- HTTP 401: Unauthorized (missing authentication token)
- HTTP 500: Server error (database errors)

### Frontend-Level

- Loading states prevent user interaction during API calls
- Error messages displayed to users
- Graceful fallbacks for failed requests

## Performance Optimization

### Database Indexes

- Indexes on follower_id and following_id for fast lookups
- Indexes on created_at for chronological queries
- Indexes on read status for notification queries

### API Optimization

- Pagination support (limit max 100 results)
- Offset-based pagination for large datasets
- Response includes result count for UI pagination

### Frontend Optimization

- Component-level memoization for FollowButton
- Efficient re-render logic in FollowingList
- 30-second polling interval for notifications (configurable)

## Security

### RLS (Row Level Security)

- Users can only see their own notifications
- Users can only create/delete their own follows
- Admin override capability through service role

### Input Validation

- Required fields checked at API level
- No self-follow allowed
- Duplicate follow prevention via database constraint

## Testing Recommendations

### Unit Tests

```typescript
describe('FollowingService', () => {
  it('should follow a user', async () => {
    const follow = await followingService.followUser('user1', 'user2');
    expect(follow.followerId).toBe('user1');
  });

  it('should prevent self-follow', async () => {
    expect(async () => {
      await followingService.followUser('user1', 'user1');
    }).toThrow();
  });
});
```

### Integration Tests

```typescript
describe('Follow API', () => {
  it('should create follow relationship', async () => {
    const res = await request(app)
      .post('/api/follows')
      .set('Authorization', `Bearer ${token}`)
      .send({ followingId: 'user2' });
    expect(res.status).toBe(201);
  });
});
```

### E2E Tests

```typescript
describe('Following Flow', () => {
  it('should follow user and receive notification', async () => {
    // 1. Follow user
    // 2. User drops NFT
    // 3. Verify notification received
  });
});
```

## Future Enhancements

1. **WebSocket Support**: Real-time notifications without polling
2. **Follow Recommendations**: ML-based recommendations
3. **Follower Growth Analytics**: Track follower trends
4. **Follow Goals**: Set and track follower milestones
5. **VIP Followers**: Special follower tiers with benefits
6. **Social Feed**: Show activity from followed creators
7. **Follower Lists Export**: Download follower data
8. **Follow Analytics Dashboard**: Detailed follower insights

## Troubleshooting

### Notifications Not Appearing

1. Check database migration was applied successfully
2. Verify user IDs are correct UUIDs
3. Check Supabase connection in server logs
4. Ensure notifications endpoint returns data

### Follow Button Not Working

1. Verify JWT token in localStorage
2. Check browser console for API errors
3. Ensure backend is running and routes mounted
4. Verify CORS configuration

### Follower List Empty

1. Check that users actually exist in database
2. Verify follow relationships created
3. Check pagination offset isn't beyond data
4. Ensure RLS policies allow read access

## Support

For issues or questions, refer to backend logs and browser console for error details.
