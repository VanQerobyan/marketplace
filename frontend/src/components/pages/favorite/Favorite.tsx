import { NavLink, useNavigate } from "react-router-dom";
import { useDeleteFavoriteListingMutation, useGetFavoritesQuery } from "../../../../store/api/favoritesApi"
import { getTimeAgo } from "../../../utils/GetTimeAgo";

export const Favorite = () => {

    const navigate = useNavigate();

    const { isLoading, error, data } = useGetFavoritesQuery();
    const [deleteFavorite] = useDeleteFavoriteListingMutation();
    
    if (isLoading) return <p className="mx-auto flex min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] px-6 py-10 text-sm font-medium text-[#74604e] before:block before:size-10 before:rounded-full before:border-4 before:border-[#e9e0d6] before:border-r-[#b58b62] before:border-t-[#493429] before:content-[''] motion-safe:before:animate-spin dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#aaa69f] dark:before:border-[#34373d]">Loading favorites...</p>
    if (error) return <p className="mx-auto flex min-h-64 w-full max-w-lg flex-col items-center justify-center gap-4 rounded-3xl border border-[#d9b59b] bg-gradient-to-br from-[#fffdf9] to-[#fff1e8] px-6 py-10 text-center text-sm font-semibold text-[#843e2e] shadow-[0_8px_32px_#49342908] before:grid before:size-12 before:place-items-center before:rounded-full before:bg-[#f4dfd0] before:text-2xl before:font-bold before:content-['!'_/_''] dark:border-[#704b4e] dark:from-[#1b1d20] dark:to-[#332426] dark:text-[#f0aaa6] dark:before:bg-[#48302d]">Unable to load your favorites. Please try again.</p>

    const favorites = data?.data;

     const handleDelete = async (id: number) => {
        try {
            await deleteFavorite(id);
            navigate('/account/favorites')
        } catch (err) {

        }
    }

    return favorites && <>
        <div className="grid w-full min-w-0 grid-cols-1 items-start gap-5 font-sans text-[#493429] before:col-span-full before:mb-1 before:text-2xl before:font-bold before:tracking-tight before:text-[#34251e] before:content-['Your_favorites'] md:grid-cols-2 2xl:grid-cols-3 dark:text-[#e8e6e1] dark:before:text-[#f6f4ef]">
            {favorites.map(favorite => 
                <div key={favorite.id} className="group relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-3 gap-y-3 overflow-hidden rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#fffdf9] to-[#f7f0e7] p-5 shadow-[0_4px_24px_#49342908] transition-[border-color,box-shadow] duration-200 before:pointer-events-none before:absolute before:right-5 before:top-5 before:z-10 before:grid before:size-8 before:place-items-center before:rounded-full before:bg-[#fff1f2] before:text-xl before:font-bold before:text-[#dc2626] before:ring-1 before:ring-[#fecaca] before:shadow-[0_2px_8px_#dc26261a] before:content-['♥︎'_/_''] after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-[3px] after:rounded-b-full after:bg-gradient-to-r after:from-[#b58b62] after:to-[#eddfce] after:content-[''] hover:border-[#b58b62] hover:shadow-[0_12px_36px_#49342912] motion-reduce:transition-none sm:p-6 dark:border-[#34373d] dark:before:bg-[#332329] dark:before:text-[#f08094] dark:before:ring-[#895564] dark:after:to-[#2d3035] dark:from-[#1b1d20] dark:to-[#191b1e] dark:before:shadow-[0_2px_8px_#303338]">
                   <NavLink to={`/account/listings/${favorite.listing?.id}`} className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fffdf9] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20]">
                   
                    <img src ={`http://localhost:5000${favorite.listing?.images[0]}`} className="col-span-2 row-start-1 block aspect-[16/10] w-full min-w-0 rounded-2xl border border-[#e9e0d6] bg-gradient-to-br from-[#f4ebdf] to-[#eddfce] object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none dark:border-[#34373d] dark:from-[#24272b] dark:to-[#2d3035]"></img>
                    <div className="col-span-2 row-start-2 min-w-0 break-words text-lg font-bold leading-snug tracking-tight text-[#34251e] empty:hidden dark:text-[#f6f4ef]">{favorite.listing?.title}</div>
                    <div className="col-start-1 row-start-3 mt-1 min-w-0 break-words text-2xl font-extrabold tracking-tight text-[#493429] empty:hidden sm:text-3xl dark:text-[#e8e6e1]">{favorite.listing?.price}$</div>
                    <div className="col-start-2 row-start-3 mt-1 max-w-24 self-center truncate rounded-full border border-[#dfc8ad] bg-[#f4ebdf] px-2.5 py-1.5 text-[11px] font-semibold text-[#634b38] empty:hidden dark:border-[#46494f] dark:bg-[#24272b] dark:text-[#c8c4bd]">{favorite.listing?.category}</div>
                    <div className="col-span-2 row-start-6 mt-1 min-w-0 break-words border-t border-[#e9e0d6] pt-4 font-mono text-[11px] leading-5 text-[#74604e] empty:hidden before:mb-1 before:block before:font-sans before:text-[9px] before:font-semibold before:tracking-[0.15em] before:content-['LISTED'] dark:border-[#34373d] dark:text-[#aaa69f]">{getTimeAgo(String(favorite.listing?.createdAt))}</div>
                    <div className="col-start-2 row-start-5 self-center text-right text-[11px] font-medium text-[#74604e] empty:hidden before:mr-1 before:text-[#8b6140] before:content-['◉'] after:ml-1 after:content-['views'] dark:text-[#aaa69f] dark:before:text-[#d6b58c]">{favorite.listing?.viewsCount}</div>
                    <div className="col-start-1 row-start-5 w-fit self-center rounded-full border border-[#dfc8ad] bg-[#eddfce] px-2.5 py-1.5 text-[11px] font-semibold capitalize text-[#493429] empty:hidden before:mr-1.5 before:text-[#8b6140] before:content-['●'] dark:border-[#46494f] dark:bg-[#2d3035] dark:text-[#e8e6e1] dark:before:text-[#d6b58c]">{favorite.listing?.status}</div>
                    <div className="col-span-2 row-start-4 mt-1 line-clamp-3 min-w-0 break-words text-sm leading-7 text-[#634b38] empty:hidden dark:text-[#c8c4bd]">{favorite.listing?.description}</div>
                    <div className="col-span-2 row-start-7 min-w-0 break-words font-mono text-[11px] leading-5 text-[#74604e] before:mb-1 before:block before:font-sans before:text-[9px] before:font-semibold before:tracking-[0.15em] before:content-['SAVED_TO_FAVORITES'] dark:text-[#aaa69f]">{getTimeAgo(String(favorite.createdAt))}</div>
                    <button onClick={() => handleDelete(Number(favorite.listing?.id))} className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#493429] shadow-sm outline-none transition-colors before:text-lg before:leading-none before:text-[#dc2626] before:content-['♥︎'_/_''] hover:border-[#f1a9a9] hover:bg-[#fff1f2] hover:text-[#843e2e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#fee2e2] motion-reduce:transition-none sm:w-auto dark:border-[#46494f] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:before:text-[#f08094] dark:hover:border-[#895564] dark:hover:bg-[#332329] dark:hover:text-[#f0aaa6] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#4b2d36]">Remove from favorites</button>
                    </NavLink>
                </div>
            )}
        </div>
    </>
}
