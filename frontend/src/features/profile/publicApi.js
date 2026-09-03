import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/api";

export function useUsernameAvailability(username) {
    const normalizedUsername = username.trim().toLowerCase();

    return useQuery({
        queryKey: ["username-availability", normalizedUsername],

        queryFn: () =>
            apiRequest(
                `/users/username/${encodeURIComponent(
                    normalizedUsername,
                )}/availability`,
            ),

        enabled: normalizedUsername.length >= 3,

        staleTime: 10 * 1000,

        retry: false,
    });
}

export function publicProfileQuery(username) {
    return {
        queryKey: publicProfileKeys.byUsername(username),

        queryFn: () =>
            apiRequest(`/users/public/${encodeURIComponent(username)}`),

        staleTime: 60 * 1000,

        retry: false,
    };
}
