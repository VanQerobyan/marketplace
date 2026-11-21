import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGoogleConfigQuery, useGoogleSignInMutation } from "../../../store/api/authApi";
import { credentialsReceived } from "../../../store/authSlice";
import { createGoogleNonce, loadGoogleIdentity } from "../../utils/googleIdentity";

type GoogleCredential = { credential: string; nonce: string };

export const GoogleSignIn = () => {
    const { data, isLoading: configLoading, isError: configError, refetch } = useGoogleConfigQuery();
    const [signIn, { isLoading }] = useGoogleSignInMutation();
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [pendingLink, setPendingLink] = useState<GoogleCredential | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const mounted = useRef(false);
    const sending = useRef(false);
    const passwordId = useId();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const clientId = data?.data.clientId;

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const completeSignIn = useCallback(async (payload: GoogleCredential & { password?: string }) => {
        if (sending.current) return;
        sending.current = true;
        setError("");
        try {
            const result = await signIn(payload).unwrap();
            if (!mounted.current) return;
            dispatch(credentialsReceived(result.data));
            navigate("/account/profile", { replace: true });
        } catch (reason: unknown) {
            if (!mounted.current) return;
            const failure = typeof reason === "object" && reason !== null && "data" in reason &&
                typeof reason.data === "object" && reason.data !== null ? reason.data : null;
            setError(failure && "message" in failure && typeof failure.message === "string"
                ? failure.message : "Unable to sign in with Google. Please try again.");
            const needsPassword = failure && "errors" in failure && Array.isArray(failure.errors) &&
                failure.errors.some((item: unknown) => typeof item === "object" && item !== null &&
                    "code" in item && item.code === "GOOGLE_LINK_REQUIRED");
            setPendingLink(needsPassword ? { credential: payload.credential, nonce: payload.nonce } : null);
        } finally {
            sending.current = false;
            if (passwordRef.current) passwordRef.current.value = "";
        }
    }, [signIn, dispatch, navigate]);

    useEffect(() => {
        if (!clientId) return;
        let active = true;
        const container = buttonRef.current;
        const nonce = createGoogleNonce();

        void loadGoogleIdentity().then((google) => {
            if (!active || !container) return;
            google.initialize({
                client_id: clientId,
                nonce,
                auto_select: false,
                callback: ({ credential }) => {
                    if (active) void completeSignIn({ credential, nonce });
                },
            });
            google.renderButton(container, {
                type: "standard", theme: "outline", size: "large", text: "continue_with",
                shape: "pill", width: Math.min(container.clientWidth || 300, 400),
            });
            setReady(true);
        }).catch(() => {
            if (active) setError("Google sign-in could not load. Please try again.");
        });

        return () => {
            active = false;
            container?.replaceChildren();
        };
    }, [clientId, attempt, completeSignIn]);

    const connectAccount = () => {
        const password = passwordRef.current?.value;
        if (pendingLink && password) void completeSignIn({ ...pendingLink, password });
        else passwordRef.current?.focus();
    };

    const retry = () => {
        setError("");
        setReady(false);
        setPendingLink(null);
        if (configError) void refetch();
        else setAttempt((value) => value + 1);
    };

    return <div className="order-20 mt-5 w-full border-t border-[#d9c6b0] pt-5 dark:border-[#46494f]">
        <p className="mb-3 text-center text-xs text-[#74604e] dark:text-[#aaa69f]">Or continue with Google</p>
        <div ref={buttonRef} className={isLoading || pendingLink ? "hidden" : "flex min-h-11 w-full justify-center"} />
        {(configLoading || (clientId && !ready && !error)) && <p role="status" className="text-center text-sm">Loading Google sign-in…</p>}
        {isLoading && <p role="status" className="text-center text-sm">Signing in…</p>}
        {!configLoading && !configError && !clientId && <button type="button" disabled className="min-h-11 w-full rounded-full border border-[#d9c6b0] px-4 text-sm opacity-60 dark:border-[#46494f]">Google sign-in is currently unavailable</button>}
        {pendingLink && <div className="space-y-3 text-sm">
            <label htmlFor={passwordId} className="block">Existing account password</label>
            <input id={passwordId} ref={passwordRef} type="password" autoComplete="current-password" disabled={isLoading}
                className="min-h-11 w-full rounded-xl border border-[#a27850] px-3 dark:bg-[#141619]" onKeyDown={(event) => {
                    if (event.key === "Enter") { event.preventDefault(); connectAccount(); }
                }} />
            <button type="button" disabled={isLoading} onClick={connectAccount}
                className="min-h-11 w-full rounded-full border border-[#a27850] px-4 disabled:opacity-60">Connect Google and sign in</button>
        </div>}
        {(error || configError) && <div className="mt-3 text-center text-sm">
            <p role="alert" className="text-[#843e2e] dark:text-[#f0aaa6]">{error || "Google sign-in is unavailable. Please try again."}</p>
            <button type="button" onClick={retry} className="mt-2 min-h-10 rounded-lg border border-[#d9c6b0] px-4 dark:border-[#46494f]">{pendingLink ? "Choose another Google account" : "Try again"}</button>
        </div>}
    </div>;
};
