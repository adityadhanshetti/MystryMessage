import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$username")({
    component: PublicProfile,
});

function PublicProfile() {
    const { username } = Route.useParams();

    return (
        <main>
            <h1>@{username}</h1>

            <p>Send an anonymous message.</p>

            {/* Message form will come in Step 4 */}
        </main>
    );
}
