import { useState } from "react";

import { getProfileUrl } from "../../lib/profile";

export default function ShareProfile({ username }) {
    const [error, setError] = useState("");

    async function handleShare() {
        setError("");

        const url = getProfileUrl(username);

        const shareData = {
            title: "My Mystry Message",
            text: `Send me an anonymous message on Mystry Message.`,
            url,
        };

        if (!navigator.share) {
            try {
                await navigator.clipboard.writeText(url);
                return;
            } catch {
                setError("Unable to share profile.");
                return;
            }
        }

        try {
            await navigator.share(shareData);
        } catch (err) {
            // User cancelled the native share dialog.
            if (err?.name !== "AbortError") {
                setError("Unable to share profile.");
            }
        }
    }

    return (
        <div>
            <button type="button" onClick={handleShare}>
                Share my profile
            </button>

            {error && <p>{error}</p>}
        </div>
    );
}
