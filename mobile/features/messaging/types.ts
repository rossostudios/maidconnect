export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  translatedContent?: string | null;
  originalLanguage?: string | null;
  createdAt: Date;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  bookingId: string | null;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  otherParticipantName: string | null;
  otherParticipantId: string | null;
};

export type MessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  translated_content?: string | null;
  original_language?: string | null;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name: string | null;
  };
};

export type ConversationRecord = {
  id: string;
  booking_id: string | null;
  participant_ids: string[];
  created_at: string;
  updated_at: string;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count?: number;
};

export type SendMessageParams = {
  conversationId: string;
  content: string;
  translateTo?: string;
};

export type TranslateMessageParams = {
  messageId: string;
  targetLanguage: string;
};
