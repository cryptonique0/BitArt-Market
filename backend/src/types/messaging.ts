/**
 * User Messaging Types
 * Types for direct messaging between buyers and sellers with transaction history
 */

/**
 * Message status enum
 */
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Conversation type (1:1 between users)
 */
export interface Conversation {
  id: string;
  participant1Address: string;
  participant2Address: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  lastMessage?: string;
  participant1Blocked: boolean;
  participant2Blocked: boolean;
}

/**
 * Individual message
 */
export interface Message {
  id: string;
  conversationId: string;
  senderAddress: string;
  recipientAddress: string;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
  updatedAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  attachments?: MessageAttachment[];
}

/**
 * Message attachment (images, files, etc.)
 */
export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

/**
 * Transaction-linked message (for context in conversations)
 */
export interface TransactionMessage {
  id: string;
  conversationId: string;
  messageId: string;
  transactionHash: string;
  nftId: string;
  nftName: string;
  nftImage: string;
  transactionType: 'purchase' | 'sale' | 'offer' | 'inquiry';
  transactionAmount: string;
  transactionDate: Date;
  buyerAddress: string;
  sellerAddress: string;
  context?: string; // Extra context about the transaction
}

/**
 * Conversation with last message and unread count
 */
export interface ConversationDetail extends Conversation {
  unreadCount: number;
  otherParticipant: {
    address: string;
    username?: string;
    avatar?: string;
    isVerified?: boolean;
  };
}

/**
 * Message thread response (paginated)
 */
export interface MessageThread {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Message input for creating messages
 */
export interface CreateMessageInput {
  conversationId?: string;
  recipientAddress: string;
  content: string;
  transactionHash?: string;
  nftId?: string;
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
  }[];
}

/**
 * Update message (for editing)
 */
export interface UpdateMessageInput {
  messageId: string;
  content: string;
}

/**
 * Block user request
 */
export interface BlockUserInput {
  userAddressToBlock: string;
}

/**
 * Unblock user request
 */
export interface UnblockUserInput {
  userAddressToUnblock: string;
}

/**
 * Message search filter
 */
export interface MessageSearchFilter {
  conversationId?: string;
  senderAddress?: string;
  recipientAddress?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
  status?: MessageStatus;
  limit?: number;
  offset?: number;
}

/**
 * User blocking relationship
 */
export interface UserBlock {
  id: string;
  blockerAddress: string;
  blockedAddress: string;
  createdAt: Date;
  reason?: string;
}

/**
 * Notification for new messages
 */
export interface MessageNotification {
  id: string;
  userId: string;
  messageId: string;
  conversationId: string;
  senderAddress: string;
  senderUsername?: string;
  preview: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Conversation summary for list view
 */
export interface ConversationSummary {
  id: string;
  otherParticipantAddress: string;
  otherParticipantUsername?: string;
  otherParticipantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy: string; // Address of who sent last message
  unreadCount: number;
  isBlocked: boolean;
  isBlockedBy: boolean;
}

/**
 * Transaction history item
 */
export interface TransactionHistoryItem {
  transactionHash: string;
  nftId: string;
  nftName: string;
  nftImage: string;
  transactionType: 'purchase' | 'sale' | 'offer' | 'inquiry';
  amount: string;
  currency: string;
  timestamp: Date;
  counterparty: string;
  counterpartyUsername?: string;
  status: 'completed' | 'pending' | 'failed';
  messages?: Message[];
  messageCount: number;
}

/**
 * API Response for conversations list
 */
export interface ConversationsResponse {
  conversations: ConversationSummary[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * API Response for message thread
 */
export interface MessageThreadResponse {
  messages: Message[];
  conversation: ConversationDetail;
  transactionHistory: TransactionHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}
