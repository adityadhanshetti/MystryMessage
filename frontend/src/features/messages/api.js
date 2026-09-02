import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import { apiRequest } from "../../lib/api";

export const messageKeys = {
    all: ["messages"],

    inbox: () => [...messageKeys.all, "inbox"],
};

export function useInbox() {
    const { getToken, isSignedIn } = useAuth();

    return useQuery({
        queryKey: messageKeys.inbox(),

        queryFn: () =>
            apiRequest("/messages/inbox", {
                getToken,
            }),

        enabled: !!isSignedIn,
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
                queryKey: messageKeys.inbox(),
            });
        },
    });
}

export function useDeleteMessage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (messageId) =>
            apiRequest(`/messages/${messageId}`, {
                getToken,
                method: "DELETE",
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: messageKeys.inbox(),
            });
        },
    });
}
