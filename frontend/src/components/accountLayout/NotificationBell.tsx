import { NavLink } from "react-router-dom";
import { useGetNotificationsQuery } from "../../../store/api/notificationsApi";

export const NotificationBell = () => {
    const { data } = useGetNotificationsQuery(undefined, { pollingInterval: 10000 });
    const unreadCount = data?.data.filter(notification => !notification.isRead).length || 0;

    return <NavLink
        to="/account/notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative grid size-10 place-items-center rounded-full text-[#74604e] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] motion-reduce:transition-none dark:text-[#aaa69f] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c]"
    >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4" />
        </svg>
        {unreadCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#843e2e] px-1 text-[10px] font-bold text-white ring-2 ring-[#fffdf9] dark:bg-[#c8a477] dark:text-[#1b1712] dark:ring-[#17191c]">
            {unreadCount > 99 ? "99+" : unreadCount}
        </span>}
    </NavLink>;
};
