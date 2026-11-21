import { useState } from "react";
import { useDeleteNotificationMutation, useGetNotificationsQuery, useReadAllNotificationsMutation, useReadOneNotificationMutation } from "../../../../store/api/notificationsApi";
import { NotificationCard } from "./NotificationCard";
import { NotificationLoading } from "./NotificationLoading";
import { NotificationError } from "./NotificationError";

export const Notification = () => {
    const [actionError, setActionError] = useState("");
    const { isLoading, isFetching, error, data, refetch } = useGetNotificationsQuery(undefined, {
        refetchOnMountOrArgChange: true
    });
    const [markAllIsRead, allReadResult] = useReadAllNotificationsMutation();
    const [markOneIsRead, oneReadResult] = useReadOneNotificationMutation();
    const [deleteNotification, deleteResult] = useDeleteNotificationMutation();

    const notifications = data?.data || [];
    const unreadCount = notifications.filter(notification => !notification.isRead).length;
    const isUpdating = allReadResult.isLoading || oneReadResult.isLoading || deleteResult.isLoading;

    const handleAllRead = async () => {
        setActionError("");
        try {
            await markAllIsRead().unwrap();
        } catch {
            setActionError("We couldn't mark your notifications as read. Please try again.");
        }
    };

    const handleOneRead = async (id: number) => {
        setActionError("");
        try {
            await markOneIsRead(id).unwrap();
        } catch {
            setActionError("We couldn't mark this notification as read. Please try again.");
        }
    };

    const handleDelete = async (id: number) => {
        setActionError("");
        try {
            await deleteNotification(id).unwrap();
        } catch {
            setActionError("We couldn't delete this notification. Please try again.");
        }
    };

    if (isLoading) return <NotificationLoading />;
    if (error && !data) return <NotificationError onRetry={() => refetch()} />;

    return <section className="w-full min-w-0 font-sans text-[#493429] dark:text-[#e8e6e1]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e9e0d6] pb-5 dark:border-[#34373d]">
            <div>
                <h1>Notifications</h1>
                <p className="mt-2 text-sm text-[#74604e] dark:text-[#aaa69f]" role="status">
                    {unreadCount > 0 ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}` : "You're all caught up"}
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refetch()} disabled={isFetching || isUpdating} className="min-h-11 rounded-xl border border-[#d9c6b0] px-4 py-2 text-sm font-semibold outline-none hover:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#46494f] dark:hover:bg-[#24272b]">
                    {isFetching ? "Refreshing..." : "Refresh"}
                </button>
                <button type="button" onClick={handleAllRead} disabled={unreadCount === 0 || isUpdating || isFetching} className="min-h-11 rounded-xl bg-[#493429] px-4 py-2 text-sm font-semibold text-[#fffcf8] outline-none hover:bg-[#654a37] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#c8a477] dark:text-[#1b1712] dark:hover:bg-[#d7b68e]">
                    {allReadResult.isLoading ? "Marking as read..." : "Mark all as read"}
                </button>
            </div>
        </div>
        {actionError && <p role="alert" className="mb-4 rounded-xl bg-[#fff1e8] p-4 text-sm text-[#843e2e] dark:bg-[#332426] dark:text-[#f0aaa6]">{actionError}</p>}
        {error && <p role="alert" className="mb-4 text-sm text-[#843e2e] dark:text-[#f0aaa6]">We couldn't refresh your notifications. Please try Refresh.</p>}
        {notifications.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d9c6b0] bg-[#f7f0e7] px-5 py-12 text-center dark:border-[#46494f] dark:bg-[#141619]">
            <h2 className="text-lg font-semibold">No notifications yet</h2>
            <p className="mt-2 text-sm text-[#74604e] dark:text-[#aaa69f]">Your new messages and ratings will appear here.</p>
        </div> : <div className="space-y-4">
            {notifications.map(notification => <NotificationCard
                key={notification.id}
                notification={notification}
                isUpdating={isUpdating || isFetching}
                onRead={handleOneRead}
                onDelete={handleDelete}
            />)}
        </div>}
    </section>;
};
