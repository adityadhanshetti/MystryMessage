import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSendAnonymousMessage } from "./api";
import { LockIcon, SendIcon, CheckIcon, ArrowRightIcon } from "../../components/icons";
import PromptSuggestions from "./PromptSuggestions";

const MAX_LENGTH = 1000;

export default function AnonymousMessageForm({ username, acceptMessages = true }) {
    const [content, setContent] = useState("");
    const sendMessage = useSendAnonymousMessage();

    if (!acceptMessages) {
        return (
            <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-center">
                <h3 className="font-semibold text-amber-300 text-sm">
                    Messaging Paused
                </h3>
                <p className="text-xs text-amber-400/80 mt-1 max-w-sm mx-auto leading-relaxed">
                    @{username} is currently not accepting new anonymous messages.
                </p>
            </div>
        );
    }

    function handleSubmit(event) {
        event.preventDefault();
        const message = content.trim();

        if (!message) return;

        sendMessage.mutate(
            {
                username,
                content: message,
            },
            {
                onSuccess: (response) => {
                    const conversation = response.data;

                    if (conversation.conversation_id && conversation.conversation_token) {
                        localStorage.setItem(
                            `mystry-conversation-${conversation.conversation_id}`,
                            conversation.conversation_token,
                        );
                    }

                    setContent("");
                },
            },
        );
    }

    const conversationData = sendMessage.data?.data;

    return (
        <div className="space-y-4">
            <PromptSuggestions onSelectPrompt={(prompt) => setContent(prompt)} />

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder={`Send honest feedback or ask a secret question to @${username}...`}
                        maxLength={MAX_LENGTH}
                        rows={5}
                        disabled={sendMessage.isPending}
                        className="w-full surface-input rounded-2xl p-4 text-xs sm:text-sm leading-relaxed resize-none disabled:opacity-50"
                    />

                    <div className="absolute right-3.5 bottom-3.5 text-[10px] text-slate-500 font-mono">
                        {content.length}/{MAX_LENGTH}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <LockIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>100% private • Sender identity is never stored</span>
                    </div>

                    <button
                        type="submit"
                        disabled={sendMessage.isPending || !content.trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl btn-primary text-white font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <SendIcon className="w-3.5 h-3.5" />
                        <span>{sendMessage.isPending ? "Sending..." : "Send Anonymously"}</span>
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {sendMessage.isError && (
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200 text-xs">
                    {sendMessage.error.message || "Failed to deliver message."}
                </div>
            )}

            {/* Success State with conversation thread link */}
            {sendMessage.isSuccess && conversationData && (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs sm:text-sm space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckIcon className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-emerald-300">
                            Message delivered anonymously
                        </p>
                    </div>
                    <p className="text-xs text-emerald-400/80 leading-relaxed">
                        A private thread has been created. If @{username} replies, you can read and continue the conversation anonymously.
                    </p>
                    <div>
                        <Link
                            to="/conversation/$conversationId"
                            params={{
                                conversationId: conversationData.conversation_id,
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
                        >
                            <span>Open Anonymous Thread</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
