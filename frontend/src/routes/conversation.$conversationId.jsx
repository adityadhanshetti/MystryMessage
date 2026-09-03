import { createFileRoute } from "@tanstack/react-router";

import { useAnonymousConversation } from "../features/conversations/api";

export const Route = createFileRoute("/conversation/$conversationId")({
    component: ConversationPage,
});

function ConversationPage() {
    const { conversationId } = Route.useParams();

    const { data, isLoading, isError } =
        useAnonymousConversation(conversationId);

    if (isLoading) {
        return <p>Loading conversation...</p>;
    }

    if (isError) {
        return (
            <main>
                <h1>Conversation unavailable</h1>
                <p>This anonymous conversation could not be loaded.</p>
            </main>
        );
    }

    const messages = data?.data ?? [];

    return (
        <main>
            <h1>Anonymous Conversation</h1>

            {messages.map((message) => (
                <article key={message.id}>
                    <strong>
                        {message.sender === "anonymous" ? "Anonymous" : "You"}
                    </strong>

                    <p>{message.content}</p>

                    <small>
                        {new Date(message.created_at).toLocaleString()}
                    </small>
                </article>
            ))}
        </main>
    );
}
