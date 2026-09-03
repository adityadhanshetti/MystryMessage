import { createFileRoute } from "@tanstack/react-router";

import AnonymousMessageForm from "../features/messages/AnonymousMessageForm";

import ShareProfile from "../features/profile/ShareProfile";

import { publicProfileQuery } from "../features/profile/publicApi";

export const Route = createFileRoute("/$username")({
    loader: async ({ params, context }) => {
        return context.queryClient.ensureQueryData(
            publicProfileQuery(params.username),
        );
    },

    head: ({ loaderData }) => {
        const profile = loaderData?.data;

        if (!profile) {
            return {
                meta: [
                    {
                        title: "Mystry Message",
                    },
                ],
            };
        }

        return {
            meta: [
                {
                    title: `@${profile.username} | Mystry Message`,
                },
                {
                    name: "description",
                    content:
                        profile.bio ||
                        `Send an anonymous message to @${profile.username}.`,
                },
            ],
        };
    },
    errorComponent: ({ error }) => (
        <main>
            <h1>Profile not found</h1>
            <p>{error.message}</p>
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
            <main>
                <h1>Profile not found</h1>
            </main>
        );
    }

    return (
        <main>
            <section>
                {profile.avatar_url && (
                    <img
                        src={profile.avatar_url}
                        alt={profile.display_name}
                        width="96"
                        height="96"
                    />
                )}

                <p>@{profile.username}</p>

                <h1>{profile.display_name}</h1>

                {profile.bio && <p>{profile.bio}</p>}

                <ShareProfile username={profile.username} />
            </section>

            <section>
                <h2>Send an anonymous message</h2>

                <AnonymousMessageForm username={username} />
            </section>
        </main>
    );
}
