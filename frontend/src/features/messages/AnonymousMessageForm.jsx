import { useState } from "react";

import { useSendAnonymousMessage } from "./api";
import { Link } from "@tanstack/react-router";

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
                onSuccess: (response) => {
                    const conversation = response.data;

                    localStorage.setItem(
                        `mystry-conversation-${conversation.conversation_id}`,
                        conversation.conversation_token,
                    );

                    setContent("");
                },
            },
        );
    }

    const remaining = MAX_LENGTH - content.length;

    return (
        <>
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
            </form>
            {sendMessage.isSuccess && <p>Your message was sent anonymously.</p>}

            {sendMessage.isError && <p>{sendMessage.error.message}</p>}

            {sendMessage.isSuccess && (
                <div>
                    <p>Message sent anonymously.</p>

                    <Link
                        href={`/conversation/${sendMessage.data.data.conversation_id}`}
                    >
                        View anonymous conversation
                    </Link>
                </div>
            )}
        </>
    );
}
