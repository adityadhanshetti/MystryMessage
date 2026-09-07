import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inbox")({
    component: InboxLayout,
});

function InboxLayout() {
    return <Outlet />;
}
