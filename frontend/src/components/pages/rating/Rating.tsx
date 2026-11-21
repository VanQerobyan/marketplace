import { useState, type FormEvent } from "react";

type RatingProps = {
    onSubmit: (rating: number, comment: string) => Promise<void>;
    isLoading: boolean;
};

export const Rating = ({ onSubmit, isLoading }: RatingProps) => {
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const handleScore = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;
        setError("");
        if (score < 1 || score > 5) {
            setError("Please select a rating from 1 to 5.");
            return;
        }
        try {
            await onSubmit(score, comment.trim());
            setScore(0);
            setComment("");
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "data" in error &&
                typeof error.data === "object" && error.data !== null &&
                "message" in error.data && typeof error.data.message === "string") {
                setError(error.data.message);
            } else {
                setError("We couldn't save your rating. Please try again.");
            }
        }
    };

    return <form onSubmit={handleScore} className="space-y-4 text-[#493429] dark:text-[#e8e6e1]">
        {error && <p role="alert" className="rounded-xl bg-[#fff1e8] p-3 text-sm text-[#843e2e] dark:bg-[#332426] dark:text-[#f0aaa6]">{error}</p>}
        <fieldset disabled={isLoading} className="space-y-4">
            <legend className="mb-3 text-sm font-semibold">Select a rating from 1 to 5</legend>
            <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(value => <button
                    key={value}
                    type="button"
                    aria-label={`${value} out of 5`}
                    aria-pressed={score === value}
                    onClick={() => setScore(value)}
                    className={`min-h-12 rounded-xl border font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:opacity-50 ${score === value ? "border-[#92683f] bg-[#493429] text-[#fffcf8] dark:bg-[#c8a477] dark:text-[#1b1712]" : "border-[#d9c6b0] bg-[#fffdf9] hover:bg-[#f4ebdf] dark:border-[#46494f] dark:bg-[#24272b] dark:hover:bg-[#34302b]"}`}
                >{value} <span aria-hidden="true">★</span></button>)}
            </div>
            <label className="block text-sm font-medium">
                Comment (optional)
                <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={3} placeholder="Share your experience" className="mt-2 block w-full resize-y rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#92683f] focus:ring-2 focus:ring-[#92683f]/20 dark:border-[#46494f] dark:bg-[#141619]" />
            </label>
            <p className="text-right text-xs text-[#74604e] dark:text-[#aaa69f]">{comment.length}/1000</p>
            <button type="submit" disabled={score === 0 || isLoading} className="min-h-11 w-full rounded-xl bg-[#493429] px-5 py-3 text-sm font-semibold text-[#fffcf8] outline-none hover:bg-[#654a37] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#c8a477] dark:text-[#1b1712] dark:hover:bg-[#d7b68e]">
                {isLoading ? "Saving..." : "Submit rating"}
            </button>
        </fieldset>
    </form>;
};
