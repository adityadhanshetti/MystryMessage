import { useAuth } from "@clerk/clerk-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "../../lib/api";

export const profileKeys = {
    all: ["profile"],

    me: () => [...profileKeys.all, "me"],
};

export function useMyProfile() {
    const { getToken, isSignedIn } = useAuth();

    return useQuery({
        queryKey: profileKeys.me(),

        queryFn: () =>
            apiRequest("/users/me", {
                getToken,
            }),

        enabled: Boolean(isSignedIn),

        staleTime: 60 * 1000,
    });
}

export function useUpdateProfile() {
    const { getToken } = useAuth();

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (profile) =>
            apiRequest("/users/me", {
                getToken,
                method: "PATCH",
                body: profile,
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: profileKeys.me(),
            });
        },
    });
}
