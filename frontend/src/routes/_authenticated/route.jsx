import {
    Link,
    Outlet,
    createFileRoute,
    redirect,
} from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { useConversations } from "../../features/conversations/api";
import { LogoIcon } from "../../components/icons";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: ({ context }) => {
        if (!context.auth.isSignedIn) {
            throw redirect({
                to: "/",
            });
        }
    },
    component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
    const { data } = useConversations("all", 1);
    const unreadCount = data?.data?.unread_count || 0;

    return (
        <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 bg-grid-pattern selection:bg-indigo-500 selection:text-white">
            {/* Ambient subtle lighting header */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[180px] bg-indigo-500/[0.07] blur-[100px] pointer-events-none rounded-full" />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080b11]/85 border-b border-white/[0.08] transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link
                        to="/inbox"
                        className="flex items-center gap-2.5 font-bold text-base tracking-tight text-white group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-500/50 group-hover:bg-indigo-600/30 transition-all">
                            <LogoIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold tracking-tight text-slate-100 group-hover:text-white transition-colors">
                            Mystry Message
                        </span>
                    </Link>

                    {/* Navigation Tabs */}
                    <nav className="flex items-center gap-1">
                        <Link
                            to="/inbox"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
                            activeProps={{
                                className:
                                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.08] border border-white/[0.06] shadow-sm",
                            }}
                        >
                            <span>Inbox</span>
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white leading-tight">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/profile"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all"
                            activeProps={{
                                className:
                                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.08] border border-white/[0.06] shadow-sm",
                            }}
                        >
                            Profile
                        </Link>

                        <Link
                            to="/settings"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all"
                            activeProps={{
                                className:
                                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/[0.08] border border-white/[0.06] shadow-sm",
                            }}
                        >
                            Settings
                        </Link>
                    </nav>

                    {/* User profile button */}
                    <div className="flex items-center gap-3">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 rounded-lg ring-1 ring-white/10",
                                },
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Page Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
