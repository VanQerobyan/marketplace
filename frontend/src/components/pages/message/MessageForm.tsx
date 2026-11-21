import { useState, type FormEvent } from "react";

type MessageFormProps = {
    onSend: (content: string) => Promise<void>;
    isConnected: boolean;
};

export const MessageForm = ({ onSend, isConnected }: MessageFormProps) => {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");

    const handleSend = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSending) return;
        setError("");
        if (!content.trim() || content.trim().length > 5000) {
            setError("Write a message between 1 and 5000 characters.");
            return;
        }
        setIsSending(true);
        try {
            await onSend(content.trim());
            setContent("");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Your message could not be sent. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return <form onSubmit={handleSend} className="space-y-3 border-t border-[#e9e0d6] p-4 dark:border-[#34373d]">
        {error && <p role="alert" className="rounded-lg bg-[#fff1e8] p-3 text-sm text-[#843e2e] dark:bg-[#332426] dark:text-[#f0aaa6]">{error}</p>}
        <label className="block text-sm font-semibold">
            Your message
            <textarea value={content} onChange={event => setContent(event.target.value)} disabled={isSending} maxLength={5000} rows={3} placeholder="Write a message..." className="mt-2 block w-full resize-y rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 py-3 text-sm font-normal outline-none focus:border-[#92683f] focus:ring-2 focus:ring-[#92683f]/20 disabled:opacity-60 dark:border-[#46494f] dark:bg-[#141619]" />
        </label>
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#74604e] dark:text-[#aaa69f]">{content.length}/5000</span>
            <button type="submit" disabled={!isConnected || isSending || !content.trim()} className="min-h-11 rounded-xl bg-[#493429] px-6 py-2 text-sm font-semibold text-[#fffcf8] outline-none hover:bg-[#654a37] focus-visible:ring-2 focus-visible:ring-[#92683f] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#c8a477] dark:text-[#1b1712] dark:hover:bg-[#d7b68e]">
                {isSending ? "Sending..." : "Send message"}
            </button>
        </div>
    </form>;
};
