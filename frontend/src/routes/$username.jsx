import { createFileRoute } from "@tanstack/react-router";

import AnonymousMessageForm from "../features/messages/AnonymousMessageForm";

export const Route = createFileRoute("/$username")({
    component: PublicProfile,
});

function PublicProfile() {
    const { username } = Route.useParams();

    return (
        <main>
            <h1>@{username}</h1>

            <p>Send an anonymous message.</p>

            <AnonymousMessageForm username={username} />
        </main>
    );
}
