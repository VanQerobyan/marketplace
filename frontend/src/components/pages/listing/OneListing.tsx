import { Link, useNavigate, useParams } from "react-router-dom";
import { useOneListingQuery } from "../../../../store/api/listingsApi";
import { getTimeAgo } from "../../../utils/GetTimeAgo";
import { getUpdateTime } from "../../../utils/GetUpdateTime";
import { ListingLoading } from "./ListingLoading";
import { ListingError } from "./ListingError";
import { useDeleteFavoriteListingMutation, useGetFavoritesQuery } from "../../../../store/api/favoritesApi";
import { ListingRating } from "../rating/ListingRating";
import { useGetUsersQuery } from "../../../../store/api/usersApi";
import { BuyListing } from "../payment/BuyListing";

export const OneListing = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const { data: currentUser } = useGetUsersQuery();
    const {isLoading, error, data} = useOneListingQuery(String(id), { refetchOnMountOrArgChange: true });
    const [deleteFavorite] = useDeleteFavoriteListingMutation();
    const {data: favoriteData} = useGetFavoritesQuery()
    
    if (isLoading) return <ListingLoading/>
    if (error) return <ListingError/>

    const listing = data?.data;

    const handleDelete = async (id: number) => {
        try {
            await deleteFavorite(id).unwrap();
            navigate('/account/favorites')
        } catch {
            // Keep the listing open when removing the favorite fails.
        }
    }
    const favorites = favoriteData?.data;

    return listing && <>

            <div className="mb-6 min-w-0 break-words border-b border-[#e9e0d6] pb-5 text-2xl font-extrabold leading-tight tracking-tight text-[#34251e] sm:mb-7 sm:text-3xl dark:border-[#34373d] dark:text-[#f6f4ef]">{listing.title}</div>
                    <img src={`http://localhost:5000${listing.images[0]}`} className="block aspect-[4/3] max-h-[28rem] w-full rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#f4ebdf] via-[#fffdf9] to-[#eddfce] object-contain p-6 shadow-[inset_0_2px_16px_#49342903,0_8px_32px_#49342906] sm:aspect-[16/9] sm:p-10 dark:border-[#34373d] dark:from-[#24272b] dark:via-[#1b1d20] dark:to-[#2d3035]"></img>
                <div className="mt-6 text-3xl font-extrabold tracking-tight text-[#493429] sm:mt-7 sm:text-4xl dark:text-[#e8e6e1]">{listing.price}$</div>
                <div className="mt-4 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-[#634b38] [overflow-wrap:anywhere] sm:text-base sm:leading-8 dark:text-[#c8c4bd]">{listing.description}</div>
                <div className="mt-4 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-[#634b38] [overflow-wrap:anywhere] sm:text-base sm:leading-8 dark:text-[#c8c4bd]">{listing.category}</div>
                <div className="mr-3 mt-6 inline-flex min-h-8 items-center rounded-full border border-[#e9e0d6] bg-[#fffcf8] px-3 py-1.5 align-middle text-xs font-medium text-[#74604e] dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#aaa69f]">Listed {getTimeAgo(listing.createdAt)}</div>
                <div className="mr-3 mt-6 inline-flex min-h-8 items-center rounded-full border border-[#e9e0d6] bg-[#fffcf8] px-3 py-1.5 align-middle text-xs font-medium text-[#74604e] dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#aaa69f]">Last updated {getUpdateTime(listing.updatedAt)}</div>
                <div className="mr-3 mt-6 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#e9e0d6] bg-[#f4ebdf] px-3 py-1.5 align-middle text-[11px] font-semibold capitalize tracking-wide text-[#493429] before:size-1.5 before:rounded-full before:bg-[#a27850] before:content-[''] dark:border-[#34373d] dark:bg-[#24272b] dark:text-[#e8e6e1]">{listing.status}</div>
                <div className="mt-6 inline-flex min-h-8 items-center gap-1.5 px-1 py-1.5 align-middle text-xs font-medium text-[#74604e] before:text-sm before:text-[#8b6140] before:content-['◉'] dark:text-[#aaa69f] dark:before:text-[#d6b58c]">{listing.viewsCount}</div>
                <div className="my-6 flex w-full flex-wrap items-center gap-3 border-t border-[#e9e0d6] pt-6 sm:my-7 dark:border-[#34373d]">
               {favorites?.find(favorite => favorite.listingId === listing.id) ?
                <button onClick={() => handleDelete(Number(listing?.id))} className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#493429] shadow-sm outline-none transition-colors before:text-lg before:leading-none before:text-[#dc2626] before:content-['♥︎'_/_''] hover:border-[#f1a9a9] hover:bg-[#fff1f2] hover:text-[#843e2e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#fee2e2] motion-reduce:transition-none sm:w-auto dark:border-[#46494f] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:before:text-[#f08094] dark:hover:border-[#895564] dark:hover:bg-[#332329] dark:hover:text-[#f0aaa6] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#4b2d36]">Remove from favorites</button>
               : ""}
                </div>
        {currentUser && currentUser.data.id !== listing.userId && <Link to={`/account/messages?userId=${listing.userId}&listingId=${listing.id}`} className="inline-flex min-h-11 items-center rounded-xl bg-[#493429] px-5 py-3 text-sm font-semibold text-[#fffcf8] outline-none focus-visible:ring-2 focus-visible:ring-[#92683f] dark:bg-[#c8a477] dark:text-[#1b1712]">Message seller</Link>}
        {currentUser && currentUser.data.id !== listing.userId && <BuyListing key={listing.id} listing={listing} />}
        <ListingRating key={listing.id} listingId={listing.id} ownerId={listing.userId} />
    </>
}
