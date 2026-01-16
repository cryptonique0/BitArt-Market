/**
 * Messaging Service
 * Handles all message and conversation operations
 */

import { supabase } from '../config/supabase';
import {
  Conversation,
  Message,
  MessageStatus,
  CreateMessageInput,
  UpdateMessageInput,
  MessageThread,
  ConversationDetail,
  MessageSearchFilter,
  ConversationSummary,
  TransactionHistoryItem,
  MessageThreadResponse,
  ConversationsResponse,
  UserBlock,
  BlockUserInput,
  UnblockUserInput,
  MessageNotification,
} from '../types/messaging';

export class MessagingService {
  /**
   * Get or create conversation between two users
   */
  static async getOrCreateConversation(
    userAddress: string,
    otherUserAddress: string
  ): Promise<Conversation> {
    // Normalize addresses for consistency
    const addr1 = userAddress.toLowerCase();
    const addr2 = otherUserAddress.toLowerCase();
    const [participant1, participant2] = addr1 < addr2 ? [addr1, addr2] : [addr2, addr1];

    try {
      // Try to find existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('participant1_address', participant1)
        .eq('participant2_address', participant2)
        .single();

      if (!fetchError && existing) {
        return this.formatConversation(existing);
      }

      // Create new conversation if doesn't exist
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_address: participant1,
          participant2_address: participant2,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .select()
        .single();

      if (createError) throw createError;
      return this.formatConversation(created);
    } catch (err) {
      console.error('Error in getOrCreateConversation:', err);
      throw err;
    }
  }

  /**
   * Get conversation by ID with details
   */
  static async getConversationDetail(
    conversationId: string,
    userAddress: string
  ): Promise<ConversationDetail> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const conversation = this.formatConversation(data);
      const otherParticipant =
        conversation.participant1Address.toLowerCase() === userAddress.toLowerCase()
          ? conversation.participant2Address
          : conversation.participant1Address;

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .eq('recipient_address', userAddress.toLowerCase())
        .eq('status', MessageStatus.DELIVERED);

      return {
        ...conversation,
        unreadCount: unreadCount || 0,
        otherParticipant: {
          address: otherParticipant,
        },
      };
    } catch (err) {
      console.error('Error in getConversationDetail:', err);
      throw err;
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getConversations(
    userAddress: string,
    page = 1,
    pageSize = 20
  ): Promise<ConversationsResponse> {
    try {
      const offset = (page - 1) * pageSize;
      const normalizedAddress = userAddress.toLowerCase();

      // Get conversations where user is participant
      const {
        data: conversations,
        count: total,
        error,
      } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .or(
          `participant1_address.eq.${normalizedAddress},participant2_address.eq.${normalizedAddress}`
        )
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      // Get unread counts and last messages for each conversation
      const summaries = await Promise.all(
        conversations.map(async conv => {
          const otherParticipant =
            conv.participant1_address === normalizedAddress
              ? conv.participant2_address
              : conv.participant1_address;

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('recipient_address', normalizedAddress)
            .eq('status', MessageStatus.DELIVERED);

          // Get last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('content, created_at, sender_address')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: conv.id,
            otherParticipantAddress: otherParticipant,
            lastMessage: lastMessages?.content || undefined,
            lastMessageAt: lastMessages?.created_at ? new Date(lastMessages.created_at) : undefined,
            lastMessageBy: lastMessages?.sender_address || '',
            unreadCount: unreadCount || 0,
            isBlocked:
              conv.participant1_address === normalizedAddress
                ? conv.participant1_blocked
                : conv.participant2_blocked,
            isBlockedBy:
              conv.participant1_address === normalizedAddress
                ? conv.participant2_blocked
                : conv.participant1_blocked,
          };
        })
      );

      return {
        conversations: summaries as ConversationSummary[],
        total: total || 0,
        page,
        pageSize,
      };
    } catch (err) {
      console.error('Error in getConversations:', err);
      throw err;
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(userAddress: string, input: CreateMessageInput): Promise<Message> {
    try {
      const senderAddress = userAddress.toLowerCase();
      const recipientAddress = input.recipientAddress.toLowerCase();

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(senderAddress, recipientAddress);

      // Check if blocked
      const isBlocked = await this.isUserBlocked(senderAddress, recipientAddress);
      if (isBlocked) {
        throw new Error('You cannot message this user (blocked)');
      }

      // Create message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_address: senderAddress,
          recipient_address: recipientAddress,
          content: input.content,
          status: MessageStatus.SENT,
          created_at: new Date(),
          updated_at: new Date(),
          is_edited: false,
        })
        .select()
        .single();

      if (error) throw error;

      // If transaction-related, create transaction_message entry
      if (input.transactionHash && input.nftId) {
        await this.linkTransactionToMessage(message.id, input.transactionHash, input.nftId);
      }

      // Send notification (would integrate with real-time service)
      await this.createMessageNotification(conversation.id, message.id, senderAddress);

      return this.formatMessage(message);
    } catch (err) {
      console.error('Error in sendMessage:', err);
      throw err;
    }
  }

  /**
   * Get message thread
   */
  static async getMessageThread(
    conversationId: string,
    userAddress: string,
    page = 1,
    pageSize = 50
  ): Promise<MessageThreadResponse> {
    try {
      const offset = (page - 1) * pageSize;

      // Get conversation detail
      const conversationDetail = await this.getConversationDetail(conversationId, userAddress);

      // Get messages
      const {
        data: messages,
        count: total,
        error,
      } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ status: MessageStatus.READ, updated_at: new Date() })
        .eq('conversation_id', conversationId)
        .eq('recipient_address', userAddress.toLowerCase());

      // Get transaction history for this conversation
      const transactionHistory = await this.getConversationTransactionHistory(conversationId);

      return {
        messages: messages.map(m => this.formatMessage(m)).reverse(),
        conversation: conversationDetail,
        transactionHistory,
        total: total || 0,
        page,
        pageSize,
      };
    } catch (err) {
      console.error('Error in getMessageThread:', err);
      throw err;
    }
  }

  /**
   * Update message
   */
  static async updateMessage(userAddress: string, input: UpdateMessageInput): Promise<Message> {
    try {
      // Verify user owns message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', input.messageId)
        .single();

      if (fetchError || !message) throw new Error('Message not found');
      if (message.sender_address.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Cannot edit message you did not send');
      }

      const { data: updated, error } = await supabase
        .from('messages')
        .update({
          content: input.content,
          is_edited: true,
          edited_at: new Date(),
          updated_at: new Date(),
        })
        .eq('id', input.messageId)
        .select()
        .single();

      if (error) throw error;
      return this.formatMessage(updated);
    } catch (err) {
      console.error('Error in updateMessage:', err);
      throw err;
    }
  }

  /**
   * Delete message (soft delete)
   */
  static async deleteMessage(userAddress: string, messageId: string): Promise<void> {
    try {
      // Verify user owns message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError || !message) throw new Error('Message not found');
      if (message.sender_address.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Cannot delete message you did not send');
      }

      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date(), updated_at: new Date() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error in deleteMessage:', err);
      throw err;
    }
  }

  /**
   * Block user
   */
  static async blockUser(userAddress: string, input: BlockUserInput): Promise<void> {
    try {
      const userAddr = userAddress.toLowerCase();
      const blockedAddr = input.userAddressToBlock.toLowerCase();

      // Find conversation
      const [addr1, addr2] =
        userAddr < blockedAddr ? [userAddr, blockedAddr] : [blockedAddr, userAddr];
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, participant1_address')
        .eq('participant1_address', addr1)
        .eq('participant2_address', addr2)
        .single();

      if (conv) {
        const isParticipant1 = conv.participant1_address === userAddr;
        const updateData = isParticipant1
          ? { participant1_blocked: true }
          : { participant2_blocked: true };

        await supabase.from('conversations').update(updateData).eq('id', conv.id);
      }

      // Create block record
      await supabase.from('user_blocks').insert({
        blocker_address: userAddr,
        blocked_address: blockedAddr,
        created_at: new Date(),
      });
    } catch (err) {
      console.error('Error in blockUser:', err);
      throw err;
    }
  }

  /**
   * Unblock user
   */
  static async unblockUser(userAddress: string, input: UnblockUserInput): Promise<void> {
    try {
      const userAddr = userAddress.toLowerCase();
      const unblockedAddr = input.userAddressToUnblock.toLowerCase();

      // Delete block record
      await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_address', userAddr)
        .eq('blocked_address', unblockedAddr);

      // Update conversation if exists
      const [addr1, addr2] =
        userAddr < unblockedAddr ? [userAddr, unblockedAddr] : [unblockedAddr, userAddr];
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, participant1_address')
        .eq('participant1_address', addr1)
        .eq('participant2_address', addr2)
        .single();

      if (conv) {
        const isParticipant1 = conv.participant1_address === userAddr;
        const updateData = isParticipant1
          ? { participant1_blocked: false }
          : { participant2_blocked: false };

        await supabase.from('conversations').update(updateData).eq('id', conv.id);
      }
    } catch (err) {
      console.error('Error in unblockUser:', err);
      throw err;
    }
  }

  /**
   * Check if user is blocked
   */
  static async isUserBlocked(userAddress: string, potentialBlocker: string): Promise<boolean> {
    try {
      const { count } = await supabase
        .from('user_blocks')
        .select('id', { count: 'exact' })
        .eq('blocker_address', potentialBlocker.toLowerCase())
        .eq('blocked_address', userAddress.toLowerCase());

      return (count || 0) > 0;
    } catch (err) {
      console.error('Error in isUserBlocked:', err);
      return false;
    }
  }

  /**
   * Get conversation transaction history
   */
  static async getConversationTransactionHistory(
    conversationId: string
  ): Promise<TransactionHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('transaction_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        transactionHash: t.transaction_hash,
        nftId: t.nft_id,
        nftName: t.nft_name,
        nftImage: t.nft_image,
        transactionType: t.transaction_type,
        amount: t.transaction_amount,
        currency: 'ETH',
        timestamp: new Date(t.transaction_date),
        counterparty: t.buyer_address === conversationId ? t.seller_address : t.buyer_address,
        status: 'completed',
        messageCount: 0,
      }));
    } catch (err) {
      console.error('Error in getConversationTransactionHistory:', err);
      return [];
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(
    userAddress: string,
    filter: MessageSearchFilter
  ): Promise<Message[]> {
    try {
      let query = supabase.from('messages').select('*');

      if (filter.searchText) {
        query = query.ilike('content', `%${filter.searchText}%`);
      }
      if (filter.conversationId) {
        query = query.eq('conversation_id', filter.conversationId);
      }
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }
      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      // Only return messages where user is sender or recipient
      query = query.or(
        `sender_address.eq.${userAddress.toLowerCase()},recipient_address.eq.${userAddress.toLowerCase()}`
      );

      const limit = filter.limit || 50;
      const offset = filter.offset || 0;

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(m => this.formatMessage(m));
    } catch (err) {
      console.error('Error in searchMessages:', err);
      throw err;
    }
  }

  /**
   * Helper: Link transaction to message
   */
  private static async linkTransactionToMessage(
    messageId: string,
    transactionHash: string,
    nftId: string
  ): Promise<void> {
    try {
      await supabase.from('transaction_messages').insert({
        message_id: messageId,
        transaction_hash: transactionHash,
        nft_id: nftId,
        transaction_type: 'inquiry',
      });
    } catch (err) {
      console.error('Error linking transaction to message:', err);
    }
  }

  /**
   * Helper: Create message notification
   */
  private static async createMessageNotification(
    conversationId: string,
    messageId: string,
    senderAddress: string
  ): Promise<void> {
    try {
      // Get conversation to find recipient
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conv) return;

      const recipientAddress =
        conv.participant1_address === senderAddress
          ? conv.participant2_address
          : conv.participant1_address;

      await supabase.from('message_notifications').insert({
        conversation_id: conversationId,
        message_id: messageId,
        sender_address: senderAddress,
        recipient_address: recipientAddress,
        created_at: new Date(),
        read: false,
      });
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }

  /**
   * Helper: Format conversation from database
   */
  private static formatConversation(data: any): Conversation {
    return {
      id: data.id,
      participant1Address: data.participant1_address,
      participant2Address: data.participant2_address,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : undefined,
      lastMessage: data.last_message,
      participant1Blocked: data.participant1_blocked || false,
      participant2Blocked: data.participant2_blocked || false,
    };
  }

  /**
   * Helper: Format message from database
   */
  private static formatMessage(data: any): Message {
    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderAddress: data.sender_address,
      recipientAddress: data.recipient_address,
      content: data.content,
      status: data.status,
      createdAt: new Date(data.created_at),
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      updatedAt: new Date(data.updated_at),
      isEdited: data.is_edited || false,
      editedAt: data.edited_at ? new Date(data.edited_at) : undefined,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    };
  }
}

export const messagingService = new MessagingService();
