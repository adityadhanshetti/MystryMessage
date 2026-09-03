import { createFileRoute } from "@tanstack/react-router";

import Profile from "../../features/profile/Profile";

export const Route = createFileRoute("/_authenticated/profile")({
    component: ProfilePage,
});

function ProfilePage() {
    return (
        <section>
            <Profile />
        </section>
    );
}
