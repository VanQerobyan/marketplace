import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGetMessagesQuery, useReadMessagesMutation } from "../../../../store/api/messagesApi";
import { useUserByIdQuery } from "../../../../store/api/usersApi";
import type { ChatMessage, SendMessageData } from "../../../types/messageType";
import { MessageBubble } from "./MessageBubble";
import { MessageForm } from "./MessageForm";

type ConversationThreadProps = {
    userId: number;
    currentUserId: number;
    listingId?: number;
    isConnected: boolean;
    sendMessage: (payload: SendMessageData) => Promise<ChatMessage>;
};

export const ConversationThread = ({ userId, currentUserId, listingId, isConnected, sendMessage }: ConversationThreadProps) => {
    const [page, setPage] = useState(1);
    const endRef = useRef<HTMLDivElement>(null);
    const { currentData: userData, isLoading: userLoading, error: userError, refetch: refetchUser } = useUserByIdQuery(String(userId));
    const { currentData: data, isLoading, isFetching, error, refetch } = useGetMessagesQuery({ userId, page }, { refetchOnMountOrArgChange: true });
    const [markAsRead, readResult] = useReadMessagesMutation();
    const messages = data?.data || [];
    const hasLoadedMessages = Boolean(data);
    const unreadCount = messages.filter(message => message.receiverId === currentUserId && !message.isRead).length;
    const latestMessageId = messages[0]?.id;

    useEffect(() => {
        const readMessages = () => {
            if (page === 1 && hasLoadedMessages && document.visibilityState === "visible") {
                markAsRead(userId);
            }
        };
        readMessages();
        document.addEventListener("visibilitychange", readMessages);
        return () => document.removeEventListener("visibilitychange", readMessages);
    }, [userId, page, unreadCount, hasLoadedMessages, markAsRead]);

    useEffect(() => {
        if (page === 1) endRef.current?.scrollIntoView({ block: "nearest" });
    }, [latestMessageId, page, userData]);

    const handleSend = async (content: string) => {
        await sendMessage({ receiverId: userId, content, ...(listingId ? { listingId } : {}) });
        setPage(1);
    };

    if (userLoading) return <p role="status" className="p-5">Loading conversation...</p>;
    if (userError || !userData) return <div role="alert" className="space-y-3 p-5">
        <p>This user is unavailable or could not be loaded.</p>
        <button type="button" onClick={() => refetchUser()} className="rounded border border-[#d9c6b0] px-4 py-2 dark:border-[#46494f]">Retry user</button>
    </div>;

    const user = userData.data;
    return <section aria-label="Selected conversation" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e9e0d6] dark:border-[#34373d]">
        <header className="border-b border-[#e9e0d6] p-4 dark:border-[#34373d]">
            <Link to={`/account/users/${user.id}`} className="rounded font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#92683f]">{user.firstName} {user.lastName}</Link>
            <p className="mt-1 text-xs text-[#74604e] dark:text-[#aaa69f]">@{user.username}</p>
            {listingId && <Link to={`/account/listings/${listingId}`} className="mt-2 inline-block rounded text-xs underline">Conversation about this listing</Link>}
        </header>
        {(isLoading || (isFetching && !data)) && <p role="status" className="p-4 text-sm">Loading messages...</p>}
        {error && <div role="alert" className="space-y-2 p-4 text-sm text-[#843e2e] dark:text-[#f0aaa6]">
            <p>Unable to load messages. Your draft will stay here.</p>
            <button type="button" onClick={() => refetch()} className="rounded underline">Retry messages</button>
        </div>}
        {data && data.pagination.totalPages > 1 && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e9e0d6] p-3 text-xs dark:border-[#34373d]">
            <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)} className="min-h-10 rounded border border-[#d9c6b0] px-3 disabled:opacity-50 dark:border-[#46494f]">Newer messages</button>
            <span>{page} / {data.pagination.totalPages}</span>
            <button type="button" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage(page + 1)} className="min-h-10 rounded border border-[#d9c6b0] px-3 disabled:opacity-50 dark:border-[#46494f]">Older messages</button>
        </div>}
        <div aria-label="Messages" className="h-80 space-y-3 overflow-y-auto p-4 sm:h-96 lg:h-[28rem]">
            {data && messages.length === 0 && <p className="py-10 text-center text-sm text-[#74604e] dark:text-[#aaa69f]">No messages yet. Say hello!</p>}
            {[...messages].reverse().map(message => <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />)}
            <div ref={endRef} />
        </div>
        {readResult.isError && <div role="alert" className="px-4 pb-3 text-sm text-[#843e2e] dark:text-[#f0aaa6]">
            <p>Unable to mark messages as read.</p>
            <button type="button" onClick={() => markAsRead(userId)} disabled={readResult.isLoading} className="mt-1 rounded underline disabled:opacity-50">Retry marking as read</button>
        </div>}
        <MessageForm onSend={handleSend} isConnected={isConnected && Boolean(data) && !error} />
    </section>;
};
