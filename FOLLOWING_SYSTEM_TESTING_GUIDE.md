# User Following System - Testing Guide

## Quick Test Commands

### Using cURL or Postman

#### 1. Follow a User

```bash
curl -X POST http://localhost:3001/api/follows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followingId": "target-user-uuid"}'

# Expected Response (201):
{
  "id": "follow-id",
  "followerId": "your-id",
  "followingId": "target-user-uuid",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### 2. Check Follow Status

```bash
curl -X GET http://localhost:3001/api/follows/status/target-user-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200):
{ "isFollowing": true }
```

#### 3. Get Follower List

```bash
curl -X GET "http://localhost:3001/api/follows/followers/user-uuid?limit=20&offset=0"

# Expected Response (200):
{
  "followers": [
    {
      "userId": "follower-uuid",
      "username": "john_doe",
      "avatar": "...",
      "totalAchievements": 5,
      "currentLevel": 3,
      "followedAt": "2024-01-10T10:30:00Z",
      "isCreator": false
    }
  ],
  "count": 1
}
```

#### 4. Get Following List

```bash
curl -X GET "http://localhost:3001/api/follows/following/user-uuid?limit=20&offset=0"

# Expected Response (200):
{
  "following": [
    {
      "userId": "creator-uuid",
      "username": "jane_artist",
      "avatar": "...",
      "isCreator": true,
      "creatorStats": {
        "followers": 1200,
        "nftsCreated": 45,
        "floorPrice": 0.5
      },
      "followedAt": "2024-01-12T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### 5. Get Follow Statistics

```bash
curl -X GET http://localhost:3001/api/follows/stats/user-uuid

# Expected Response (200):
{
  "userId": "user-uuid",
  "followerCount": 150,
  "followingCount": 45
}
```

#### 6. Get Popular Creators

```bash
curl -X GET "http://localhost:3001/api/follows/popular?limit=20"

# Expected Response (200):
{
  "creators": [
    {
      "userId": "creator-uuid",
      "username": "top_artist",
      "followerCount": 5000,
      "totalXP": 15000,
      "creatorScore": 92.5
    }
  ],
  "count": 1
}
```

#### 7. Get Notifications

```bash
curl -X GET "http://localhost:3001/api/follows/notifications/user-uuid?limit=20"

# Expected Response (200):
{
  "notifications": [
    {
      "id": "notification-uuid",
      "type": "nft_drop",
      "actorId": "creator-uuid",
      "actorUsername": "jane_artist",
      "title": "New NFT Drop",
      "message": "jane_artist dropped a new NFT: Cool NFT",
      "nftId": "nft-uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "read": false,
      "actionUrl": "/nft/nft-uuid"
    }
  ],
  "count": 1
}
```

#### 8. Mark Notification as Read

```bash
curl -X PUT http://localhost:3001/api/follows/notifications/notification-uuid/read

# Expected Response (200):
{ "success": true }
```

#### 9. Unfollow a User

```bash
curl -X DELETE http://localhost:3001/api/follows/target-user-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200):
{ "success": true }
```

#### 10. Get Recommendations

```bash
curl -X GET "http://localhost:3001/api/follows/recommendations/user-uuid?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200):
{
  "recommendations": [
    {
      "userId": "recommended-uuid",
      "username": "another_artist",
      "reason": "Similar achievement interests",
      "commonAchievements": 8,
      "followerCount": 1200,
      "isCreator": true
    }
  ],
  "count": 1
}
```

## React Component Testing

### FollowButton Component Test

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FollowButton from '../components/FollowButton';

describe('FollowButton', () => {
  it('should render follow button', () => {
    render(
      <FollowButton
        userId="user-123"
        creatorUsername="john_doe"
      />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call API when follow button clicked', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'follow-123' })
    });
    global.fetch = mockFetch;

    render(
      <FollowButton
        userId="user-123"
        creatorUsername="john_doe"
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/follows', expect.any(Object));
    });
  });

  it('should show loading state', async () => {
    const mockFetch = jest.fn(() => new Promise(() => {})); // Never resolves
    global.fetch = mockFetch;

    render(
      <FollowButton
        userId="user-123"
        creatorUsername="john_doe"
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('should call onFollowChange callback', async () => {
    const mockCallback = jest.fn();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'follow-123' })
    });
    global.fetch = mockFetch;

    render(
      <FollowButton
        userId="user-123"
        creatorUsername="john_doe"
        onFollowChange={mockCallback}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(true);
    });
  });
});
```

### FollowersList Component Test

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FollowersList from '../components/FollowersList';

describe('FollowersList', () => {
  it('should render followers list', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        followers: [
          {
            userId: 'user-1',
            username: 'john_doe',
            totalAchievements: 5,
            currentLevel: 3,
            followedAt: new Date(),
            isCreator: false
          }
        ]
      })
    });
    global.fetch = mockFetch;

    render(<FollowersList userId="creator-123" />);

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
    });
  });

  it('should show empty state when no followers', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ followers: [] })
    });
    global.fetch = mockFetch;

    render(<FollowersList userId="creator-123" />);

    await waitFor(() => {
      expect(screen.getByText(/no followers/i)).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        followers: Array(20).fill({ userId: 'user', username: 'test' })
      })
    });
    global.fetch = mockFetch;

    render(<FollowersList userId="creator-123" limit={20} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
    });
  });
});
```

### FollowNotifications Component Test

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FollowNotifications from '../components/FollowNotifications';

describe('FollowNotifications', () => {
  it('should render notifications', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [
          {
            id: 'notif-1',
            type: 'nft_drop',
            actorUsername: 'jane_artist',
            title: 'New NFT Drop',
            message: 'jane_artist dropped a new NFT',
            createdAt: new Date(),
            read: false,
            actionUrl: '/nft/123'
          }
        ]
      })
    });
    global.fetch = mockFetch;

    render(<FollowNotifications userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('New NFT Drop')).toBeInTheDocument();
    });
  });

  it('should show unread count', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [
          {
            id: 'notif-1',
            type: 'follow',
            actorUsername: 'john_doe',
            title: 'New Follower',
            message: 'john_doe started following you',
            createdAt: new Date(),
            read: false
          },
          {
            id: 'notif-2',
            type: 'follow',
            actorUsername: 'jane_artist',
            title: 'New Follower',
            message: 'jane_artist started following you',
            createdAt: new Date(),
            read: false
          }
        ]
      })
    });
    global.fetch = mockFetch;

    render(<FollowNotifications userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
    });
  });

  it('should mark notification as read', async () => {
    const mockGetFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [
          {
            id: 'notif-1',
            type: 'nft_drop',
            actorUsername: 'jane_artist',
            title: 'New NFT Drop',
            message: 'jane_artist dropped a new NFT',
            createdAt: new Date(),
            read: false,
            actionUrl: '/nft/123'
          }
        ]
      })
    });

    const mockPutFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    global.fetch = jest.fn((url) => {
      if (url.includes('PUT')) return mockPutFetch();
      return mockGetFetch();
    });

    render(<FollowNotifications userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('New NFT Drop')).toBeInTheDocument();
    });

    const notification = screen.getByText('New NFT Drop').closest('div');
    fireEvent.click(notification!);

    await waitFor(() => {
      expect(mockPutFetch).toHaveBeenCalled();
    });
  });

  it('should call onNotificationClick callback', async () => {
    const mockCallback = jest.fn();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [
          {
            id: 'notif-1',
            type: 'nft_drop',
            actorUsername: 'jane_artist',
            title: 'New NFT Drop',
            message: 'jane_artist dropped a new NFT',
            createdAt: new Date(),
            read: false,
            actionUrl: '/nft/123'
          }
        ]
      })
    });
    global.fetch = mockFetch;

    render(
      <FollowNotifications
        userId="user-123"
        onNotificationClick={mockCallback}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('New NFT Drop')).toBeInTheDocument();
    });

    const notification = screen.getByText('New NFT Drop').closest('div');
    fireEvent.click(notification!);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it('should auto-refresh every 30 seconds', async () => {
    jest.useFakeTimers();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [] })
    });
    global.fetch = mockFetch;

    render(<FollowNotifications userId="user-123" />);

    expect(mockFetch).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(30000);

    expect(mockFetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
```

## Integration Test Example

```typescript
describe('User Following Flow', () => {
  it('should complete full follow flow', async () => {
    // 1. User A follows User B
    const followResponse = await fetch('/api/follows', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ followingId: userBId })
    });
    expect(followResponse.status).toBe(201);
    const follow = await followResponse.json();
    expect(follow.followerId).toBe(userAId);

    // 2. Check follow status
    const statusResponse = await fetch(`/api/follows/status/${userBId}`, {
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    const status = await statusResponse.json();
    expect(status.isFollowing).toBe(true);

    // 3. Verify User A appears in User B's followers
    const followersResponse = await fetch(`/api/follows/followers/${userBId}`);
    const followers = await followersResponse.json();
    expect(followers.followers.some(f => f.userId === userAId)).toBe(true);

    // 4. User B drops an NFT
    const nftResponse = await fetch('/api/nfts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userBToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'New NFT', ... })
    });
    const nft = await nftResponse.json();

    // 5. Verify notification sent to User A
    const notificationsResponse = await fetch(`/api/follows/notifications/${userAId}`);
    const notifications = await notificationsResponse.json();
    expect(notifications.notifications.some(n =>
      n.type === 'nft_drop' && n.actorId === userBId && n.nftId === nft.id
    )).toBe(true);

    // 6. User A unfollow User B
    const unfollowResponse = await fetch(`/api/follows/${userBId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    expect(unfollowResponse.status).toBe(200);

    // 7. Verify follow removed
    const statusResponse2 = await fetch(`/api/follows/status/${userBId}`, {
      headers: { 'Authorization': `Bearer ${userAToken}` }
    });
    const status2 = await statusResponse2.json();
    expect(status2.isFollowing).toBe(false);
  });
});
```

## Manual Testing Checklist

### Before Starting

- [ ] Set up test users in Supabase
- [ ] Copy JWT tokens from authentication
- [ ] Start backend server (npm start)
- [ ] Start frontend dev server (npm run dev)
- [ ] Open browser console for debugging

### Follow Functionality

- [ ] Follow button appears on creator profile
- [ ] Clicking follow shows loading state
- [ ] Follow button changes to "Following" after success
- [ ] "Following" badge shows on creator profile
- [ ] Can unfollow by clicking button again
- [ ] Unfollow removes "Following" badge
- [ ] Cannot follow yourself
- [ ] Follower count increments/decrements correctly

### Follower/Following Lists

- [ ] Follower list loads on creator profile
- [ ] Following list loads on user dashboard
- [ ] Lists show correct profiles
- [ ] Lists paginate correctly (limit/offset)
- [ ] User levels and achievements display
- [ ] Creator badges show in following list
- [ ] Empty states show when no followers/following

### Notifications

- [ ] Notifications appear for new followers
- [ ] NFT drop notifications sent to followers
- [ ] Notification count shows unread count
- [ ] Marking notification as read updates count
- [ ] Notifications auto-refresh every 30 seconds
- [ ] Clicking notification link navigates correctly
- [ ] Dismiss button removes notification from list

### Popular/Recommendations

- [ ] Popular creators list loads
- [ ] Sorted by follower count and XP
- [ ] Recommendations show similar creators
- [ ] Can follow from recommendation list

### Dark Mode

- [ ] All components look good in dark mode
- [ ] Colors are readable in dark mode
- [ ] Icons display correctly
- [ ] Animations smooth in dark mode

### Mobile Responsiveness

- [ ] Components stack on mobile
- [ ] Touch interactions work
- [ ] Text is readable on small screens
- [ ] Buttons are easy to tap

### Error Handling

- [ ] Handle missing user ID
- [ ] Handle API errors gracefully
- [ ] Show error messages to user
- [ ] Component recovery after error

## Performance Testing

### Load Testing

```bash
# Test with multiple concurrent requests
ab -n 100 -c 10 http://localhost:3001/api/follows/popular

# Expected: <200ms response time, 0% failures
```

### Database Query Performance

```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM user_follows WHERE following_id = 'user-uuid';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

## Cleanup & Teardown

```typescript
// After tests, clean up test data
async function cleanupTestData() {
  // Delete test follows
  await supabase
    .from('user_follows')
    .delete()
    .in('follower_id', [testUserId1, testUserId2])
    .in('following_id', [testUserId1, testUserId2]);

  // Delete test notifications
  await supabase.from('follow_notifications').delete().in('user_id', [testUserId1, testUserId2]);
}
```

## Debugging Tips

### Common Issues

**Issue: "Cannot read properties of undefined" when fetching**

- Solution: Verify Supabase connection, check token validity

**Issue: Follow button not working**

- Solution: Check browser console for errors, verify JWT token in localStorage

**Issue: Notifications not appearing**

- Solution: Check database migration applied, verify trigger created

**Issue: API returns 401 Unauthorized**

- Solution: Refresh token, check Authorization header format

### Debug Commands

```bash
# Check database tables exist
psql -c "SELECT * FROM information_schema.tables WHERE table_schema = 'public';"

# Check indexes
psql -c "SELECT * FROM pg_stat_user_indexes;"

# Check RLS policies
psql -c "SELECT * FROM pg_policies WHERE schemaname = 'public';"
```

---

**Last Updated:** January 2026
**Test Coverage:** Comprehensive (Components, API, Integration)
**Status:** Ready for production testing
