type NotificationErrorProps = {
    onRetry: () => void;
};

export const NotificationError = ({ onRetry }: NotificationErrorProps) => {
    return <div role="alert" className="rounded-2xl border border-[#d9b59b] bg-[#fff1e8] px-5 py-10 text-center text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
        <h2 className="text-lg font-semibold">Unable to load notifications</h2>
        <p className="mt-2 text-sm">Please check your connection and try again.</p>
        <button type="button" onClick={onRetry} className="mt-5 min-h-11 rounded-xl border border-current px-5 py-2 text-sm font-semibold outline-none hover:bg-[#f4dfd0] focus-visible:ring-2 focus-visible:ring-[#92683f] dark:hover:bg-[#48302d]">Try again</button>
    </div>;
};
