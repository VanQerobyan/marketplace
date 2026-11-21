import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useConfirmPaymentMutation } from "../../../../store/api/paymentsApi";

const PaymentConfirmation = ({ sessionId }: { sessionId: string }) => {
    const [confirmPayment, result] = useConfirmPaymentMutation();

    useEffect(() => {
        // Հաջող լինելը backend-ն ստուգում է Stripe-ից, ոչ թե URL-ից։
        confirmPayment(sessionId);
    }, [sessionId, confirmPayment]);

    return <section className="rounded-2xl border border-[#d9c6b0] p-5 text-[#493429] dark:border-[#46494f] dark:text-[#e8e6e1]">
        <h1 className="text-xl font-semibold">Test payment</h1>
        {(result.isUninitialized || result.isLoading) && <p role="status" className="mt-4">Checking your test payment...</p>}
        {result.isError && <div role="alert" className="mt-4">
            <p>We could not confirm your test payment. A purchase is saved only after confirmation.</p>
            <button type="button" onClick={() => confirmPayment(sessionId)} className="mt-3 min-h-11 rounded-xl border border-[#d9c6b0] px-4 dark:border-[#46494f]">Check again</button>
        </div>}
        {result.data && <div role="status" className="mt-4 space-y-3">
            <p className="font-semibold">Test payment successful!</p>
            <p>{result.data.data.title} — ${(result.data.data.amount / 100).toFixed(2)}</p>
            <p>No real money was charged. Your test purchase has been saved.</p>
            {result.data.data.listingId && <Link to={`/account/listings/${result.data.data.listingId}`} className="block underline">Back to listing</Link>}
        </div>}
        <Link to="/account/purchases" className="mt-5 inline-block underline">My purchases</Link>
    </section>;
};

export const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id") || "";

    if (sessionId.length > 255 || !/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) return <div role="alert" className="space-y-3 text-[#493429] dark:text-[#e8e6e1]">
        <p>This test payment link is invalid.</p>
        <Link to="/account/purchases" className="inline-block underline">My purchases</Link>
    </div>;

    return <PaymentConfirmation key={sessionId} sessionId={sessionId} />;
};
