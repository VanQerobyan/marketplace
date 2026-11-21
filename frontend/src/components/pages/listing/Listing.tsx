import { useRef } from "react";
import { getTimeAgo } from "../../../utils/GetTimeAgo";
import { NavLink, useNavigate } from "react-router-dom";
import { ListingLoading } from "./ListingLoading";
import { ListingError } from "./ListingError";
import { useDeleteListingMutation, useListingStatusUpdateMutation, useMyListingsQuery } from "../../../../store/api/listingsApi";
import { AddListingUtils } from "./ListingUtils/AddListingUtils";
import { useAddListingMutation } from "../../../../store/api/favoritesApi";

export const Listing = () => {

    const navigate = useNavigate();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const statusDialogRefs = useRef(new Map<number, HTMLDialogElement>());

    const {isLoading: listingLoading, error: listingError, data: listingData} = useMyListingsQuery(undefined, { refetchOnMountOrArgChange: true });
    const [addFavorite, result] = useAddListingMutation();
    const [updateStatus] = useListingStatusUpdateMutation();
    const [deleteListing] = useDeleteListingMutation();


    if (listingLoading) return <ListingLoading/>
    if (listingError) return <ListingError/>

    const handleDelete = async (id: string) => {
        await deleteListing(id)
    }

    const handleUpdate = async (id: string, status: string) => {
        await updateStatus({id, status})
    }
    
    return listingData && <>

    <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-4 font-sans text-[#34251e] sm:gap-y-5 dark:text-[#f6f4ef]">
    <button type="button" onClick={() => dialogRef.current?.showModal()} className="mb-2 ml-auto inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-5 py-3 text-sm font-bold text-[#fffcf8] shadow-md shadow-[#b58b62]/25 outline-none transition duration-200 before:text-xl before:font-normal before:leading-none before:content-['＋'] hover:from-[#34251e] hover:to-[#493429] hover:shadow-lg hover:shadow-[#b58b62]/30 focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:px-6 dark:shadow-[#000000]/25 dark:hover:shadow-[#000000]/30 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">Create listing</button>
    {
        listingData.data.map(listing => 
            <div key={listing.id} className="grid w-full min-w-0 grid-cols-2 items-center gap-3 rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] p-4 shadow-[0_3px_18px_#49342904] transition duration-200 hover:border-[#92683f] hover:bg-[#fffcf8] hover:shadow-[0_8px_28px_#4934290a] focus-within:border-[#92683f] motion-reduce:transition-none sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-4 sm:p-5 dark:border-[#34373d] dark:bg-[#1b1d20] dark:hover:border-[#5b554b] dark:hover:bg-[#202327] dark:focus-within:border-[#9f8669]">
                <NavLink to={`${listing.id}`} className="group col-span-2 grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-1 rounded-xl p-1 outline-none focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 sm:col-span-1 sm:col-start-1 sm:row-start-1 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-5 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20]">

                <div className="col-start-2 row-start-1 min-w-0 break-words text-base font-bold leading-snug tracking-tight text-[#34251e] transition-colors group-hover:text-[#493429] motion-reduce:transition-none sm:text-lg dark:text-[#f6f4ef] dark:group-hover:text-[#e8e6e1]">{listing.title}</div>
                    <img src={`http://localhost:5000${listing.images}`} className="z-10 col-start-1 row-start-1 row-span-5 aspect-square h-auto w-full self-center rounded-2xl object-contain p-2 transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"></img>
                <div className="col-start-2 row-start-2 text-base font-extrabold tracking-tight text-[#34251e] sm:text-lg dark:text-[#f6f4ef]">{listing.price}$</div>
                <div className="col-start-2 row-start-3 min-w-0 truncate pt-0.5 text-xs font-medium leading-relaxed text-[#74604e] dark:text-[#aaa69f]">{getTimeAgo(listing.createdAt)}</div>
                <div className="col-start-2 row-start-4 pt-1 text-xs font-medium text-[#74604e] before:mr-1.5 before:align-middle before:text-[10px] before:text-[#8b6140] before:content-['◉'] dark:text-[#aaa69f] dark:before:text-[#d6b58c]">{listing.viewsCount}</div>
                <div className="col-start-1 row-start-1 row-span-5 aspect-square w-full self-center overflow-hidden rounded-2xl border border-[#e9e0d6] bg-gradient-to-br from-[#f4ebdf] to-[#eddfce] p-2 dark:border-[#34373d] dark:from-[#24272b] dark:to-[#2d3035]">
                </div>
                </NavLink>
                    <button type="button" onClick={() => statusDialogRefs.current.get(listing.id)?.showModal()}className="mb-2 ml-auto inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-5 py-3 text-sm font-bold text-[#fffcf8] shadow-md shadow-[#b58b62]/25 outline-none transition duration-200 before:text-xl before:font-normal before:leading-none capitalize hover:from-[#34251e] hover:to-[#493429] hover:shadow-lg hover:shadow-[#b58b62]/30 focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:px-6 dark:shadow-[#000000]/25 dark:hover:shadow-[#000000]/30 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">
                        {listing.status}
                    </button>
                <button onClick={() => addFavorite(String(listing.id))} className={`col-start-2 row-start-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#493429] shadow-sm outline-none transition-colors before:text-lg before:leading-none before:text-[#dc2626] hover:border-[#f1a9a9] hover:bg-[#fff1f2] hover:text-[#843e2e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#fee2e2] motion-reduce:transition-none sm:col-start-3 sm:row-start-2 sm:w-auto sm:px-5 dark:border-[#46494f] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:before:text-[#f08094] dark:hover:border-[#895564] dark:hover:bg-[#332329] dark:hover:text-[#f0aaa6] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#4b2d36] ${result.isSuccess && result.originalArgs === String(listing.id) ? "border-[#f1a9a9] bg-[#fff1f2] before:content-['♥'_/_''] dark:border-[#895564] dark:bg-[#332329]" : "before:content-['♡'_/_'']"}`}></button>

                <button onClick={() => navigate(`/account/listings/${listing.id}/edit`)} className="col-start-1 row-start-2 mt-1 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-[#e9e0d6] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#493429] shadow-sm outline-none transition-colors hover:border-[#92683f] hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] active:bg-[#eddfce] motion-reduce:transition-none sm:col-start-2 sm:row-start-1 sm:mt-0 sm:w-auto sm:px-5 dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:active:bg-[#2d3035]">Edit</button>
                <button onClick={() => handleDelete(String(listing.id))} className="col-start-2 row-start-2 mt-1 inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-[#a27850] bg-[#fffdf9] px-4 py-2 text-sm font-semibold text-[#493429] shadow-sm outline-none transition-colors hover:border-[#92683f] hover:bg-[#f4ebdf] focus-visible:ring-4 focus-visible:ring-[#92683f] active:bg-[#eddfce] motion-reduce:transition-none sm:col-start-3 sm:row-start-1 sm:mt-0 sm:w-auto sm:px-5 dark:border-[#74634f] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:focus-visible:ring-[#d6b58c] dark:active:bg-[#2d3035]">Delete</button>
                <dialog ref={(dialog) => {
                    if (dialog) statusDialogRefs.current.set(listing.id, dialog);
                    else statusDialogRefs.current.delete(listing.id);
                }} className="fixed inset-0 m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#fffdf9] via-[#fffdf9] to-[#f7f0e7] p-6 font-sans text-[#34251e] shadow-[0_24px_80px_-16px_#49342933] backdrop:bg-[#34251e]/35 backdrop:backdrop-blur-sm sm:p-7 dark:border-[#34373d] dark:text-[#f6f4ef] dark:from-[#1b1d20] dark:to-[#191b1e] dark:via-[#1b1d20] dark:backdrop:bg-[#080a0e]/75">
                        <div className="grid gap-3 before:mb-2 before:h-1.5 before:w-12 before:rounded-full before:bg-gradient-to-r before:from-[#493429] before:to-[#654a37] before:content-['']">
                             <button onClick={() => handleUpdate(String(listing.id), "sold")} className={`flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-[#493429] outline-none transition duration-200 before:size-2 before:shrink-0 before:rounded-full before:bg-[#8b6140] before:shadow-[0_0_0_4px_#f4ebdf] before:content-[''] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:before:shadow-[0_0_0_4px_#303338] ${listing.status === "sold" ? "border-[#92683f] bg-[#eddfce] shadow-sm shadow-[#dfc8ad] ring-2 ring-[#92683f] ring-offset-2 after:ml-auto after:text-base after:font-bold after:content-['✓'] hover:bg-[#eddfce] dark:border-[#d6b58c] dark:bg-[#2d3035] dark:shadow-[#000000] dark:ring-[#d6b58c] dark:ring-offset-[#1b1d20] dark:hover:bg-[#2d3035]" : "border-[#e9e0d6] bg-[#f4ebdf]/50 hover:border-[#92683f] hover:bg-[#eddfce]/70 hover:shadow-sm hover:shadow-[#dfc8ad] dark:border-[#34373d] dark:bg-[#24272b]/50 dark:hover:border-[#d6b58c] dark:hover:bg-[#2d3035]/70 dark:hover:shadow-[#000000]"}`}>Sold</button>
                             <button onClick={() => handleUpdate(String(listing.id), "reserved")} className={`flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-[#75502f] outline-none transition duration-200 before:size-2 before:shrink-0 before:rounded-full before:bg-[#b58b62] before:shadow-[0_0_0_4px_#f4e5d2] before:content-[''] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:text-[#dec099] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:before:shadow-[0_0_0_4px_#303338] ${listing.status === "reserved" ? "border-[#a27850] bg-[#ead3b8] shadow-sm shadow-[#dfc8ad] ring-2 ring-[#a27850] ring-offset-2 after:ml-auto after:text-base after:font-bold after:content-['✓'] hover:bg-[#ead3b8] dark:border-[#74634f] dark:bg-[#3c3428] dark:shadow-[#000000] dark:ring-[#74634f] dark:ring-offset-[#1b1d20] dark:hover:bg-[#3c3428]" : "border-[#e9e0d6] bg-[#f7f0e7]/50 hover:border-[#a27850] hover:bg-[#ead3b8]/70 hover:shadow-sm hover:shadow-[#dfc8ad] dark:border-[#34373d] dark:bg-[#111315]/50 dark:hover:border-[#74634f] dark:hover:bg-[#3c3428]/70 dark:hover:shadow-[#000000]"}`}>Reserved</button>
                             <button onClick={() => handleUpdate(String(listing.id), "active")} className={`flex min-h-13 w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-[#493429] outline-none transition duration-200 before:size-2 before:shrink-0 before:rounded-full before:bg-[#654a37] before:shadow-[0_0_0_4px_#e8dccb] before:content-[''] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:before:shadow-[0_0_0_4px_#303338] ${listing.status === "active" ? "border-[#92683f] bg-[#dcc2a4] shadow-sm shadow-[#b58b62]/25 ring-2 ring-[#92683f] ring-offset-2 after:ml-auto after:text-base after:font-bold after:content-['✓'] hover:bg-[#dcc2a4] dark:border-[#d6b58c] dark:bg-[#3b332a] dark:shadow-[#000000]/25 dark:ring-[#d6b58c] dark:ring-offset-[#1b1d20] dark:hover:bg-[#3b332a]" : "border-[#e9e0d6] bg-[#f1e5d6]/50 hover:border-[#a27850] hover:bg-[#dcc2a4]/70 hover:shadow-sm hover:shadow-[#b58b62]/25 dark:border-[#34373d] dark:bg-[#34302b]/50 dark:hover:border-[#74634f] dark:hover:bg-[#3b332a]/70 dark:hover:shadow-[#000000]/25"}`}>Active</button>
                       </div>
                             <button type="button" onClick={() => statusDialogRefs.current.get(listing.id)?.close()} className="mt-5 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#a27850] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#74604e] outline-none transition duration-200 hover:border-[#92683f] hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#eddfce] motion-reduce:transition-none dark:border-[#74634f] dark:bg-[#1b1d20] dark:text-[#aaa69f] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#2d3035]">Close</button>
                </dialog>
            </div>
        )
    }
    {
    <dialog ref={dialogRef} className="fixed inset-0 m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#fffdf9] via-[#fffdf9] to-[#f7f0e7] p-6 font-sans text-[#34251e] shadow-[0_24px_80px_-16px_#49342933] backdrop:bg-[#34251e]/35 backdrop:backdrop-blur-sm sm:p-8 dark:border-[#34373d] dark:text-[#f6f4ef] dark:from-[#1b1d20] dark:to-[#191b1e] dark:via-[#1b1d20] dark:backdrop:bg-[#080a0e]/75">

    <AddListingUtils/>
    <button onClick={() => dialogRef.current?.close()} className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-[#a27850] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#493429] outline-none transition-colors hover:border-[#92683f] hover:bg-[#f4ebdf] hover:text-[#34251e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#eddfce] motion-reduce:transition-none dark:border-[#74634f] dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:hover:text-[#f6f4ef] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#2d3035]">Cancel</button>
    </dialog>
    }
    </div>
    </>
}
