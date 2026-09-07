import { useState } from "react";
import { getProfileUrl } from "../../lib/profile";
import { CopyIcon, CheckIcon } from "../../components/icons";

export default function CopyProfileLink({ username }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = getProfileUrl(username);
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl btn-secondary text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]"
        >
            {copied ? (
                <>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Link copied to clipboard</span>
                </>
            ) : (
                <>
                    <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Profile Link</span>
                </>
            )}
        </button>
    );
}
