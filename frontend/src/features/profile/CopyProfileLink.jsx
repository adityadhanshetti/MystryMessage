import { useState } from "react";

export default function CopyProfileLink({ username }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = `${window.location.origin}/${username}`;

        try {
            await navigator.clipboard.writeText(url);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <button onClick={handleCopy}>
            {copied ? "Copied!" : "Copy my link"}
        </button>
    );
}
