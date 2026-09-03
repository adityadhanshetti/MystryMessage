import { useState } from "react";

import { getProfileUrl } from "../../lib/profile";

export default function CopyProfileLink({ username }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = getProfileUrl(username);

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
        <button type="button" onClick={handleCopy}>
            {copied ? "Link copied" : "Copy my link"}
        </button>
    );
}
