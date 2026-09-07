import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import { apiRequest } from "../../lib/api";

export const messageKeys = {
    all: ["messages"],

    inbox: (page = 1) => [...messageKeys.all, "inbox", page],

    unreadCount: () => [...messageKeys.all, "unread-count"],
};

export function useInbox(page = 1) {
    const { getToken, isSignedIn } = useAuth();

    const limit = 20;
    const skip = (page - 1) * limit;

    return useQuery({
        queryKey: messageKeys.inbox(page),

        queryFn: () =>
            apiRequest(`/messages/inbox?limit=${limit}&skip=${skip}`, {
                getToken,
            }),

        enabled: Boolean(isSignedIn),

        staleTime: 30 * 1000,
    });
}

export function useMarkMessageAsRead() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId) =>
            apiRequest(`/messages/${messageId}/read`, {
                getToken,
                method: "PATCH",
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.all,
            });
        },
    });
}

export function useDeleteMessage(page = 1) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId) =>
            apiRequest(`/messages/${messageId}`, {
                getToken,
                method: "DELETE",
            }),

        onMutate: async (messageId) => {
            const queryKey = messageKeys.inbox(page);

            await queryClient.cancelQueries({
                queryKey,
            });

            const previousData = queryClient.getQueryData(queryKey);

            queryClient.setQueryData(queryKey, (old) => {
                if (!old?.data) {
                    return old;
                }

                return {
                    ...old,
                    data: old.data.filter(
                        (message) => message.id !== messageId,
                    ),
                };
            });

            return {
                previousData,
            };
        },

        onError: (_error, _messageId, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    messageKeys.inbox(page),
                    context.previousData,
                );
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.all,
            });
        },
    });
}

export function useSendAnonymousMessage() {
    return useMutation({
        mutationFn: ({ username, content }) =>
            apiRequest(`/messages/${encodeURIComponent(username)}`, {
                method: "POST",
                body: { content },
            }),
    });
}

export function useUnreadCount() {
    const { getToken, isSignedIn } = useAuth();

    return useQuery({
        queryKey: messageKeys.unreadCount(),

        queryFn: () =>
            apiRequest("/messages/unread-count", {
                getToken,
            }),

        enabled: Boolean(isSignedIn),

        staleTime: 15 * 1000,

        refetchInterval: 30 * 1000,
    });
}

export function useReplyToMessage(page = 1) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageId, content }) =>
            apiRequest(`/messages/${messageId}/reply`, {
                getToken,
                method: "POST",
                body: {
                    content,
                },
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.inbox(page),
            });
        },
    });
}
