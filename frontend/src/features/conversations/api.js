import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/api";

export const conversationKeys = {
    all: ["conversations"],

    detail: (id) => [...conversationKeys.all, id],
};

export function useAnonymousConversation(conversationId) {
    const token = localStorage.getItem(`mystry-conversation-${conversationId}`);

    return useQuery({
        queryKey: conversationKeys.detail(conversationId),

        queryFn: () =>
            apiRequest(
                `/conversations/${conversationId}?token=${encodeURIComponent(token)}`,
            ),

        enabled: Boolean(conversationId && token),

        retry: false,
    });
}
