import { useEffect, useId, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Link } from "react-router-dom";
import { useGetAnotherUserQuery } from "../../../store/api/usersApi";
import { useGetListingsQuery } from "../../../store/api/listingsApi";

export const UserSearch = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const resultsId = useId();
  const trimmedSearch = search.trim();
  const isDebouncing = trimmedSearch !== debouncedSearch;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(trimmedSearch), 300);
    return () => clearTimeout(timeout);
  }, [trimmedSearch]);

  const { currentData, isFetching, isError, refetch } = useGetAnotherUserQuery(
    isOpen && debouncedSearch && !isDebouncing
      ? { search: debouncedSearch, page, limit: 12 }
      : skipToken,
  );
  const isPending = isDebouncing || isFetching;
  const {
    currentData: listingsData,
    isFetching: isFetchingListings,
    isError: isListingsError,
    refetch: refetchListings,
  } = useGetListingsQuery(
    isOpen && debouncedSearch && !isDebouncing
      ? { search: debouncedSearch, page: listingsPage, limit: 12 }
      : skipToken,
  );
  const isListingsPending = isDebouncing || isFetchingListings;

  return (
    <div
      role="search"
      aria-label="Find products and users"
      className="relative order-last min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto sm:max-w-md group-has-[a[href='/account/settings/accountInfo']]/settings:sm:max-w-[44rem]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-5.5 size-4 -translate-y-1/2 text-[#74604e] dark:text-[#aaa69f]">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path strokeLinecap="round" d="m16 16 4 4" />
      </svg>
      <input
        type="search"
        aria-label="Search products and users"
        aria-controls={isOpen && trimmedSearch ? resultsId : undefined}
        placeholder="Search products or users..."
        maxLength={101}
        autoComplete="off"
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
          setListingsPage(1);
          setIsOpen(true);
        }}
        className="h-11 w-full rounded-full border border-[#e9e0d6] bg-[#fffdf9] pl-11 pr-4 text-sm placeholder:text-[#74604e] group-has-[a[href='/account/settings/accountInfo']]/settings:h-12 group-has-[a[href='/account/settings/accountInfo']]/settings:rounded-xl group-has-[a[href='/account/settings/accountInfo']]/settings:border-[#d9c6b0] group-has-[a[href='/account/settings/accountInfo']]/settings:text-base dark:group-has-[a[href='/account/settings/accountInfo']]/settings:border-[#46494f] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
      />
      {isOpen && trimmedSearch && (
        <div id={resultsId} className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[60svh] overflow-y-auto rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] shadow-xl dark:border-[#34373d] dark:bg-[#1b1d20]">
          <h2 className="px-4 pt-3 text-sm font-semibold">Products</h2>
          <div role="status" aria-live="polite" className="px-4 py-3 text-sm text-[#74604e] dark:text-[#aaa69f]">
            {isListingsPending ? "Searching products..." : isListingsError ? "Unable to search products. Please try again." : listingsData?.pagination.totalItems ? `${listingsData.pagination.totalItems} products found` : "No products found."}
          </div>
          {!isListingsPending && isListingsError && (
            <button type="button" onClick={() => refetchListings()} className="mx-4 mb-3 rounded-lg border px-3 py-2 text-sm">Try again</button>
          )}
          {!isListingsPending && !isListingsError && listingsData && (
            <>
              <ul aria-label="Matching products" className="divide-y divide-[#e9e0d6] dark:divide-[#34373d]">
                {listingsData.data.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      to={`/account/listings/${listing.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-[#f4ebdf] focus-visible:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#92683f] dark:hover:bg-[#24272b] dark:focus-visible:bg-[#24272b] dark:focus-visible:ring-[#d6b58c]"
                    >
                      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f4ebdf] dark:bg-[#24272b]">
                        {listing.images[0] ? (
                          <img src={`http://localhost:5000${listing.images[0]}`} alt="" className="size-full object-contain" />
                        ) : <span className="text-xs text-[#74604e] dark:text-[#aaa69f]">No photo</span>}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{listing.title}</p>
                        <p className="text-xs text-[#74604e] dark:text-[#aaa69f]">${Number(listing.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {listingsData.pagination.totalPages > 1 && (
                <nav aria-label="Product search pages" className="flex items-center justify-between gap-2 border-t border-[#e9e0d6] px-4 py-3 text-sm dark:border-[#34373d]">
                  <button type="button" disabled={listingsPage === 1} onClick={() => setListingsPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
                  <span>{listingsPage} / {listingsData.pagination.totalPages}</span>
                  <button type="button" disabled={listingsPage >= listingsData.pagination.totalPages} onClick={() => setListingsPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
                </nav>
              )}
            </>
          )}
          <h2 className="border-t border-[#e9e0d6] px-4 pt-3 text-sm font-semibold dark:border-[#34373d]">Users</h2>
          <div role="status" aria-live="polite" className="px-4 py-3 text-sm text-[#74604e] dark:text-[#aaa69f]">
            {isPending ? "Searching..." : isError ? "Unable to search. Please try again." : currentData?.pagination.totalItems ? `${currentData.pagination.totalItems} users found` : "No users found."}
          </div>
          {!isPending && isError && (
            <button type="button" onClick={() => refetch()} className="mx-4 mb-3 rounded-lg border px-3 py-2 text-sm">Try again</button>
          )}
          {!isPending && !isError && currentData && (
            <>
              <ul aria-label="Matching users" className="divide-y divide-[#e9e0d6] dark:divide-[#34373d]">
                {currentData.data.map((user) => (
                  <li key={user.id}>
                    <Link
                      to={`/account/users/${user.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-[#f4ebdf] focus-visible:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#92683f] dark:hover:bg-[#24272b] dark:focus-visible:bg-[#24272b] dark:focus-visible:ring-[#d6b58c]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eddfce] text-sm font-semibold text-[#75502f] dark:bg-[#3b332a] dark:text-[#dec099]">
                        {user.avatar ? (
                          <img src={`http://localhost:5000${user.avatar}`} alt="" className="size-full object-cover" />
                        ) : `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="truncate text-xs text-[#74604e] dark:text-[#aaa69f]">@{user.username}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {currentData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 border-t border-[#e9e0d6] px-4 py-3 text-sm dark:border-[#34373d]">
                  <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
                  <span>{page} / {currentData.pagination.totalPages}</span>
                  <button type="button" disabled={page >= currentData.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
