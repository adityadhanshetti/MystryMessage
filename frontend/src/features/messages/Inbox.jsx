import { useState } from "react";

import {
    useInbox,
    useUnreadCount,
    useDeleteMessage,
    useMarkMessageAsRead,
} from "./api";

export default function Inbox() {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error, isFetching } = useInbox(page);

    const { data: unreadData } = useUnreadCount();

    const markAsRead = useMarkMessageAsRead();

    const deleteMessage = useDeleteMessage(page);

    if (isLoading) {
        return <p>Loading messages...</p>;
    }

    if (isError) {
        return <p>Error: {error.message}</p>;
    }

    const messages = data?.data ?? [];
    const unreadCount = unreadData?.data?.count ?? 0;

    const hasNextPage = messages.length === 20;

    const hasPreviousPage = page > 1;

    return (
        <section>
            <header>
                <h1>Inbox</h1>

                <span>{unreadCount} unread</span>
            </header>

            {messages.length === 0 ? (
                <div>
                    <h2>No messages yet</h2>

                    <p>
                        Share your Mystry Message link to start receiving
                        anonymous messages.
                    </p>
                </div>
            ) : (
                <>
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

                            {!message.is_read && <strong>New</strong>}

                            <div>
                                {!message.is_read && (
                                    <button
                                        onClick={() =>
                                            markAsRead.mutate(message.id)
                                        }
                                        disabled={markAsRead.isPending}
                                    >
                                        Mark as read
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        deleteMessage.mutate(message.id)
                                    }
                                    disabled={deleteMessage.isPending}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}

                    <div>
                        <button
                            disabled={!hasPreviousPage || isFetching}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Previous
                        </button>

                        <span>Page {page}</span>

                        <button
                            disabled={!hasNextPage || isFetching}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
