import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useAddUserRatingMutation, useGetUserRatingQuery } from "../../../../store/api/ratingApi";
import { usersApi, useGetUsersQuery } from "../../../../store/api/usersApi";
import { Rating } from "./Rating";
import { RatingList } from "./RatingList";

export const UserRating = ({ userId }: { userId: number }) => {
    const scoreRef = useRef<HTMLDialogElement>(null);
    const dispatch = useDispatch();
    const { data: userData, error: userError } = useGetUsersQuery();
    const { currentData: data, isFetching, error, refetch } = useGetUserRatingQuery(String(userId));
    const [addUserRating, result] = useAddUserRatingMutation();
    const isOwnProfile = userData?.data.id === userId;
    const hasRated = data?.data.items.some(item => item.raterId === userData?.data.id);

    const handleScore = async (rating: number, comment: string) => {
        await addUserRating({ rating, comment, userId: String(userId) }).unwrap();
        dispatch(usersApi.util.invalidateTags(["usersData"]));
    };

    if (isFetching && !data) return <p role="status" className="mt-6 text-sm">Loading ratings...</p>;
    if (error || userError) return <div role="alert" className="mt-6 text-sm text-[#843e2e] dark:text-[#f0aaa6]">
        <p>Unable to load ratings. Please try again.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded-lg border border-current px-3 py-2">Retry ratings</button>
    </div>;

    return <section className="mx-auto mt-6 w-full max-w-4xl space-y-4 border-t border-[#e9e0d6] pt-6 dark:border-[#34373d]">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">User ratings</h2>
            {data && !isOwnProfile && !hasRated && !result.isSuccess && userData && <button type="button" onClick={() => scoreRef.current?.showModal()} className="min-h-11 rounded-xl bg-[#493429] px-5 py-2 text-sm font-semibold text-[#fffcf8] dark:bg-[#c8a477] dark:text-[#1b1712]">Rate user</button>}
        </div>
        {isOwnProfile && <p className="text-sm">You cannot rate yourself.</p>}
        {hasRated && <p className="text-sm">You have already rated this user.</p>}
        {data && <RatingList {...data.data} />}
        <dialog ref={scoreRef} aria-labelledby="user-rating-title" className="fixed inset-0 m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] p-5 text-[#493429] shadow-xl backdrop:bg-black/40 sm:p-6 dark:border-[#34373d] dark:bg-[#1b1d20] dark:text-[#e8e6e1]">
            <h2 id="user-rating-title" className="mb-5 text-xl font-semibold">Rate this user</h2>
            {result.isSuccess ? <p role="status">Your rating was saved successfully.</p> : hasRated ? <p>You have already rated this user.</p> : <Rating onSubmit={handleScore} isLoading={result.isLoading} />}
            <button type="button" onClick={() => scoreRef.current?.close()} disabled={result.isLoading} className="mt-4 min-h-11 w-full rounded-xl border border-[#d9c6b0] px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-[#46494f]">Close</button>
        </dialog>
    </section>;
};
