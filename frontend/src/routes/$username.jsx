import { createFileRoute } from "@tanstack/react-router";

import { usePublicProfile } from "../features/profile/publicApi";
import AnonymousMessageForm from "../features/messages/AnonymousMessageForm";

export const Route = createFileRoute("/$username")({
    component: PublicProfilePage,
});

function PublicProfilePage() {
    const { username } = Route.useParams();

    const { data, isLoading, isError, error } = usePublicProfile(username);

    if (isLoading) {
        return (
            <main>
                <p>Loading profile...</p>
            </main>
        );
    }

    if (isError) {
        return (
            <main>
                <h1>Profile not found</h1>
                <p>{error.message}</p>
            </main>
        );
    }

    const profile = data?.data;

    if (!profile) {
        return null;
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
            </section>

            <section>
                <h2>Send an anonymous message</h2>

                <AnonymousMessageForm username={profile.username} />
            </section>
        </main>
    );
}
