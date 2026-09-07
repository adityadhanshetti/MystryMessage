import { createFileRoute, Link } from "@tanstack/react-router";
import AnonymousMessageForm from "../features/messages/AnonymousMessageForm";
import ShareProfile from "../features/profile/ShareProfile";
import CopyProfileLink from "../features/profile/CopyProfileLink";
import { publicProfileQuery } from "../features/profile/publicApi";
import { LogoIcon, CheckIcon } from "../components/icons";

export const Route = createFileRoute("/$username")({
    loader: async ({ params, context }) => {
        try {
            return await context.queryClient.ensureQueryData(
                publicProfileQuery(params.username),
            );
        } catch {
            return null;
        }
    },

    head: ({ loaderData }) => {
        const profile = loaderData?.data;

        if (!profile) {
            return {
                meta: [{ title: "Mystry Message" }],
            };
        }

        return {
            meta: [
                {
                    title: `@${profile.username} | Send Anonymous Message`,
                },
                {
                    name: "description",
                    content:
                        profile.bio ||
                        `Send an anonymous message to @${profile.username} on Mystry Message.`,
                },
                {
                    property: "og:title",
                    content: `Send an anonymous message to @${profile.username}`,
                },
                {
                    property: "og:description",
                    content:
                        profile.bio ||
                        "Ask me anything or send secret thoughts anonymously.",
                },
            ],
        };
    },

    errorComponent: ({ error }) => (
        <main className="min-h-screen flex items-center justify-center p-4 bg-[#080b11] text-slate-100 bg-grid-pattern">
            <div className="surface-panel p-8 rounded-2xl max-w-sm w-full text-center space-y-4">
                <h1 className="text-lg font-bold text-white">
                    Profile Not Found
                </h1>
                <p className="text-xs text-slate-400">
                    {error?.message ||
                        "This user does not exist or has set their profile to private."}
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-medium"
                >
                    Go to Homepage
                </Link>
            </div>
        </main>
    ),

    component: PublicProfilePage,
});

function PublicProfilePage() {
    const { username } = Route.useParams();
    const profileQuery = Route.useLoaderData();
    const profile = profileQuery?.data;

    if (!profile) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 bg-[#080b11] text-slate-100 bg-grid-pattern">
                <div className="surface-panel p-8 rounded-2xl max-w-sm w-full text-center space-y-4">
                    <h1 className="text-lg font-bold text-white">
                        Profile Not Found
                    </h1>
                    <p className="text-xs text-slate-400">
                        @{username} does not exist or has set their profile to private.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-medium"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-[#080b11] text-slate-100 bg-grid-pattern flex flex-col justify-between py-6 px-4 selection:bg-indigo-500 selection:text-white">
            {/* Header */}
            <header className="max-w-lg mx-auto w-full flex items-center justify-between pb-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                    <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <LogoIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Mystry Message</span>
                </Link>

                <Link
                    to="/"
                    className="text-xs px-3 py-1.5 rounded-lg btn-secondary font-medium"
                >
                    Create Your Link
                </Link>
            </header>

            {/* Profile Content */}
            <main className="max-w-lg mx-auto w-full space-y-4">
                {/* Profile Card */}
                <div className="surface-panel p-6 sm:p-7 rounded-2xl text-center space-y-4">
                    <div className="relative inline-block">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name}
                                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/[0.08] shadow-lg mx-auto"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-white/[0.08] shadow-lg mx-auto">
                                {profile.display_name?.charAt(0) || "U"}
                            </div>
                        )}
                        <span
                            title="Verified user"
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-[#080b11] flex items-center justify-center text-white"
                        >
                            <CheckIcon className="w-2.5 h-2.5" />
                        </span>
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            {profile.display_name}
                        </h1>
                        <p className="text-xs font-mono text-indigo-400 mt-0.5">
                            @{profile.username}
                        </p>
                    </div>

                    {profile.bio && (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                            {profile.bio}
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <CopyProfileLink username={profile.username} />
                        <ShareProfile username={profile.username} />
                    </div>
                </div>

                {/* Anonymous Form Card */}
                <div className="surface-panel p-6 sm:p-7 rounded-2xl">
                    <h2 className="text-sm font-bold text-white mb-3">
                        Send Anonymous Message
                    </h2>
                    <AnonymousMessageForm
                        username={username}
                        acceptMessages={profile.accept_messages !== false}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-[11px] text-slate-600">
                Encrypted & Moderated by Mystry Message
            </footer>
        </div>
    );
}
