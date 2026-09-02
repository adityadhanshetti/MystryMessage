import { useState } from "react";
import { useSendAnonymousMessage } from "./api";

export default function AnonymousMessageForm({ username }) {
  const [content, setContent] = useState("");

  const sendMessage = useSendAnonymousMessage();

  function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    sendMessage.mutate(
      {
        username,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={`Send an anonymous message to @${username}`}
        maxLength={1000}
        rows={5}
      />

      <div>
        {content.length}/1000
      </div>

      <button
        type="submit"
        disabled={
          sendMessage.isPending ||
          !content.trim()
        }
      >
        {sendMessage.isPending
          ? "Sending..."
          : "Send anonymously"}
      </button>

      {sendMessage.isSuccess && (
        <p>Message sent anonymously.</p>
      )}

      {sendMessage.isError && (
        <p>{sendMessage.error.message}</p>
      )}
    </form>
  );
}