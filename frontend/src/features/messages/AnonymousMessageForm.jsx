import { useState } from "react";

import { useSendAnonymousMessage } from "./api";

const MAX_LENGTH = 1000;

export default function AnonymousMessageForm({ username }) {
    const [content, setContent] = useState("");

    const sendMessage = useSendAnonymousMessage();

    function handleSubmit(event) {
        event.preventDefault();

        const message = content.trim();

        if (!message) {
            return;
        }

        sendMessage.mutate(
            {
                username,
                content: message,
            },
            {
                onSuccess: () => {
                    setContent("");
                },
            },
        );
    }

    const remaining = MAX_LENGTH - content.length;

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write something..."
                maxLength={MAX_LENGTH}
                rows={6}
                disabled={sendMessage.isPending}
            />

            <div>
                <span>
                    {content.length}/{MAX_LENGTH}
                </span>
            </div>

            <button
                type="submit"
                disabled={sendMessage.isPending || !content.trim()}
            >
                {sendMessage.isPending ? "Sending..." : "Send anonymously"}
            </button>

            {sendMessage.isSuccess && <p>Your message was sent anonymously.</p>}

            {sendMessage.isError && <p>{sendMessage.error.message}</p>}
        </form>
    );
}
