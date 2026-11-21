import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCreateCheckoutMutation, useGetPaymentConfigQuery } from "../../../../store/api/paymentsApi";
import type { Listing } from "../../../types/listingType";

export const BuyListing = ({ listing }: { listing: Listing }) => {
    const [params] = useSearchParams();
    const { data, isLoading, error, refetch } = useGetPaymentConfigQuery();
    const [createCheckout, result] = useCreateCheckoutMutation();
    const [paymentError, setPaymentError] = useState("");
    const price = Number(listing.price);
    const validPrice = price >= 0.50 && price <= 999999.99;

    const handleBuy = async () => {
        if (result.isLoading) return;
        setPaymentError("");
        try {
            const response = await createCheckout(listing.id).unwrap();
            // Stripe-ի պատրաստի էջն է բացվում. քարտի տվյալները մեր կայքը չի պահում։
            window.location.assign(response.data.url);
        } catch {
            setPaymentError("Unable to open test checkout. Please try again.");
        }
    };

    return <section aria-label="Test purchase" className="my-6 rounded-2xl border border-[#d9c6b0] bg-[#f7f0e7] p-5 text-sm text-[#493429] dark:border-[#46494f] dark:bg-[#24272b] dark:text-[#e8e6e1]">
        <h2 className="font-semibold">Try a test purchase</h2>
        <p className="mt-2">Use a test card. No real money is charged.</p>
        {params.get("payment") === "cancelled" && <p role="status" className="mt-3">Test checkout was cancelled. You can try again.</p>}
        {isLoading && <p role="status" className="mt-3">Loading test checkout...</p>}
        {error && <div role="alert" className="mt-3">
            <p>Unable to load test checkout.</p>
            <button type="button" onClick={() => refetch()} className="mt-2 underline">Try again</button>
        </div>}
        {data && !data.data.enabled && <p role="status" className="mt-3">Test payments are not available yet.</p>}
        {data?.data.enabled && <>
            <p className="mt-3 text-xs">Test card: 4242 4242 4242 4242. Use a future expiry date and any 3-digit CVC.</p>
            {listing.status !== "active" && <p className="mt-3">This listing is unavailable for purchase.</p>}
            {!validPrice && <p className="mt-3">Test checkout supports prices from $0.50 to $999,999.99.</p>}
            <button type="button" onClick={handleBuy} disabled={result.isLoading || listing.status !== "active" || !validPrice} className="mt-4 min-h-11 rounded-xl bg-[#493429] px-5 py-3 font-semibold text-[#fffcf8] outline-none focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#c8a477] dark:text-[#1b1712]">
                {result.isLoading ? "Opening test checkout..." : "Buy (test)"}
            </button>
        </>}
        {paymentError && <p role="alert" className="mt-3 text-[#843e2e] dark:text-[#f0aaa6]">{paymentError}</p>}
    </section>;
};
