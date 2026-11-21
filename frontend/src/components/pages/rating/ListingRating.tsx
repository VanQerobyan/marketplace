import { useAddListingRatingMutation, useGetListingRatingsQuery } from "../../../../store/api/ratingApi";
import { useGetUsersQuery } from "../../../../store/api/usersApi";
import { Rating } from "./Rating";
import { RatingList } from "./RatingList";

type ListingRatingProps = {
    listingId: number;
    ownerId: number;
};

export const ListingRating = ({ listingId, ownerId }: ListingRatingProps) => {
    const { data: userData, error: userError } = useGetUsersQuery();
    const { currentData: data, isFetching, error, refetch } = useGetListingRatingsQuery(listingId);
    const [addListingRating, result] = useAddListingRatingMutation();
    const isOwner = userData?.data.id === ownerId;
    const hasRated = data?.data.items.some(item => item.raterId === userData?.data.id);

    const handleScore = async (rating: number, comment: string) => {
        await addListingRating({ rating, comment, listingId }).unwrap();
    };

    if (isFetching && !data) return <p role="status" className="mt-6 text-sm">Loading ratings...</p>;
    if (error || userError) return <div role="alert" className="mt-6 text-sm text-[#843e2e] dark:text-[#f0aaa6]">
        <p>Unable to load ratings. Please try again.</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded-lg border border-current px-3 py-2">Retry ratings</button>
    </div>;

    return <section className="mt-6 space-y-5 border-t border-[#e9e0d6] pt-6 dark:border-[#34373d]">
        <h2 className="text-lg font-semibold">Listing ratings</h2>
        {data && <RatingList {...data.data} />}
        {isOwner ? <p className="text-sm">You cannot rate your own listing.</p> :
            result.isSuccess ? <p role="status" className="text-sm">Your rating was saved successfully.</p> :
            hasRated ? <p className="text-sm">You have already rated this listing.</p> :
            userData && <div className="max-w-md"><Rating onSubmit={handleScore} isLoading={result.isLoading} /></div>}
    </section>;
};
