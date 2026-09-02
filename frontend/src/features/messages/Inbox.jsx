import { useInbox, useDeleteMessage, useMarkMessageAsRead } from "./api";

export default function Inbox() {
    const { data, isLoading, isError, error } = useInbox();

    const markAsRead = useMarkMessageAsRead();
    const deleteMessage = useDeleteMessage();

    if (isLoading) {
        return <p>Loading messages...</p>;
    }

    if (isError) {
        return <p>Error: {error.message}</p>;
    }

    const messages = data?.data ?? [];

    if (messages.length === 0) {
        return (
            <div>
                <h2>Your Inbox</h2>
                <p>No anonymous messages yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Your Inbox</h2>

            {messages.map((message) => (
                <article
                    key={message.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: "16px",
                        marginBottom: "12px",
                    }}
                >
                    <p>{message.content}</p>

                    <small>
                        {new Date(message.created_at).toLocaleString()}
                    </small>

                    <div>
                        {!message.is_read && (
                            <button
                                onClick={() => markAsRead.mutate(message.id)}
                            >
                                Mark as read
                            </button>
                        )}

                        <button
                            onClick={() => deleteMessage.mutate(message.id)}
                        >
                            Delete
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}
