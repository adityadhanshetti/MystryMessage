import { useState } from "react";

import { useReplyToMessage } from "./api";

export default function ReplyForm({ messageId, page = 1 }) {
    const [content, setContent] = useState("");

    const reply = useReplyToMessage(page);

    function handleSubmit(event) {
        event.preventDefault();

        const value = content.trim();

        if (!value) {
            return;
        }

        reply.mutate(
            {
                messageId,
                content: value,
            },
            {
                onSuccess: () => {
                    setContent("");
                },
            },
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a reply..."
                maxLength={1000}
                rows={3}
                disabled={reply.isPending}
            />

            <button type="submit" disabled={reply.isPending || !content.trim()}>
                {reply.isPending ? "Sending..." : "Reply"}
            </button>

            {reply.isError && <p>{reply.error.message}</p>}
        </form>
    );
}
