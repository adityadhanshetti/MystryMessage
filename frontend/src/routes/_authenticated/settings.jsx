import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
    component: SettingsPage,
});

function SettingsPage() {
    return (
        <section>
            <h1>Settings</h1>

            <div>
                <h2>Privacy</h2>

                <p>
                    Manage your profile visibility and anonymous messaging
                    preferences.
                </p>
            </div>
        </section>
    );
}
