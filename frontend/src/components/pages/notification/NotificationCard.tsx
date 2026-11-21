import { NavLink } from "react-router-dom";
import type { Notification } from "../../../types/notificationType";
import { getTimeAgo } from "../../../utils/GetTimeAgo";

type NotificationCardProps = {
    notification: Notification;
    isUpdating: boolean;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
};

export const NotificationCard = ({ notification, isUpdating, onRead, onDelete }: NotificationCardProps) => {
    const actor = notification.actor;
    const actorName = actor ? `${actor.firstName} ${actor.lastName}` : "Marketplace";

    return <article aria-label={`${notification.isRead ? "Read" : "Unread"} notification`} className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:p-5 ${notification.isRead ? "border-[#e9e0d6] bg-[#fffdf9] dark:border-[#34373d] dark:bg-[#1b1d20]" : "border-[#b58b62] bg-[#f7f0e7] dark:border-[#74634f] dark:bg-[#24272b]"}`}>
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eddfce] font-bold text-[#634b38] dark:bg-[#3b332a] dark:text-[#dec099]">
            {actor?.avatar ? <img src={`http://localhost:5000${actor.avatar}`} alt={`${actorName}'s avatar`} className="size-full object-cover" /> : <span aria-hidden="true">{actorName.charAt(0)}</span>}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
                {actor ? <NavLink to={`/account/users/${actor.id}`} className="rounded font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#92683f]">{actorName}</NavLink> : <p className="font-semibold">{actorName}</p>}
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${notification.isRead ? "bg-[#f4ebdf] text-[#74604e] dark:bg-[#141619] dark:text-[#aaa69f]" : "bg-[#493429] text-[#fffcf8] dark:bg-[#c8a477] dark:text-[#1b1712]"}`}>
                    {notification.isRead ? "Read" : "Unread"}
                </span>
            </div>
            {actor && <p className="mt-1 text-xs text-[#74604e] dark:text-[#aaa69f]">@{actor.username}</p>}
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{notification.message}</p>
            <time dateTime={notification.createdAt} title={new Date(notification.createdAt).toLocaleString()} className="mt-2 block text-xs text-[#74604e] dark:text-[#aaa69f]">
                {getTimeAgo(notification.createdAt)}
            </time>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {notification.type === "message" && <NavLink to={notification.actorId ? `/account/messages?userId=${notification.actorId}` : "/account/messages"} className="rounded font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#92683f]">Open messages</NavLink>}
                {notification.listingId && <NavLink to={`/account/listings/${notification.listingId}`} className="rounded font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#92683f]">View listing</NavLink>}
                {!notification.isRead && <button type="button" onClick={() => onRead(notification.id)} disabled={isUpdating} className="min-h-10 rounded-lg border border-[#d9c6b0] px-3 py-2 font-medium outline-none hover:bg-[#eddfce] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#46494f] dark:hover:bg-[#34302b]">Mark as read</button>}
                <button type="button" onClick={() => onDelete(notification.id)} disabled={isUpdating} aria-label={`Delete notification: ${notification.message}`} className="min-h-10 rounded-lg px-3 py-2 font-medium text-[#843e2e] outline-none hover:bg-[#fff1e8] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#f0aaa6] dark:hover:bg-[#332426]">Delete</button>
            </div>
        </div>
    </article>;
};
