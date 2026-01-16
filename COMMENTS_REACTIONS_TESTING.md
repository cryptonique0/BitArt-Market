# Social Comments & Reactions - Testing Guide

## cURL Test Commands

### Create Comment

```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "nft-uuid",
    "content": "This is an amazing NFT!",
    "parentCommentId": null
  }'
```

### Get Comments

```bash
curl http://localhost:3001/api/comments/nft-uuid?limit=20&offset=0
```

### Update Comment

```bash
curl -X PUT http://localhost:3001/api/comments/comment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment text"}'
```

### Delete Comment

```bash
curl -X DELETE http://localhost:3001/api/comments/comment-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Reaction

```bash
curl -X POST http://localhost:3001/api/comments/reactions/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "nft-uuid",
    "emoji": "👍"
  }'
```

### Remove Reaction

```bash
curl -X DELETE http://localhost:3001/api/comments/reactions/remove/nft-uuid/👍 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Reactions

```bash
curl http://localhost:3001/api/comments/nft-uuid/reactions
```

### Flag Comment

```bash
curl -X POST http://localhost:3001/api/comments/comment-uuid/flag \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "spam",
    "description": "This is spam"
  }'
```

### Get Comment Stats

```bash
curl http://localhost:3001/api/comments/nft-uuid/stats
```

## Component Testing

### ReactionBar Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReactionBar from '../components/ReactionBar';

describe('ReactionBar', () => {
  it('should display reactions', () => {
    const reactions = {
      '👍': { count: 5, userIds: ['user1', 'user2'] },
      '❤️': { count: 3, userIds: ['user3'] }
    };

    render(
      <ReactionBar
        nftId="nft-123"
        reactions={reactions}
        userReactions={['👍']}
        totalReactions={8}
        onReactionAdd={jest.fn()}
        onReactionRemove={jest.fn()}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should add reaction on click', async () => {
    const onReactionAdd = jest.fn();
    render(
      <ReactionBar
        nftId="nft-123"
        reactions={{}}
        userReactions={[]}
        totalReactions={0}
        onReactionAdd={onReactionAdd}
        onReactionRemove={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('👍'));

    await waitFor(() => {
      expect(onReactionAdd).toHaveBeenCalledWith('👍');
    });
  });
});
```

### CommentsSection Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentsSection from '../components/CommentsSection';

describe('CommentsSection', () => {
  it('should render comments', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [
          {
            id: 'c1',
            username: 'john',
            content: 'Great NFT!',
            userId: 'user1',
            createdAt: new Date(),
            replyCount: 0,
            reactions: { totalReactions: 0, byEmoji: {}, userReactions: [] }
          }
        ]
      })
    });
    global.fetch = mockFetch;

    render(<CommentsSection nftId="nft-123" currentUserId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('Great NFT!')).toBeInTheDocument();
    });
  });

  it('should create comment', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comments: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ comments: [
          { id: 'c1', username: 'john', content: 'Test' }
        ]})
      });
    global.fetch = mockFetch;

    render(<CommentsSection nftId="nft-123" currentUserId="user1" />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('should handle reply', async () => {
    render(<CommentsSection nftId="nft-123" currentUserId="user1" />);

    // Click reply button
    fireEvent.click(screen.getAllByText('Reply')[0]);

    expect(screen.getByPlaceholderText('Write a reply...')).toBeInTheDocument();
  });
});
```

## Integration Tests

```typescript
describe('Comments Integration', () => {
  it('should complete full comment flow', async () => {
    // 1. Create comment
    const createRes = await fetch('/api/comments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nftId, content: 'Test' }),
    });
    const comment = await createRes.json();
    expect(comment.id).toBeDefined();

    // 2. Get comments
    const getRes = await fetch(`/api/comments/${nftId}`);
    const { comments } = await getRes.json();
    expect(comments).toHaveLength(1);

    // 3. Add reaction
    const reactionRes = await fetch('/api/comments/reactions/add', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nftId, emoji: '👍' }),
    });
    expect(reactionRes.ok).toBe(true);

    // 4. Get reactions
    const reactionsRes = await fetch(`/api/comments/${nftId}/reactions`);
    const reactions = await reactionsRes.json();
    expect(reactions.byEmoji['👍']).toBeDefined();

    // 5. Reply to comment
    const replyRes = await fetch('/api/comments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nftId,
        content: 'Great reply!',
        parentCommentId: comment.id,
      }),
    });
    expect(replyRes.ok).toBe(true);

    // 6. Update comment
    const updateRes = await fetch(`/api/comments/${comment.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: 'Updated!' }),
    });
    expect(updateRes.ok).toBe(true);

    // 7. Flag comment
    const flagRes = await fetch(`/api/comments/${comment.id}/flag`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: 'spam' }),
    });
    expect(flagRes.ok).toBe(true);
  });
});
```

## Manual Testing Checklist

### Comment Functionality

- [ ] Create comment on NFT
- [ ] Comment appears in list
- [ ] Reply to comment
- [ ] Reply appears indented
- [ ] Edit own comment
- [ ] Edited flag shows
- [ ] Delete own comment
- [ ] Comment removed from list
- [ ] Cannot edit/delete others' comments
- [ ] Pagination works (load more)

### Reaction Functionality

- [ ] Emoji picker opens
- [ ] Can select emoji
- [ ] Reaction appears with count
- [ ] Multiple users can react same emoji
- [ ] User reaction highlighted in blue
- [ ] Can remove own reaction
- [ ] Reaction count decrements
- [ ] All 12 emojis work

### Moderation

- [ ] Can flag comment
- [ ] Flag dialog appears
- [ ] Flag reason submitted
- [ ] Confirmation message shown
- [ ] Flagged comment visible in mod panel
- [ ] Moderator can review

### UI/UX

- [ ] Comments load smoothly
- [ ] Animations work
- [ ] Dark mode styling correct
- [ ] Mobile responsive
- [ ] Touch interactions work
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success messages show

### Notifications

- [ ] Notification sent on reply
- [ ] Notification shown in center
- [ ] Mark as read works
- [ ] Unread count updates

## Performance Testing

```bash
# Test with many comments
ab -n 100 -c 10 http://localhost:3001/api/comments/nft-uuid?limit=20

# Expected: <300ms response time
```

## Database Verification

```sql
-- Verify tables created
SELECT * FROM information_schema.tables
WHERE table_name IN ('comments', 'reactions', 'flagged_comments');

-- Verify indexes
SELECT * FROM pg_stat_user_indexes
WHERE relname IN ('comments', 'reactions');

-- Verify triggers
SELECT * FROM information_schema.triggers
WHERE trigger_name LIKE 'comment%';

-- Verify RLS policies
SELECT * FROM pg_policies
WHERE tablename IN ('comments', 'reactions');
```

## Expected Response Times

- GET comments: <200ms
- POST comment: <300ms
- GET reactions: <100ms
- POST reaction: <150ms
- POST flag: <200ms

## Load Testing

```bash
# Simulate 100 concurrent users
wrk -t4 -c100 -d30s http://localhost:3001/api/comments/nft-uuid

# Expected:
# - Avg response: <200ms
# - Max response: <1000ms
# - Error rate: 0%
```

## Common Test Issues

### Comments Not Loading

- Check API server running on port 3001
- Verify nft-uuid is valid
- Check browser console for errors
- Verify JWT token if testing auth endpoints

### Reactions Not Saving

- Check emoji is valid
- Verify unique constraint not violated
- Check Supabase connection
- Review server error logs

### Notifications Not Appearing

- Check comment_notifications table created
- Verify trigger exists
- Check user_id in token matches recipient
