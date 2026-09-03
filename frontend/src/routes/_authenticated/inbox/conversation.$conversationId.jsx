import { createFileRoute } from "@tanstack/react-router";
import OwnerConversation from "../../../features/conversations/OwnerConversation";

export const Route = createFileRoute(
    "/_authenticated/inbox/conversation/$conversationId",
)({
    component: OwnerConversationPage,
});

function OwnerConversationPage() {
    const { conversationId } = Route.useParams();

    return <OwnerConversation conversationId={conversationId} />;
}
