import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetAnotherUserQuery } from "../../../../store/api/usersApi";

export const MessageUserSearch = ({ currentUserId }: { currentUserId: number }) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const trimmedSearch = search.trim();

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(trimmedSearch), 300);
        return () => clearTimeout(timeout);
    }, [trimmedSearch]);

    const isDebouncing = trimmedSearch !== debouncedSearch;
    const { currentData: data, isFetching, error, refetch } = useGetAnotherUserQuery(
        debouncedSearch && !isDebouncing ? { search: debouncedSearch, page, limit: 12 } : skipToken
    );
    const users = data?.data.filter(user => user.id !== currentUserId) || [];

    return <div className="mb-5 max-w-xl">
        <label className="block text-sm font-semibold">
            Start a conversation
            <input type="search" value={search} maxLength={101} placeholder="Search by name or username" onChange={event => { setSearch(event.target.value); setPage(1); }} className="mt-2 block min-h-11 w-full rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-sm font-normal outline-none focus:border-[#92683f] focus:ring-2 focus:ring-[#92683f]/20 dark:border-[#46494f] dark:bg-[#141619]" />
        </label>
        {trimmedSearch && <div className="mt-2 rounded-xl border border-[#e9e0d6] p-3 text-sm dark:border-[#34373d]">
            {(isDebouncing || isFetching) ? <p role="status">Searching...</p> : error ? <div role="alert">
                <p>Unable to search users.</p>
                <button type="button" onClick={() => refetch()} className="mt-2 rounded underline">Try again</button>
            </div> : <>
                {users.length === 0 && <p>No other users found.</p>}
                <div className="max-h-56 space-y-1 overflow-y-auto">
                    {users.map(user => <Link key={user.id} to={`/account/messages?userId=${user.id}`} onClick={() => setSearch("")} className="block rounded-lg px-3 py-2 outline-none hover:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-[#92683f] dark:hover:bg-[#24272b]">
                        <span className="font-semibold">{user.firstName} {user.lastName}</span>
                        <span className="ml-2 text-xs text-[#74604e] dark:text-[#aaa69f]">@{user.username}</span>
                    </Link>)}
                </div>
                {data && data.pagination.totalPages > 1 && <div className="mt-3 flex items-center justify-between gap-3">
                    <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-[#d9c6b0] px-3 py-2 disabled:opacity-50 dark:border-[#46494f]">Previous results</button>
                    <span className="text-xs">{page} / {data.pagination.totalPages}</span>
                    <button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-[#d9c6b0] px-3 py-2 disabled:opacity-50 dark:border-[#46494f]">Next results</button>
                </div>}
            </>}
        </div>}
    </div>;
};
