import type { Pagination } from "./listingType";

export type MessageUser = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string | null;
};

export type ChatMessage = {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    listingId: number | null;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Conversation = {
    user: MessageUser;
    lastMessage: ChatMessage;
    unreadCount: number;
};

export type ConversationsResponse = {
    success: boolean;
    data: Conversation[];
    pagination: Pagination;
};

export type MessagesResponse = {
    success: boolean;
    data: ChatMessage[];
    pagination: Pagination;
};

export type SendMessageData = {
    receiverId: number;
    content: string;
    listingId?: number;
};

export type MessageSocketResponse = {
    success: boolean;
    data?: ChatMessage;
    message?: string;
};
