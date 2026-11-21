export const NotificationLoading = () => {
    return <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-[#e9e0d6] bg-[#f7f0e7] p-6 dark:border-[#34373d] dark:bg-[#141619]">
        <div aria-hidden="true" className="size-10 rounded-full border-4 border-[#dfc8ad] border-t-[#493429] motion-safe:animate-spin dark:border-[#46494f] dark:border-t-[#c8a477]" />
        <p className="text-sm text-[#74604e] dark:text-[#aaa69f]">Loading notifications...</p>
    </div>;
};
