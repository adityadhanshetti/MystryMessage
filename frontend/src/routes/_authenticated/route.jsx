import { Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";

import { createFileRoute } from "@tanstack/react-router";

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
            <Outlet />
        </div>
    );
}
