import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

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
    return <Outlet />;
}
