# Social Comments & Reactions - Quick Reference

## API Endpoints

### Comments

| Method | Endpoint                        | Auth | Description    |
| ------ | ------------------------------- | ---- | -------------- |
| POST   | `/api/comments`                 | ✅   | Create comment |
| GET    | `/api/comments/:nftId`          | ❌   | Get comments   |
| PUT    | `/api/comments/:commentId`      | ✅   | Update comment |
| DELETE | `/api/comments/:commentId`      | ✅   | Delete comment |
| POST   | `/api/comments/:commentId/flag` | ✅   | Flag comment   |
| GET    | `/api/comments/:nftId/stats`    | ❌   | Get stats      |

### Reactions

| Method | Endpoint                                       | Auth | Description     |
| ------ | ---------------------------------------------- | ---- | --------------- |
| POST   | `/api/comments/reactions/add`                  | ✅   | Add reaction    |
| DELETE | `/api/comments/reactions/remove/:nftId/:emoji` | ✅   | Remove reaction |
| GET    | `/api/comments/:nftId/reactions`               | ❌   | Get reactions   |

## Component Usage

### ReactionBar

```typescript
<ReactionBar
  nftId="nft-uuid"
  onReactionAdd={async (emoji) => { /* API call */ }}
  onReactionRemove={async (emoji) => { /* API call */ }}
  reactions={reactionsData}
  userReactions={userEmojis}
  totalReactions={count}
/>
```

### CommentsSection

```typescript
<CommentsSection
  nftId="nft-uuid"
  currentUserId="user-uuid"
  onCommentAdded={() => { /* Refresh */ }}
/>
```

## Request/Response Examples

### Create Comment

```bash
POST /api/comments
{
  "nftId": "uuid",
  "content": "Great NFT!",
  "parentCommentId": "uuid" // optional for replies
}
```

### Add Reaction

```bash
POST /api/comments/reactions/add
{
  "nftId": "uuid",
  "emoji": "👍"
}
```

### Get Comments

```bash
GET /api/comments/uuid?limit=20&offset=0

{
  "nftId": "uuid",
  "comments": [
    {
      "id": "uuid",
      "userId": "uuid",
      "username": "john",
      "content": "Great!",
      "replyCount": 2,
      "reactions": { /* summary */ },
      "replies": [ /* nested replies */ ]
    }
  ],
  "totalCount": 15,
  "hasMore": false,
  "pageInfo": { "page": 1, "pageSize": 20, "totalPages": 1 }
}
```

## Emoji Reactions

```
👍 Like
❤️ Heart
🔥 Fire
🤯 Amazing
😂 Laugh
😢 Sad
😠 Angry
🤔 Thinking
🌙 Moon
💎 Diamond
🚀 Rocket
👏 Clap
```

## Database Tables

### comments

- id, nft_id, user_id, username, avatar
- content (text)
- parent_comment_id (for threading)
- reply_count, reaction_count
- is_edited, is_pinned
- deleted_at (soft delete)
- created_at, updated_at

### reactions

- id, nft_id, user_id, username, avatar
- emoji
- created_at, updated_at
- Unique: (user_id, nft_id, emoji)

### flagged_comments

- id, comment_id, user_id
- reason (spam, hate, harassment, misinformation, other)
- description, status
- reviewed_by, reviewed_at, action
- flagged_at

### comment_notifications

- id, user_id, related_user_id
- type (comment_reply, comment_reaction, etc.)
- comment_id, nft_id
- message, read
- created_at

## Integration Checklist

- [ ] Run database migration
- [ ] Mount routes in Express app
- [ ] Import components in NFT pages
- [ ] Add ReactionBar to NFT detail
- [ ] Add CommentsSection to NFT detail
- [ ] Test create comment
- [ ] Test reply to comment
- [ ] Test add/remove reactions
- [ ] Test flag comment
- [ ] Test comment notifications
- [ ] Verify dark mode styling
- [ ] Test on mobile

## Common Use Cases

### Display Comments on NFT Detail Page

```typescript
<CommentsSection
  nftId={nft.id}
  currentUserId={user.id}
  onCommentAdded={() => {
    // Refresh stats or update counters
  }}
/>
```

### Show Reactions Below NFT Title

```typescript
const { reactions } = await fetch(`/api/comments/${nftId}/reactions`).then(r => r.json())

<ReactionBar
  nftId={nftId}
  reactions={reactions.byEmoji}
  userReactions={reactions.userReactions}
  totalReactions={reactions.totalReactions}
/>
```

### Handle Comment Creation

```typescript
const response = await fetch('/api/comments', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nftId,
    content: 'My comment',
    parentCommentId: parentId, // optional
  }),
});
```

## Error Codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 400  | Bad request (missing params, validation failed) |
| 401  | Unauthorized (missing/invalid token)            |
| 500  | Server error (database, configuration)          |

## Performance Tips

- Use pagination (limit max 100)
- Cache comment stats (rarely change)
- Lazy load replies
- Debounce reaction clicks
- Use optimistic updates in UI

## Security Notes

- JWT required for comment creation
- Users can only edit/delete own comments
- RLS policies enforce data privacy
- Comment length limited to 5000 chars
- Emoji validated against enum
- Soft deletes preserve history

## Rate Limiting (Recommended)

```typescript
// Add rate limiting to prevent spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 comments per window
});

app.use('/api/comments', limiter);
```
