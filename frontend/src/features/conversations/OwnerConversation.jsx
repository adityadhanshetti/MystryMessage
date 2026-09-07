import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
    useOwnerConversation,
    useSendOwnerConversationMessage,
    useCloseConversation,
    useReactToMessage,
} from "./api";
import { useMyProfile } from "../profile/api";
import { SendIcon, CloseIcon, ShareIcon } from "../../components/icons";
import ShareMessageModal from "../messages/ShareMessageModal";

export default function OwnerConversation({ conversationId }) {
    const [content, setContent] = useState("");
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const { data: myProfileData } = useMyProfile();
    const myUsername = myProfileData?.data?.username || "";

    const { data, isLoading, isError, error, isFetching } =
        useOwnerConversation(conversationId);

    const sendMessage = useSendOwnerConversationMessage(conversationId);
    const closeConv = useCloseConversation();
    const reactToMessage = useReactToMessage(conversationId);

    const conversation = data?.data?.conversation || null;
    const messages = data?.data?.messages || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    function handleSubmit(event) {
        event.preventDefault();
        const value = content.trim();

        if (!value || sendMessage.isPending) {
            return;
        }

        sendMessage.mutate(value, {
            onSuccess: () => {
                setContent("");
            },
        });
    }

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
                <div className="h-5 w-24 bg-slate-800 rounded" />
                <div className="surface-panel p-6 rounded-2xl space-y-4">
                    <div className="h-14 bg-slate-800/60 rounded-xl w-2/3" />
                    <div className="h-14 bg-slate-800/60 rounded-xl w-1/2 ml-auto" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <Link
                    to="/inbox"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                    ← Back to Inbox
                </Link>
                <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-200">
                    <h3 className="font-semibold text-sm">Conversation Unavailable</h3>
                    <p className="text-xs text-red-300/80 mt-1">
                        {error?.message || "Could not load this conversation thread."}
                    </p>
                </div>
            </div>
        );
    }

    const isActive = conversation?.is_active !== false;

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Top Navigation & Status Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <Link
                    to="/inbox"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    ← Back to Inbox
                </Link>

                <div className="flex items-center gap-2.5">
                    {isFetching && (
                        <span className="text-[11px] text-indigo-400/80 font-mono">
                            syncing...
                        </span>
                    )}

                    {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active Thread
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Closed
                        </span>
                    )}

                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShareModalOpen(true)}
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg btn-secondary text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-all cursor-pointer"
                        >
                            <ShareIcon className="w-3 h-3" />
                            <span>Share Q&A</span>
                        </button>
                    )}

                    {isActive && (
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        "Close this conversation thread? No further messages can be sent.",
                                    )
                                ) {
                                    closeConv.mutate(conversationId);
                                }
                            }}
                            disabled={closeConv.isPending}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg btn-secondary text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <CloseIcon className="w-3 h-3" />
                            <span>Close Thread</span>
                        </button>
                    )}
                </div>
            </div>

            <ShareMessageModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                messageContent={
                    messages.find((m) => m.sender === "anonymous")?.content ||
                    "Anonymous message"
                }
                replyContent={
                    messages.filter((m) => m.sender === "owner").pop()?.content || ""
                }
                username={myUsername}
            />

            {/* Chat Thread Container */}
            <div className="surface-panel p-5 sm:p-6 rounded-2xl min-h-[440px] max-h-[620px] flex flex-col justify-between">
                {/* Messages Viewport */}
                <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                    {messages.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-xs">
                            No messages in this thread.
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwner = message.sender === "owner";
                            const time = new Date(message.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                            );

                            return (
                                <div
                                    key={message.id}
                                    className={`flex flex-col group ${
                                        isOwner
                                            ? "items-end ml-10 sm:ml-16"
                                            : "items-start mr-10 sm:mr-16"
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 flex-wrap">
                                        <span className="font-semibold text-slate-300">
                                            {isOwner ? "You" : "Anonymous Sender"}
                                        </span>
                                        <span>• {time}</span>

                                        {/* Sender device hint */}
                                        {!isOwner && message.sender_hint?.device && (
                                            <span
                                                title={`Platform: ${message.sender_hint.platform || "Web"}, Browser: ${message.sender_hint.browser || "Browser"}`}
                                                className="text-[10px] px-2 py-0.2 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06] font-mono inline-flex items-center gap-1"
                                            >
                                                <span>📱</span>
                                                <span>{message.sender_hint.device}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-full break-words shadow-sm relative ${
                                            isOwner
                                                ? "bg-indigo-600 text-white rounded-tr-sm border border-indigo-500/30"
                                                : "surface-card text-slate-200 rounded-tl-sm border border-white/[0.08]"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    {/* Reactions display & interactive bar */}
                                    <div className="flex items-center gap-2 mt-1">
                                        {message.reactions &&
                                            Object.keys(message.reactions).length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {Object.entries(message.reactions).map(
                                                        ([emoji, count]) => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() =>
                                                                    reactToMessage.mutate({
                                                                        messageId: message.id,
                                                                        emoji,
                                                                    })
                                                                }
                                                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800/90 border border-white/[0.08] text-slate-200 hover:border-indigo-500/50 cursor-pointer"
                                                            >
                                                                <span>{emoji}</span>
                                                                <span className="font-mono text-[9px] text-slate-400">
                                                                    {count}
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {/* Hover Reaction trigger chips */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 px-1.5 py-0.5 rounded-full border border-white/[0.08]">
                                            {["❤️", "🔥", "😂", "👏", "😮"].map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    title={`React with ${emoji}`}
                                                    onClick={() =>
                                                        reactToMessage.mutate({
                                                            messageId: message.id,
                                                            emoji,
                                                        })
                                                    }
                                                    className="p-0.5 text-xs hover:scale-130 transition-transform cursor-pointer"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Input Bar */}
                {isActive ? (
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
                                placeholder="Type a reply... (Press Enter to send)"
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary text-white font-medium text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                ) : (
                    <div className="mt-4 pt-4 border-t border-white/[0.08] text-center py-2 text-xs text-amber-400/90 font-medium">
                        This conversation has been closed.
                    </div>
                )}
            </div>
        </div>
    );
}
