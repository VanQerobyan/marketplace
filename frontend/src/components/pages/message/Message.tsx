import { useSearchParams } from "react-router-dom";
import { useGetUsersQuery } from "../../../../store/api/usersApi";
import { useMessageSocket } from "../../../hooks/useMessageSocket";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import { MessageUserSearch } from "./MessageUserSearch";

export const Message = () => {
    const [params] = useSearchParams();
    const { data } = useGetUsersQuery();
    const { sendMessage, isConnected, error, reconnect } = useMessageSocket();
    const userId = Number(params.get("userId"));
    const listingId = Number(params.get("listingId"));
    const isValidUser = /^\d+$/.test(params.get("userId") || "") && Number.isInteger(userId) && userId > 0 && userId <= 2147483647;
    const isValidListing = !params.has("listingId") || (/^\d+$/.test(params.get("listingId") || "") && Number.isInteger(listingId) && listingId > 0 && listingId <= 2147483647);

    if (!data) return <p role="status">Loading messages...</p>;
    const isOwnAccount = userId === data.data.id;

    return <section className="w-full min-w-0 text-[#493429] dark:text-[#e8e6e1]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1>Messages</h1>
            <div className="flex items-center gap-3 text-xs">
                <p role="status">{isConnected ? "Connected" : "Connecting or offline"}</p>
                {!isConnected && <button type="button" onClick={reconnect} className="min-h-10 rounded-lg border border-[#d9c6b0] px-3 dark:border-[#46494f]">Reconnect</button>}
            </div>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl bg-[#fff1e8] p-3 text-sm text-[#843e2e] dark:bg-[#332426] dark:text-[#f0aaa6]">{error}</p>}
        <MessageUserSearch currentUserId={data.data.id} />
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,2fr)]">
            <ConversationList selectedUserId={isValidUser ? userId : 0} currentUserId={data.data.id} />
            {isValidUser && !isOwnAccount && isValidListing ? <ConversationThread key={`${userId}-${listingId}`} userId={userId} currentUserId={data.data.id} listingId={listingId || undefined} sendMessage={sendMessage} isConnected={isConnected} /> : <div className="rounded-2xl border border-dashed border-[#d9c6b0] px-5 py-12 text-center text-sm dark:border-[#46494f]">
                {isOwnAccount ? "You cannot message yourself." : params.has("userId") || !isValidListing ? "This conversation link is invalid. Select a conversation or search for a user." : "Select a conversation or search for someone to start a new message."}
            </div>}
        </div>
    </section>;
};
