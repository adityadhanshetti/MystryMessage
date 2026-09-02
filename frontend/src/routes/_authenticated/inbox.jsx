import { createFileRoute } from "@tanstack/react-router";

import Inbox from "../../features/messages/Inbox";

export const Route = createFileRoute("/_authenticated/inbox")({
    component: InboxPage,
});

function InboxPage() {
    return (
        <main>
            <Inbox />
        </main>
    );
}
