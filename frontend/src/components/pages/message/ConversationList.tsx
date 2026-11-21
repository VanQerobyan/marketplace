import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetConversationsQuery } from "../../../../store/api/messagesApi";
import { getTimeAgo } from "../../../utils/GetTimeAgo";

export const ConversationList = ({ selectedUserId, currentUserId }: { selectedUserId: number; currentUserId: number }) => {
    const [page, setPage] = useState(1);
    const { currentData: data, isLoading, isFetching, error, refetch } = useGetConversationsQuery(page, {
        refetchOnMountOrArgChange: true
    });

    return <aside aria-label="Conversations" className="min-w-0 rounded-2xl border border-[#e9e0d6] dark:border-[#34373d]">
        <h2 className="border-b border-[#e9e0d6] p-4 font-semibold dark:border-[#34373d]">Your conversations</h2>
        {(isLoading || (isFetching && !data)) && <p role="status" className="p-4 text-sm">Loading conversations...</p>}
        {error && <div role="alert" className="space-y-2 p-4 text-sm text-[#843e2e] dark:text-[#f0aaa6]">
            <p>Unable to load conversations.</p>
            <button type="button" onClick={() => refetch()} className="rounded underline outline-none focus-visible:ring-2 focus-visible:ring-current">Try again</button>
        </div>}
        {data && <>
            {data.data.length === 0 && <p className="p-4 text-sm text-[#74604e] dark:text-[#aaa69f]">No conversations yet. Find someone above to send your first message.</p>}
            <div className="max-h-80 overflow-y-auto lg:max-h-[36rem]">
                {data.data.map(conversation => <Link
                    key={conversation.user.id}
                    to={`/account/messages?userId=${conversation.user.id}`}
                    aria-current={selectedUserId === conversation.user.id ? "true" : undefined}
                    className={`block border-b border-[#e9e0d6] p-4 outline-none last:border-0 hover:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#92683f] dark:border-[#34373d] dark:hover:bg-[#24272b] ${selectedUserId === conversation.user.id ? "bg-[#eddfce] dark:bg-[#3b332a]" : ""}`}
                >
                    <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 break-words text-sm font-semibold">{conversation.user.firstName} {conversation.user.lastName}</p>
                        {conversation.unreadCount > 0 && <span aria-label={`${conversation.unreadCount} unread messages`} className="shrink-0 rounded-full bg-[#493429] px-2 py-0.5 text-xs font-semibold text-[#fffcf8] dark:bg-[#c8a477] dark:text-[#1b1712]">{conversation.unreadCount}</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-[#74604e] dark:text-[#aaa69f]">@{conversation.user.username}</p>
                    <p className="mt-2 truncate text-sm">{conversation.lastMessage.senderId === currentUserId ? "You: " : ""}{conversation.lastMessage.content}</p>
                    <p className="mt-2 text-xs text-[#74604e] dark:text-[#aaa69f]">{getTimeAgo(conversation.lastMessage.createdAt)}</p>
                </Link>)}
            </div>
            {data.pagination.totalPages > 1 && <div className="flex items-center justify-between gap-2 border-t border-[#e9e0d6] p-3 text-xs dark:border-[#34373d]">
                <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)} className="min-h-10 rounded-lg border border-[#d9c6b0] px-3 disabled:opacity-50 dark:border-[#46494f]">Previous</button>
                <span>{page} / {data.pagination.totalPages}</span>
                <button type="button" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage(page + 1)} className="min-h-10 rounded-lg border border-[#d9c6b0] px-3 disabled:opacity-50 dark:border-[#46494f]">Next</button>
            </div>}
        </>}
    </aside>;
};
