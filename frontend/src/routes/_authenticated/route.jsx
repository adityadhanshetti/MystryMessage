import {
    Link,
    Outlet,
    createFileRoute,
    redirect,
} from "@tanstack/react-router";

import { UserButton } from "@clerk/clerk-react";

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
    return (
        <div>
            <header>
                <Link to="/inbox">
                    <strong>Mystry Message</strong>
                </Link>

                <UserButton />
            </header>

            <nav>
                <Link
                    to="/inbox"
                    activeProps={{
                        style: {
                            fontWeight: "bold",
                        },
                    }}
                >
                    Inbox
                </Link>

                <Link
                    to="/profile"
                    activeProps={{
                        style: {
                            fontWeight: "bold",
                        },
                    }}
                >
                    Profile
                </Link>

                <Link
                    to="/settings"
                    activeProps={{
                        style: {
                            fontWeight: "bold",
                        },
                    }}
                >
                    Settings
                </Link>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
