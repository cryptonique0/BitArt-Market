# User Messaging - Testing Guide

## Manual Testing Scenarios

### 1. Basic Messaging

#### Test 1.1: Send First Message

**Objective**: Verify that sending a message to a new user creates a conversation

**Steps**:

1. Login as User A (0xUserA...)
2. Navigate to Messages
3. Start new message to User B (0xUserB...)
4. Send: "Hi! Is this NFT still available?"
5. Verify:
   - Message appears in thread
   - Conversation created automatically
   - Status: "sent"
   - Timestamp displayed

**Expected Result**: ✅ Conversation created, message visible

#### Test 1.2: Reply to Message

**Objective**: Verify message thread continues correctly

**Steps**:

1. Login as User B
2. Navigate to Messages
3. See conversation from User A
4. Click conversation
5. Verify: Previous message from User A visible
6. Send reply: "Yes, still available!"
7. Verify:
   - Reply added to thread
   - Messages in correct order
   - Unread count decreases

**Expected Result**: ✅ Conversation thread continues, order correct

#### Test 1.3: View Conversation List

**Objective**: Verify conversations list shows all active conversations

**Steps**:

1. Create 5 different conversations with different users
2. Go to Messages page
3. Verify:
   - All 5 conversations listed
   - Most recent first
   - Last message preview shows
   - Timestamps correct
   - Unread badges appear

**Expected Result**: ✅ All conversations visible, sorted by recent

---

### 2. Message Editing & Deletion

#### Test 2.1: Edit Message

**Objective**: Verify message can be edited with "edited" indicator

**Steps**:

1. Send message: "What's the minimum price?"
2. Click edit button (pencil icon)
3. Change to: "What's the lowest you'll go?"
4. Click update
5. Verify:
   - Message updated in thread
   - "(edited)" indicator appears
   - Edited timestamp stored
   - Other user sees edited version

**Expected Result**: ✅ Message edited, indicator shows

#### Test 2.2: Delete Message

**Objective**: Verify message can be deleted (soft delete)

**Steps**:

1. Send test message
2. Click delete button (trash icon)
3. Confirm deletion
4. Verify:
   - Message disappears from thread
   - Other user still sees it's deleted
   - Message count decreases
   - Can't re-edit deleted message

**Expected Result**: ✅ Message deleted (soft delete)

#### Test 2.3: Can't Edit Others' Messages

**Objective**: Verify users can't edit messages from others

**Steps**:

1. Login as User A
2. View conversation thread
3. Try to edit message from User B
4. Verify:
   - Edit button not visible
   - No permission error (button just doesn't appear)

**Expected Result**: ✅ Can't edit others' messages

---

### 3. Search & Filtering

#### Test 3.1: Search Messages

**Objective**: Verify full-text search works

**Steps**:

1. Create conversation with at least 20 messages
2. Use search box in conversation list
3. Search for: "interested"
4. Verify:
   - Only conversations with "interested" in messages shown
   - Other conversations hidden
   - Partial matches work
   - Case-insensitive

**Expected Result**: ✅ Search filters conversations

#### Test 3.2: Search Within Conversation

**Objective**: Verify message search within thread

**Steps**:

1. Open conversation with 50+ messages
2. Use search feature (if available)
3. Search: "price"
4. Verify:
   - Only matching messages highlighted/filtered
   - Non-matching hidden
   - Pagination adjusted

**Expected Result**: ✅ Messages filtered by search

---

### 4. User Blocking

#### Test 4.1: Block User

**Objective**: Verify blocking prevents messaging

**Steps**:

1. Open conversation with User A
2. Click block button
3. Confirm block action
4. Verify:
   - Conversation shows "blocked" badge
   - Can't send messages
   - Can still view history
5. Try to send message
6. Verify: Error message appears

**Expected Result**: ✅ User blocked, can't message

#### Test 4.2: Unblock User

**Objective**: Verify unblocking restores messaging

**Steps**:

1. Find blocked user in list
2. Click unblock
3. Confirm unblock
4. Verify:
   - "Blocked" badge removed
   - Can send messages again
5. Send test message
6. Verify: Message sends successfully

**Expected Result**: ✅ User unblocked, messaging restored

#### Test 4.3: Block Prevents New Messages

**Objective**: Verify blocked user can't send messages

**Steps**:

1. User A blocks User B
2. Login as User B (or have B try to send message)
3. Try to send message to User A
4. Verify: Message fails with "user blocked" error

**Expected Result**: ✅ Can't message if blocked

---

### 5. Transaction Context

#### Test 5.1: Link Transaction to Message

**Objective**: Verify transactions appear in conversation

**Steps**:

1. Send message with transaction context:
   ```
   {
     conversationId: "...",
     content: "Checking on that purchase",
     transactionHash: "0x123...",
     nftId: "nft-456"
   }
   ```
2. Click "Transaction History" button
3. Verify:
   - Transaction card appears
   - NFT image shown
   - Transaction amount displayed
   - Status badge (completed/pending)

**Expected Result**: ✅ Transaction linked to conversation

#### Test 5.2: Multiple Transactions in Conversation

**Objective**: Verify multiple transactions in history

**Steps**:

1. Link 3 transactions to same conversation
2. Click "Transaction History"
3. Verify:
   - All 3 transactions displayed
   - Sorted by date
   - Each has image and details
   - Can scroll through list

**Expected Result**: ✅ Multiple transactions shown

---

### 6. Unread Status

#### Test 6.1: Unread Message Count

**Objective**: Verify unread counts update correctly

**Steps**:

1. Have User A send 3 messages
2. Login as User B (without opening conversation)
3. In conversation list
4. Verify:
   - Badge shows "3" unread
   - Badge appears next to conversation
5. Open conversation
6. Verify:
   - Badge disappears
   - Messages marked as read
   - Status changed to "read"

**Expected Result**: ✅ Unread count accurate

#### Test 6.2: Total Unread Count

**Objective**: Verify total unread count across conversations

**Steps**:

1. Have multiple users send messages
2. Get ~5 unread messages total
3. View messages icon/page
4. Verify:
   - Shows total unread (5)
   - Decreases as you open conversations
   - Updates in real-time

**Expected Result**: ✅ Total count accurate

---

### 7. Pagination

#### Test 7.1: Conversation Pagination

**Objective**: Verify pagination works for conversations

**Steps**:

1. Create 25+ conversations
2. Go to Messages
3. Verify:
   - First 20 shown
   - "Load more" button appears
4. Click "Load more"
5. Verify:
   - Next 5 loaded
   - No duplicates
   - Button disappears if all loaded

**Expected Result**: ✅ Pagination works

#### Test 7.2: Message Thread Pagination

**Objective**: Verify old messages load on scroll

**Steps**:

1. Create conversation with 100+ messages
2. Open conversation
3. Verify: Latest 50 loaded
4. Scroll to top
5. Verify:
   - Older messages load
   - No duplicates
   - Continues paginating

**Expected Result**: ✅ Messages load correctly

---

### 8. Edge Cases

#### Test 8.1: Long Messages

**Objective**: Verify messages up to 5000 characters work

**Steps**:

1. Send 5000 character message
2. Verify: Message sends and displays
3. Try 5001 characters
4. Verify: Error message (too long)

**Expected Result**: ✅ 5000 char limit enforced

#### Test 8.2: Special Characters

**Objective**: Verify special characters handled correctly

**Steps**:

1. Send message with: @#$%^&\*()\_+-=[]{}|;:'",.<>?/
2. Send message with emojis: 😀🎉❤️
3. Send message with newlines
4. Verify: All display correctly

**Expected Result**: ✅ Special characters work

#### Test 8.3: Empty Conversation

**Objective**: Verify empty state displays correctly

**Steps**:

1. Go to messages with no conversations
2. Verify: "No conversations" message shown
3. Have someone message you
4. Refresh
5. Verify: Conversation appears

**Expected Result**: ✅ Empty state handled

---

### 9. Performance Tests

#### Test 9.1: Load 100 Messages

**Objective**: Verify performance with many messages

**Steps**:

1. Create conversation with 100 messages
2. Load thread
3. Time to load: Should be < 2 seconds
4. Measure:
   - UI responsiveness
   - Scroll smoothness
   - Memory usage

**Expected Result**: ✅ Loads smoothly

#### Test 9.2: Search 1000 Messages

**Objective**: Verify search performance

**Steps**:

1. Create 10 conversations with 100 messages each
2. Search for common term
3. Time to get results: Should be < 500ms
4. Verify: No UI lag

**Expected Result**: ✅ Search fast

---

### 10. Mobile Responsiveness

#### Test 10.1: Mobile Layout

**Objective**: Verify mobile-friendly layout

**Steps**:

1. Open on mobile device
2. Verify:
   - Conversations list takes full width
   - Click conversation → thread shows
   - Back button appears
   - Input stays visible when typing
   - No horizontal scroll

**Expected Result**: ✅ Mobile layout works

#### Test 10.2: Tablet Layout

**Objective**: Verify tablet layout with split view

**Steps**:

1. Open on tablet
2. Verify:
   - Conversations on left (~1/4 width)
   - Thread on right (~3/4 width)
   - Both visible simultaneously
   - Can select new conversation

**Expected Result**: ✅ Tablet split view works

---

## API Testing

### Using cURL

#### Send Message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "recipientAddress": "0xUserB",
    "content": "Test message",
    "conversationId": "optional-uuid"
  }'
```

#### Get Conversations

```bash
curl http://localhost:3000/api/messages/conversations \
  -H "Authorization: Bearer {token}"
```

#### Get Message Thread

```bash
curl http://localhost:3000/api/messages/conversations/{id}/thread \
  -H "Authorization: Bearer {token}"
```

#### Block User

```bash
curl -X POST http://localhost:3000/api/messages/block \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "userAddressToBlock": "0xUserToBlock"
  }'
```

---

## Database Testing

### Verify Tables Created

```sql
SELECT * FROM information_schema.tables
WHERE table_name IN (
  'conversations', 'messages', 'user_blocks',
  'transaction_messages', 'message_notifications'
);
```

### Verify Indexes

```sql
SELECT * FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages', 'user_blocks');
```

### Test RLS Policy

```sql
-- As authenticated user
SELECT * FROM conversations
WHERE participant1_address = current_user OR participant2_address = current_user;
-- Should only return own conversations
```

### Check Message Count

```sql
SELECT conversation_id, COUNT(*) as message_count
FROM messages
GROUP BY conversation_id;
```

---

## Regression Testing

Run these tests after any changes:

- [ ] Can send and receive messages
- [ ] Can edit own messages
- [ ] Can delete own messages
- [ ] Can block/unblock users
- [ ] Can search messages
- [ ] Can view transaction history
- [ ] Unread counts work
- [ ] Pagination works
- [ ] RLS policies enforce access
- [ ] Database queries performant

---

## Test Checklist

Before marking as complete:

- [ ] All manual tests pass
- [ ] All API tests pass
- [ ] Database tests pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Edge cases handled
- [ ] Documentation complete
- [ ] Ready for production

---

## Known Limitations

1. Real-time updates require WebSocket (not included)
2. File attachments need separate file storage
3. Message encryption not included
4. Voice messages not supported
5. Group messaging not supported
