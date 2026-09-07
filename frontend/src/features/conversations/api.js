import { apiRequest } from "../../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

export const conversationKeys = {
    all: ["conversations"],
    lists: () => [...conversationKeys.all, "list"],
    list: (filter, page) => [...conversationKeys.lists(), { filter, page }],
    detail: (conversationId) => ["conversations", "detail", conversationId],
    ownerDetail: (conversationId) => [
        "conversations",
        "ownerDetail",
        conversationId,
    ],
};

/**
 * Fetch paginated list of conversations for the owner's inbox.
 */
export function useConversations(filter = "all", page = 1) {
    const { getToken, isSignedIn } = useAuth();
    const limit = 20;
    const skip = (page - 1) * limit;

    return useQuery({
        queryKey: conversationKeys.list(filter, page),
        queryFn: () =>
            apiRequest(
                `/conversations?filter=${filter}&limit=${limit}&skip=${skip}`,
                { getToken },
            ),
        enabled: Boolean(isSignedIn),
        staleTime: 15_000,
        refetchInterval: 15_000, // Background polling for new conversations
    });
}

/**
 * Mark a single conversation as read.
 */
export function useMarkConversationRead() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId) =>
            apiRequest(`/conversations/${conversationId}/read`, {
                method: "PATCH",
                getToken,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: conversationKeys.all,
            });
        },
    });
}

/**
 * Mark all conversations as read.
 */
export function useMarkAllConversationsRead() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiRequest("/conversations/mark-all-read", {
                method: "POST",
                getToken,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: conversationKeys.all,
            });
        },
    });
}

/**
 * Close/revoke an active conversation.
 */
export function useCloseConversation() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId) =>
            apiRequest(`/conversations/${conversationId}/close`, {
                method: "PATCH",
                getToken,
            }),
        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({
                queryKey: conversationKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: conversationKeys.ownerDetail(conversationId),
            });
        },
    });
}

/**
 * Anonymous user: fetch a conversation using a token stored in localStorage.
 * Token is sent exclusively via X-Conversation-Token header.
 */
export function useAnonymousConversation(conversationId) {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem(`mystry-conversation-${conversationId}`)
            : null;

    return useQuery({
        queryKey: conversationKeys.detail(conversationId),
        queryFn: () =>
            apiRequest(`/messages/conversations/${conversationId}`, {
                headers: {
                    "X-Conversation-Token": token,
                },
            }),
        enabled: Boolean(conversationId && token),
        refetchInterval: 8_000, // 8-second polling for anonymous replies
        retry: false,
    });
}

/**
 * Owner: fetch a conversation thread using Clerk auth.
 */
export function useOwnerConversation(conversationId) {
    const { getToken, isSignedIn } = useAuth();

    return useQuery({
        queryKey: conversationKeys.ownerDetail(conversationId),
        queryFn: () =>
            apiRequest(
                `/messages/conversations/${conversationId}/owner`,
                { getToken },
            ),
        enabled: Boolean(conversationId && isSignedIn),
        refetchInterval: 8_000, // 8-second polling for real-time chat
        retry: false,
    });
}

/**
 * Anonymous user: send a follow-up reply in a conversation.
 */
export function useSendAnonymousConversationMessage(conversationId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content) => {
            const token = localStorage.getItem(
                `mystry-conversation-${conversationId}`,
            );

            if (!token) {
                throw new Error("Conversation access token not found.");
            }

            return apiRequest(
                `/messages/conversations/${conversationId}/messages`,
                {
                    method: "POST",
                    headers: {
                        "X-Conversation-Token": token,
                    },
                    body: { content },
                },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: conversationKeys.detail(conversationId),
            });
        },
    });
}

/**
 * Owner: send a reply in an existing conversation thread.
 */
export function useSendOwnerConversationMessage(conversationId) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (content) =>
            apiRequest(
                `/messages/conversations/${conversationId}/owner-messages`,
                {
                    method: "POST",
                    getToken,
                    body: { content },
                },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: conversationKeys.ownerDetail(conversationId),
            });
            queryClient.invalidateQueries({
                queryKey: conversationKeys.lists(),
            });
        },
    });
}

/**
 * Add an emoji reaction to any message in a conversation.
 */
export function useReactToMessage(conversationId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ messageId, emoji }) =>
            apiRequest(`/messages/${messageId}/react`, {
                method: "POST",
                body: { emoji },
            }),
        onSuccess: () => {
            if (conversationId) {
                queryClient.invalidateQueries({
                    queryKey: conversationKeys.ownerDetail(conversationId),
                });
                queryClient.invalidateQueries({
                    queryKey: conversationKeys.detail(conversationId),
                });
            }
        },
    });
}