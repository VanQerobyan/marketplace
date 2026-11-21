import { NavLink } from "react-router-dom";
import type { ListingRating, RatingItems } from "../../../types/ratingType";
import { getTimeAgo } from "../../../utils/GetTimeAgo";

type RatingListProps = {
    items: (RatingItems | ListingRating)[];
    averageRating: number;
    ratingsCount: number;
};

export const RatingList = ({ items, averageRating, ratingsCount }: RatingListProps) => {
    return <div className="space-y-4">
        <p className="text-sm font-semibold text-[#634b38] dark:text-[#c8c4bd]">
            {ratingsCount > 0 ? `${averageRating.toFixed(1)} / 5 · ${ratingsCount} ${ratingsCount === 1 ? "rating" : "ratings"}` : "No ratings yet"}
        </p>
        {items.map(item => <article key={item.id} className="rounded-xl border border-[#e9e0d6] bg-[#f7f0e7] p-4 dark:border-[#34373d] dark:bg-[#24272b]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p aria-label={`${item.rating} out of 5`} className="font-semibold text-[#75502f] dark:text-[#dec099]">{item.rating} / 5 <span aria-hidden="true">★</span></p>
                <NavLink to={`/account/users/${item.raterId}`} className="rounded text-xs underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#92683f]">View reviewer</NavLink>
            </div>
            {item.comment && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{item.comment}</p>}
            <time dateTime={item.createdAt} className="mt-3 block text-xs text-[#74604e] dark:text-[#aaa69f]">{getTimeAgo(item.createdAt)}</time>
        </article>)}
    </div>;
};
