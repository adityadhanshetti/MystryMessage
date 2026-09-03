import { useState } from "react";
import { getProfileUrl } from "../../lib/profile";
import { ShareIcon, CheckIcon } from "../../components/icons";

export default function ShareProfile({ username }) {
    const [status, setStatus] = useState("");

    async function handleShare() {
        setStatus("");
        const url = getProfileUrl(username);
        if (!url) return;

        const shareData = {
            title: `@${username} on Mystry Message`,
            text: `Send me an anonymous message or AMA question on Mystry Message!`,
            url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if (err?.name === "AbortError") return;
            }
        }

        // Fallback: clipboard copy
        try {
            await navigator.clipboard.writeText(url);
            setStatus("copied");
            setTimeout(() => setStatus(""), 2000);
        } catch {
            setStatus("error");
        }
    }

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-white text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]"
            >
                {status === "copied" ? (
                    <>
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>Link copied to clipboard</span>
                    </>
                ) : (
                    <>
                        <ShareIcon className="w-3.5 h-3.5" />
                        <span>Share Profile</span>
                    </>
                )}
            </button>
            {status === "error" && (
                <p className="text-[11px] text-red-400 mt-1 text-center">
                    Unable to trigger share. Please copy the link directly.
                </p>
            )}
        </div>
    );
}
