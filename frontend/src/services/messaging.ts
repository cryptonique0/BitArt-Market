/**
 * Messaging Service (Client-side)
 * Handles API calls to messaging backend endpoints
 */

import { baseService } from './api';

export interface ConversationSummary {
  id: string;
  otherParticipantAddress: string;
  otherParticipantUsername?: string;
  otherParticipantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageBy: string;
  unreadCount: number;
  isBlocked: boolean;
  isBlockedBy: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderAddress: string;
  recipientAddress: string;
  content: string;
  status: string;
  createdAt: Date;
  readAt?: Date;
  updatedAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  deletedAt?: Date;
}

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
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  participant1Address: string;
  participant2Address: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  lastMessage?: string;
  unreadCount: number;
  otherParticipant: {
    address: string;
    username?: string;
    avatar?: string;
  };
}

export interface MessageThreadResponse {
  messages: Message[];
  conversation: ConversationDetail;
  transactionHistory: TransactionHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ConversationsResponse {
  conversations: ConversationSummary[];
  total: number;
  page: number;
  pageSize: number;
}

class MessagingService {
  private baseUrl = '/api/messages';

  /**
   * Get all conversations for current user
   */
  async getConversations(page = 1, pageSize = 20): Promise<ConversationsResponse> {
    const response = await fetch(
      `${this.baseUrl}/conversations?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  }

  /**
   * Get message thread for a conversation
   */
  async getMessageThread(
    conversationId: string,
    page = 1,
    pageSize = 50
  ): Promise<MessageThreadResponse> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/thread?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch message thread');
    const data = await response.json();

    // Convert date strings to Date objects
    return {
      ...data,
      messages: data.messages.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        readAt: m.readAt ? new Date(m.readAt) : undefined,
        updatedAt: new Date(m.updatedAt),
        editedAt: m.editedAt ? new Date(m.editedAt) : undefined,
      })),
      conversation: {
        ...data.conversation,
        createdAt: new Date(data.conversation.createdAt),
        updatedAt: new Date(data.conversation.updatedAt),
        lastMessageAt: data.conversation.lastMessageAt
          ? new Date(data.conversation.lastMessageAt)
          : undefined,
      },
      transactionHistory: data.transactionHistory.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      })),
    };
  }

  /**
   * Send a message
   */
  async sendMessage(input: {
    conversationId?: string;
    recipientAddress: string;
    content: string;
    transactionHash?: string;
    nftId?: string;
  }): Promise<Message> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Update a message
   */
  async updateMessage(messageId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update message');
    }

    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to delete message');
  }

  /**
   * Block a user
   */
  async blockUser(userAddressToBlock: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ userAddressToBlock }),
    });

    if (!response.ok) throw new Error('Failed to block user');
  }

  /**
   * Unblock a user
   */
  async unblockUser(userAddressToUnblock: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/unblock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ userAddressToUnblock }),
    });

    if (!response.ok) throw new Error('Failed to unblock user');
  }

  /**
   * Search messages
   */
  async searchMessages(
    conversationId?: string,
    query?: string,
    limit = 50,
    offset = 0
  ): Promise<{ messages: Message[]; total: number }> {
    const params = new URLSearchParams({
      ...(conversationId && { conversationId }),
      ...(query && { q: query }),
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to search messages');
    return response.json();
  }

  /**
   * Get transaction history for a conversation
   */
  async getTransactionHistory(conversationId: string): Promise<TransactionHistoryItem[]> {
    const response = await fetch(`${this.baseUrl}/${conversationId}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch transaction history');
    const data = await response.json();

    return data.transactions.map((t: any) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }));
  }

  /**
   * Helper: Get auth token from localStorage
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const messagingService = new MessagingService();
