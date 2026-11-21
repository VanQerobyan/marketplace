export type GoogleIdentity = {
    initialize: (options: {
        client_id: string;
        nonce: string;
        auto_select: boolean;
        callback: (response: { credential: string }) => void;
    }) => void;
    renderButton: (element: HTMLElement, options: {
        type: "standard";
        theme: "outline";
        size: "large";
        text: "continue_with";
        shape: "pill";
        width: number;
    }) => void;
};

declare global {
    interface Window {
        google?: { accounts: { id: GoogleIdentity } };
    }
}

let loading: Promise<GoogleIdentity> | undefined;

export const loadGoogleIdentity = (): Promise<GoogleIdentity> => {
    if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
    if (loading) return loading;

    loading = new Promise<GoogleIdentity>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        const fail = () => {
            clearTimeout(timeout);
            script.remove();
            reject(new Error("Google sign-in could not load. Please try again."));
        };
        const timeout = setTimeout(fail, 15000);
        script.onerror = fail;
        script.onload = () => {
            clearTimeout(timeout);
            if (window.google?.accounts.id) resolve(window.google.accounts.id);
            else fail();
        };
        document.head.append(script);
    }).catch((error: unknown) => {
        loading = undefined;
        throw error;
    });
    return loading;
};

export const createGoogleNonce = () => Array.from(
    crypto.getRandomValues(new Uint8Array(32)),
    (byte) => byte.toString(16).padStart(2, "0"),
).join("");
