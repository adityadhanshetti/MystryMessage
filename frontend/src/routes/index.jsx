import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import {
    LogoIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    MessageSquareIcon,
    QrCodeIcon,
    LockIcon,
    SparklesIcon,
} from "../components/icons";

export const Route = createFileRoute("/")({
    component: Home,
});

const DEMO_SAMPLES = [
    {
        question: "What's the hardest technical challenge you solved recently?",
        reply: "Migrating from raw messages to tokenized two-way conversation threads without exposing user identities.",
    },
    {
        question: "Is there any advice you'd give to someone learning React & Python?",
        reply: "Focus on clean mental models for state and data flow before reaching for complex abstractions.",
    },
    {
        question: "What feature are you most excited to ship next?",
        reply: "Real-time thread events and custom branded profile themes!",
    },
];

function Home() {
    const [activeDemoIndex, setActiveDemoIndex] = useState(0);
    const activeDemo = DEMO_SAMPLES[activeDemoIndex];

    return (
        <div className="min-h-screen bg-[#080b11] text-slate-100 bg-grid-pattern flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative">
            {/* Top ambient glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] bg-indigo-500/[0.06] blur-[120px] pointer-events-none rounded-full" />

            {/* Navbar */}
            <header className="relative z-20 max-w-5xl mx-auto w-full px-4 sm:px-6 h-18 flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-base tracking-tight text-white">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <LogoIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold tracking-tight text-slate-100">
                        Mystry Message
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl btn-secondary text-xs font-semibold cursor-pointer"
                            >
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <Link
                            to="/inbox"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold shadow-sm"
                        >
                            <span>Open Inbox</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                    </SignedIn>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 flex flex-col items-center text-center">
                {/* Product Pill */}
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300 mb-8">
                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Two-Way Anonymous Conversation Threads</span>
                </div> */}

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.12] mb-5">
                    Honest feedback. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
                        Authentic dialogue.
                    </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-9 leading-relaxed font-normal">
                    Share your personal link to receive candid AMA questions and
                    confessions. Reply directly inside private conversation threads
                    without compromising sender anonymity.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-semibold text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
                            >
                                <span>Get Your Mystry Link</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <Link
                            to="/profile"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-semibold text-sm shadow-lg shadow-indigo-600/20"
                        >
                            <span>View Your Profile</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </SignedIn>

                    <a
                        href="#interactive-demo"
                        className="px-5 py-3 rounded-xl btn-secondary text-xs font-semibold"
                    >
                        Explore Interactive Demo
                    </a>
                </div>

                {/* Interactive Demo Simulator */}
                <div
                    id="interactive-demo"
                    className="w-full max-w-xl surface-panel p-6 rounded-2xl text-left border border-white/[0.08] shadow-2xl space-y-4"
                >
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            <span className="text-xs font-semibold text-slate-200">
                                Live Thread Preview
                            </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                            Sample {activeDemoIndex + 1} of {DEMO_SAMPLES.length}
                        </span>
                    </div>

                    {/* Chat simulation bubbles */}
                    <div className="space-y-3 py-2 min-h-[140px]">
                        {/* Anonymous message */}
                        <div className="flex flex-col items-start mr-8">
                            <span className="text-[10px] text-slate-400 mb-1 font-mono">
                                Anonymous Sender
                            </span>
                            <div className="surface-card px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm text-slate-100 border border-white/[0.08] leading-relaxed">
                                {activeDemo.question}
                            </div>
                        </div>

                        {/* Owner Reply */}
                        <div className="flex flex-col items-end ml-8">
                            <span className="text-[10px] text-indigo-300 mb-1 font-mono">
                                You (Profile Owner)
                            </span>
                            <div className="bg-indigo-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-xs sm:text-sm leading-relaxed shadow-sm border border-indigo-500/30">
                                {activeDemo.reply}
                            </div>
                        </div>
                    </div>

                    {/* Simulator Tab Buttons */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                            Switch sample:
                        </span>
                        <div className="flex gap-1.5">
                            {DEMO_SAMPLES.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveDemoIndex(i)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                                        activeDemoIndex === i
                                            ? "bg-indigo-600 text-white"
                                            : "btn-secondary text-slate-400 hover:text-white"
                                    }`}
                                >
                                    #{i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-16 text-left">
                    <div className="surface-panel p-5 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                            <MessageSquareIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-white text-sm">
                            Continuous Threads
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Reply directly to anonymous messages. Maintain private
                            dialogue with full sender anonymity.
                        </p>
                    </div>

                    <div className="surface-panel p-5 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                            <ShieldCheckIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-white text-sm">
                            Built-in Protection
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Automatic content moderation, Redis-backed rate
                            limiting, and one-click thread revocation.
                        </p>
                    </div>

                    <div className="surface-panel p-5 rounded-2xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                            <QrCodeIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-white text-sm">
                            Instant Sharing & QR
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Custom `@username` handles, high-contrast QR codes,
                            and native social sharing in one click.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.06] py-6 text-xs text-slate-500 text-center">
                <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© 2026 Mystry Message. All rights reserved.</p>
                    <p className="flex items-center gap-1.5">
                        <LockIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Privacy-first architecture</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
