import { Link } from "react-router-dom";
import type { ChatMessage } from "../../../types/messageType";

export const MessageBubble = ({ message, currentUserId }: { message: ChatMessage; currentUserId: number }) => {
    const isMine = message.senderId === currentUserId;

    return <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <article aria-label={isMine ? "Your message" : "Received message"} className={`max-w-[90%] rounded-2xl p-3 sm:max-w-[80%] sm:p-4 ${isMine ? "bg-[#493429] text-[#fffcf8] dark:bg-[#c8a477] dark:text-[#1b1712]" : "border border-[#e9e0d6] bg-[#f4ebdf] dark:border-[#46494f] dark:bg-[#24272b]"}`}>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{message.content}</p>
            {message.listingId && <Link to={`/account/listings/${message.listingId}`} className="mt-2 inline-block rounded text-xs underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-current">View listing</Link>}
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-[11px] opacity-80">
                <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
                {isMine && <span>{message.isRead ? "Read" : "Sent"}</span>}
            </div>
        </article>
    </div>;
};
