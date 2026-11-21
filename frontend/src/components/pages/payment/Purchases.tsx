import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMyPurchasesQuery } from "../../../../store/api/paymentsApi";

export const Purchases = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, error, refetch } = useGetMyPurchasesQuery(page, { refetchOnMountOrArgChange: true });

    return <section className="space-y-5 text-[#493429] dark:text-[#e8e6e1]">
        <div>
            <h1 className="text-xl font-semibold">My purchases</h1>
            <p className="mt-2 text-sm">Your test purchases. No real money is charged.</p>
        </div>
        {isLoading && <p role="status">Loading purchases...</p>}
        {error && <div role="alert" className="space-y-3">
            <p>Unable to load purchases.</p>
            <button type="button" onClick={() => refetch()} className="min-h-11 rounded-xl border border-[#d9c6b0] px-4 dark:border-[#46494f]">Try again</button>
        </div>}
        {data && data.data.length === 0 && <p>No test purchases yet. Open another seller's listing to try a test payment.</p>}
        {data?.data.map(order => <article key={order.id} className="space-y-3 rounded-2xl border border-[#d9c6b0] bg-[#fffdf9] p-5 dark:border-[#46494f] dark:bg-[#24272b]">
            <h2 className="font-semibold">{order.title}</h2>
            <p>${(order.amount / 100).toFixed(2)} USD</p>
            <p className="text-sm">Test payment successful</p>
            <p className="text-xs">{new Date(order.createdAt).toLocaleString()}</p>
            {order.listingId && <Link to={`/account/listings/${order.listingId}`} className="inline-block text-sm underline">View listing</Link>}
        </article>)}
        {data && data.pagination.totalPages > 1 && <div className="flex items-center gap-4 text-sm">
            <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)} className="min-h-11 rounded-xl border border-[#d9c6b0] px-4 disabled:opacity-50 dark:border-[#46494f]">Previous</button>
            <span>{page} / {data.pagination.totalPages}</span>
            <button type="button" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage(page + 1)} className="min-h-11 rounded-xl border border-[#d9c6b0] px-4 disabled:opacity-50 dark:border-[#46494f]">Next</button>
        </div>}
    </section>;
};
