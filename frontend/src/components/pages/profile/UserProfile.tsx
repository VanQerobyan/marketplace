import { skipToken } from "@reduxjs/toolkit/query/react";
import { Link, NavLink, useParams } from "react-router-dom";
import { useGetUsersQuery, useUserByIdQuery } from "../../../../store/api/usersApi";
import { useGetUserListingQuery } from "../../../../store/api/listingsApi";
import { getTimeAgo } from "../../../utils/GetTimeAgo";
import { useAddListingMutation } from "../../../../store/api/favoritesApi";
import { UserRating } from "../rating/UserRating";

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useGetUsersQuery();
  const isValidId = Boolean(id && /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0 && Number(id) <= 2147483647);
  const { currentData, isFetching, error, refetch } = useUserByIdQuery(
    isValidId && id ? id : skipToken,
  );

  const {isLoading, error: listingError, data} = useGetUserListingQuery(isValidId && id ? id : skipToken);
  const [addfavorite] = useAddListingMutation();
  if (isLoading)return <p className="mx-auto flex min-h-40 w-full max-w-4xl animate-pulse items-center justify-center rounded-2xl border border-[#e9e0d6] bg-[#f7f0e7] px-6 py-10 text-sm font-medium tracking-wide text-[#74604e] motion-reduce:animate-none dark:border-[#34373d] dark:bg-[#24272b] dark:text-[#aaa69f]">IsLoading</p> 
  if (listingError)return <p className="mx-auto flex min-h-40 w-full max-w-4xl items-center justify-center rounded-2xl border border-[#d9b59b] bg-[#fff1e8] px-6 py-10 text-center text-sm font-semibold text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">Error</p>

  if (isFetching && !currentData) {
    return <p role="status" className="py-10 text-center">Loading profile...</p>;
  }


  const isNotFound = !isValidId || (error && "status" in error && error.status === 404);
  const user = currentData?.data;


  if (isNotFound || error || !user) {
    return (
      <div role="alert" className="space-y-4 rounded-2xl border border-[#e9e0d6] p-6 text-center dark:border-[#34373d]">
        <h1 className="text-xl font-bold tracking-tight text-[#34251e] sm:text-2xl dark:text-[#f6f4ef]">{isNotFound ? "User not found" : "Unable to load this profile"}</h1>
        <p className="text-sm text-[#74604e] dark:text-[#aaa69f]">
          {isNotFound ? "This profile is unavailable. Search for another user above." : "Please try again."}
        </p>
        {!isNotFound && (
          <button type="button" onClick={() => refetch()} className="rounded-xl border border-[#d9c6b0] px-4 py-2 text-sm dark:border-[#46494f]">
            Try again
          </button>
        )}
      </div>
    );
  }
  return data && <>

    <article className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] dark:border-[#34373d] dark:bg-[#1b1d20]">
      <div aria-hidden="true" className="h-32 bg-gradient-to-br from-[#f4ebdf] via-[#dfc8ad] to-[#b58b62] sm:h-40 dark:from-[#24272b] dark:via-[#3b3935] dark:to-[#1b2026]" />
      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative -mt-12 grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-[#fffdf9] bg-[#f4ebdf] text-2xl font-bold text-[#75502f] sm:size-28 dark:border-[#1b1d20] dark:bg-[#24272b] dark:text-[#dec099]">
            {user.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt={`${user.firstName} ${user.lastName}`} className="size-full object-cover" />
            ) : (
              <span aria-label="No profile photo">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
            )}
          </div>
          <Link to="/account/profile" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#493429] shadow-sm shadow-[#b58b62]/10 outline-none transition duration-200 before:text-lg before:font-normal before:leading-none before:text-[#92683f] before:content-['←'] hover:border-[#a27850] hover:bg-[#f4ebdf] hover:shadow-md focus-visible:ring-4 focus-visible:ring-[#92683f]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf9] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:mb-1 sm:w-auto dark:border-[#74634f] dark:bg-[#24272b] dark:text-[#dec099] dark:shadow-[#000000]/10 dark:before:text-[#dec099] dark:hover:border-[#c8a477] dark:hover:bg-[#3b332a] dark:focus-visible:ring-[#d6b58c]/30 dark:focus-visible:ring-offset-[#1b1d20]">
            My profile
          </Link>
        </div>
        <h1 className="break-words text-2xl font-extrabold leading-tight tracking-tight text-[#34251e] sm:text-3xl dark:text-[#f6f4ef]">{user.firstName} {user.lastName}</h1>
        <p className="mt-1 text-sm text-[#74604e] dark:text-[#aaa69f]">@{user.username}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#f7f0e7] p-4 dark:bg-[#24272b]">
            <dt className="text-sm text-[#74604e] dark:text-[#aaa69f]">Average rating</dt>
            <dd className="mt-1 font-semibold">{user.ratingsCount > 0 ? `${user.averageRating.toFixed(1)} / 5` : "No ratings yet"}</dd>
          </div>
          <div className="rounded-xl bg-[#f7f0e7] p-4 dark:bg-[#24272b]">
            <dt className="text-sm text-[#74604e] dark:text-[#aaa69f]">Ratings</dt>
            <dd className="mt-1 font-semibold">{user.ratingsCount}</dd>
          </div>
          <div className="rounded-xl bg-[#f7f0e7] p-4 dark:bg-[#24272b]">
            <dt className="text-sm text-[#74604e] dark:text-[#aaa69f]">Member since</dt>
            <dd className="mt-1 font-semibold"><time dateTime={user.createdAt}>{new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</time></dd>
          </div>
        </dl>
      </div>
    </article>
    {currentUser && currentUser.data.id !== user.id && <Link to={`/account/messages?userId=${user.id}`} className="mx-auto mt-5 block w-fit rounded-xl bg-[#493429] px-5 py-3 text-sm font-semibold text-[#fffcf8] outline-none focus-visible:ring-2 focus-visible:ring-[#92683f] dark:bg-[#c8a477] dark:text-[#1b1712]">Message user</Link>}
    <UserRating key={user.id} userId={user.id} />


          <div className="mx-auto mt-6 grid w-full max-w-4xl min-w-0 grid-cols-1 gap-4 font-sans sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {data.data.map(listing => 
              <div key={listing.id} className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-3 gap-y-2 overflow-hidden rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] p-4 text-[#493429] shadow-[0_3px_18px_#49342906] transition duration-200 hover:-translate-y-1 hover:border-[#c8a477] hover:shadow-[0_12px_30px_#4934290d] motion-reduce:transform-none motion-reduce:transition-none dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:shadow-[0_3px_18px_#00000014] dark:hover:border-[#74634f] dark:hover:shadow-[0_12px_30px_#00000026]">
                <NavLink to={`/account/listings/${listing.id}`} className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-3 gap-y-2 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-[#92683f]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf9] dark:focus-visible:ring-[#d6b58c]/40 dark:focus-visible:ring-offset-[#1b1d20]">
                <div className="col-span-2 row-start-2 line-clamp-2 min-h-6 break-words text-base font-bold leading-snug tracking-tight text-[#34251e] sm:text-lg dark:text-[#f6f4ef]">{listing.title}</div>
                <div className="col-start-1 row-start-3 self-center text-xl font-extrabold tracking-tight text-[#75502f] dark:text-[#dec099]">{listing.price}$</div>
                <div className="col-span-2 row-start-1 -mx-4 -mt-4 mb-2 aspect-[4/3] overflow-hidden border-b border-[#e9e0d6] bg-gradient-to-br from-[#f7f0e7] to-[#eddfce] dark:border-[#34373d] dark:from-[#24272b] dark:to-[#2d3035]"><img src={`http://localhost:5000${listing.images[0]}`} className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"></img></div>
                <div className="col-span-2 row-start-4 min-w-0 truncate pt-1 text-xs font-medium uppercase tracking-wider text-[#74604e] dark:text-[#aaa69f]">{listing.category}</div>
                <div className="col-start-2 row-start-3 inline-flex max-w-full items-center gap-1.5 self-center rounded-full border border-[#e0ccb4] bg-[#f4ebdf] px-2.5 py-1 text-[10px] font-semibold capitalize tracking-wide text-[#75502f] before:size-1.5 before:shrink-0 before:rounded-full before:bg-[#a27850] before:content-[''] dark:border-[#5b4c3a] dark:bg-[#3b332a] dark:text-[#dec099] dark:before:bg-[#c8a477]">{listing.status}</div>
                <div className="col-span-2 row-start-5 mt-2 border-t border-[#e9e0d6] pt-3 text-xs font-medium text-[#8a7765] dark:border-[#34373d] dark:text-[#93969d]">{getTimeAgo(listing.createdAt)}</div>
              </NavLink>
              {currentUser && currentUser.data.id !== user.id && <Link to={`/account/messages?userId=${user.id}&listingId=${listing.id}`} className="col-span-2 mt-1 rounded-xl border border-[#d9c6b0] px-4 py-3 text-center text-sm font-semibold outline-none hover:bg-[#f4ebdf] focus-visible:ring-2 focus-visible:ring-[#92683f] dark:border-[#46494f] dark:hover:bg-[#24272b]">Message about this listing</Link>}
              <button onClick={() => addfavorite(String(listing.id))} className="col-span-2 mt-1 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e0ccb4] bg-[#f4ebdf] px-4 py-2.5 text-sm font-semibold text-[#75502f] outline-none transition-colors before:text-lg before:leading-none before:text-[#a27850] before:content-['♡'] hover:border-[#c49b83] hover:bg-[#eddfce] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f]/30 active:bg-[#dfc8ad] motion-reduce:transition-none dark:border-[#5b4c3a] dark:bg-[#3b332a] dark:text-[#dec099] dark:before:text-[#dec099] dark:hover:border-[#9f8669] dark:hover:bg-[#4b4033] dark:focus-visible:ring-[#d6b58c]/40 dark:active:bg-[#5b4c3a]">Add my Favorites</button>
              </div>
            )}
          </div>
  </>
};
