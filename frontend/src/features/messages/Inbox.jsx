import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSelector, useDispatch } from "react-redux";
import { setInboxFilter } from "../../store/uiSlice";
import {
    useConversations,
    useMarkConversationRead,
    useMarkAllConversationsRead,
    useCloseConversation,
} from "../conversations/api";
import { useMyProfile } from "../profile/api";
import {
    MessageSquareIcon,
    CheckIcon,
    CloseIcon,
    ArrowRightIcon,
    ShareIcon,
} from "../../components/icons";
import ShareMessageModal from "./ShareMessageModal";

export default function Inbox() {
    const dispatch = useDispatch();
    const activeFilter = useSelector((state) => state.ui.inboxFilter) || "all";
    const [page, setPage] = useState(1);
    const [shareModal, setShareModal] = useState({
        isOpen: false,
        messageContent: "",
        replyContent: "",
    });

    const { data: myProfileData } = useMyProfile();
    const myUsername = myProfileData?.data?.username || "";

    const { data, isLoading, isError, error, isFetching } = useConversations(
        activeFilter,
        page,
    );

    const markRead = useMarkConversationRead();
    const markAllRead = useMarkAllConversationsRead();
    const closeConv = useCloseConversation();

    const result = data?.data || {};
    const conversations = result.items || [];
    const total = result.total || 0;
    const unreadCount = result.unread_count || 0;
    const limit = result.limit || 20;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const [searchTerm, setSearchTerm] = useState("");

    const handleFilterChange = (filter) => {
        dispatch(setInboxFilter(filter));
        setPage(1);
    };

    const filteredConversations = conversations.filter((c) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        const content = (c.last_message_content || "").toLowerCase();
        return content.includes(query);
    });

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Inbox
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Anonymous questions, feedback, and two-way conversations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={() => markAllRead.mutate()}
                            disabled={markAllRead.isPending}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-secondary font-medium cursor-pointer disabled:opacity-50"
                        >
                            <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                                {markAllRead.isPending
                                    ? "Marking..."
                                    : "Mark all read"}
                            </span>
                        </button>
                    )}

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>{unreadCount} unread</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Filter Tabs + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-white/[0.08] w-fit">
                    {["all", "unread", "read"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => handleFilterChange(tab)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                activeFilter === tab
                                    ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.08]"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full surface-input rounded-xl px-3.5 py-1.5 text-xs pr-8"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="surface-panel p-5 rounded-2xl animate-pulse space-y-3"
                        >
                            <div className="h-4 bg-slate-800/80 rounded w-1/4" />
                            <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error state */}
            {isError && (
                <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-200">
                    <p className="text-sm font-semibold">Failed to load conversations</p>
                    <p className="text-xs text-red-300/80 mt-1">
                        {error?.message || "An unexpected error occurred."}
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && conversations.length === 0 && (
                <div className="text-center py-16 px-4 rounded-2xl surface-panel border border-white/[0.08]">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <MessageSquareIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                        No conversations yet
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-5 leading-relaxed">
                        Share your Mystry profile link with friends or on social
                        media to receive anonymous questions.
                    </p>
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-white font-semibold text-xs shadow-md"
                    >
                        <span>Share Profile Link</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* Conversation list */}
            {!isLoading && !isError && conversations.length > 0 && (
                <div className="space-y-2.5">
                    {filteredConversations.length === 0 ? (
                        <div className="text-center py-10 surface-panel rounded-2xl text-xs text-slate-400">
                            No conversations match "{searchTerm}"
                        </div>
                    ) : (
                        filteredConversations.map((c) => {
                        const isUnread = !c.is_read;
                        const dateFormatted = c.last_message_at
                            ? new Date(c.last_message_at).toLocaleDateString(
                                  undefined,
                                  {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  },
                              )
                            : "";

                        return (
                            <div
                                key={c.id}
                                className={`surface-card p-4 sm:p-5 rounded-2xl relative group border ${
                                    isUnread
                                        ? "border-l-4 border-l-indigo-500 border-white/[0.1] bg-slate-900/60"
                                        : "border-white/[0.06]"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <Link
                                        to="/inbox/conversation/$conversationId"
                                        params={{ conversationId: c.id }}
                                        className="flex-1 min-w-0"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {isUnread && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block shrink-0" />
                                            )}
                                            <span className="text-xs font-semibold text-slate-200">
                                                {c.last_message_sender ===
                                                "anonymous"
                                                    ? "Anonymous Sender"
                                                    : "You (Replied)"}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                • {dateFormatted}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 font-mono">
                                                {c.message_count}{" "}
                                                {c.message_count === 1
                                                    ? "msg"
                                                    : "msgs"}
                                            </span>
                                            {!c.is_active && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/90 border border-amber-500/20 font-medium">
                                                    Closed
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-300 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                                            {c.last_message_content ||
                                                "View conversation thread..."}
                                        </p>
                                    </Link>

                                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            type="button"
                                            title="Share to social media"
                                            onClick={() =>
                                                setShareModal({
                                                    isOpen: true,
                                                    messageContent:
                                                        c.last_message_content ||
                                                        "Anonymous message",
                                                    replyContent:
                                                        c.last_message_sender === "owner"
                                                            ? c.last_message_content
                                                            : "",
                                                })
                                            }
                                            className="p-2 rounded-lg bg-white/[0.04] hover:bg-indigo-500/10 hover:text-indigo-300 text-slate-400 text-xs transition-colors cursor-pointer"
                                        >
                                            <ShareIcon className="w-3.5 h-3.5" />
                                        </button>

                                        {isUnread && (
                                            <button
                                                type="button"
                                                title="Mark as read"
                                                onClick={() =>
                                                    markRead.mutate(c.id)
                                                }
                                                disabled={markRead.isPending}
                                                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors cursor-pointer"
                                            >
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {c.is_active && (
                                            <button
                                                type="button"
                                                title="Close thread"
                                                onClick={() =>
                                                    closeConv.mutate(c.id)
                                                }
                                                disabled={closeConv.isPending}
                                                className="p-2 rounded-lg bg-white/[0.04] hover:bg-red-500/10 hover:text-red-300 text-slate-400 text-xs transition-colors cursor-pointer"
                                            >
                                                <CloseIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                    <ShareMessageModal
                        isOpen={shareModal.isOpen}
                        onClose={() =>
                            setShareModal((prev) => ({ ...prev, isOpen: false }))
                        }
                        messageContent={shareModal.messageContent}
                        replyContent={shareModal.replyContent}
                        username={myUsername}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-slate-400">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page <= 1 || isFetching}
                                className="px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page >= totalPages || isFetching}
                                className="px-3 py-1.5 rounded-lg btn-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
