import { createFileRoute, Link } from "@tanstack/react-router";
import {
    useAnonymousConversation,
    useSendAnonymousConversationMessage,
} from "../features/conversations/api";
import { useState, useRef, useEffect } from "react";
import { LockIcon, SendIcon, ShieldCheckIcon } from "../components/icons";

export const Route = createFileRoute("/conversation/$conversationId")({
    component: ConversationPage,
});

function ConversationPage() {
    const { conversationId } = Route.useParams();
    const [content, setContent] = useState("");
    const messagesEndRef = useRef(null);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem(`mystry-conversation-${conversationId}`)
            : null;

    const conversation = useAnonymousConversation(conversationId);
    const sendMessage = useSendAnonymousConversationMessage(conversationId);

    const messages = conversation.data?.data ?? [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    function handleSubmit(event) {
        event.preventDefault();
        const value = content.trim();

        if (!value || sendMessage.isPending) return;

        sendMessage.mutate(value, {
            onSuccess: () => {
                setContent("");
            },
        });
    }

    if (!token) {
        return (
            <main className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                    <LockIcon className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">
                    Access Token Required
                </h1>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    This private conversation can only be accessed on the browser
                    from which the initial message was sent.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold"
                >
                    Return to Homepage
                </Link>
            </main>
        );
    }

    if (conversation.isLoading) {
        return (
            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="surface-panel p-6 rounded-2xl space-y-4 animate-pulse">
                    <div className="h-4 w-32 bg-slate-800 rounded" />
                    <div className="h-14 bg-slate-800/60 rounded-xl w-2/3" />
                    <div className="h-14 bg-slate-800/60 rounded-xl w-1/2 ml-auto" />
                </div>
            </main>
        );
    }

    if (conversation.isError) {
        return (
            <main className="max-w-md mx-auto px-4 py-20 text-center">
                <h1 className="text-xl font-bold text-white mb-2">
                    Thread Unavailable
                </h1>
                <p className="text-xs text-slate-400 mb-6">
                    {conversation.error.message ||
                        "This conversation thread is no longer accessible."}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-secondary text-xs"
                >
                    Return to Homepage
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-tight">
                            Anonymous Conversation
                        </h1>
                        <p className="text-[11px] text-slate-400">
                            Your identity is encrypted and strictly anonymous
                        </p>
                    </div>
                </div>

                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                    {messages.length} {messages.length === 1 ? "message" : "messages"}
                </span>
            </div>

            {/* Chat Box */}
            <div className="surface-panel p-5 sm:p-6 rounded-2xl min-h-[420px] max-h-[600px] flex flex-col justify-between">
                <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                    {messages.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-xs">
                            No messages in this conversation.
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isMe = message.sender === "anonymous";
                            const time = new Date(message.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                            );

                            return (
                                <div
                                    key={message.id}
                                    className={`flex flex-col ${
                                        isMe
                                            ? "items-end ml-10 sm:ml-16"
                                            : "items-start mr-10 sm:mr-16"
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                                        <span className="font-semibold text-slate-300">
                                            {isMe ? "You (Anonymous)" : "Profile Owner"}
                                        </span>
                                        <span>• {time}</span>
                                    </div>

                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-full break-words shadow-sm ${
                                            isMe
                                                ? "bg-emerald-600 text-white rounded-tr-sm border border-emerald-500/30"
                                                : "surface-card text-slate-200 rounded-tl-sm border border-white/[0.08]"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 pt-4 border-t border-white/[0.08]"
                >
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Write an anonymous reply... (Press Enter to send)"
                            maxLength={1000}
                            rows={3}
                            className="w-full surface-input rounded-xl p-3 pr-24 text-xs sm:text-sm resize-none"
                        />
                        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                                {content.length}/1000
                            </span>
                            <button
                                type="submit"
                                disabled={sendMessage.isPending || !content.trim()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all"
                            >
                                <SendIcon className="w-3 h-3" />
                                <span>{sendMessage.isPending ? "Sending" : "Send"}</span>
                            </button>
                        </div>
                    </div>
                    {sendMessage.isError && (
                        <p className="text-xs text-red-400 mt-1.5">
                            {sendMessage.error.message}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}
