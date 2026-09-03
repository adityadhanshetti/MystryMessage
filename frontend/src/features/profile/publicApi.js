import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";

export const publicProfileKeys = {
    all: ["public-profile"],
    byUsername: (username) => [
        "public-profile",
        username ? username.trim().toLowerCase() : "",
    ],
};

export function useUsernameAvailability(username) {
    const normalizedUsername = username ? username.trim().toLowerCase() : "";

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
    const normalized = username ? username.trim().toLowerCase() : "";
    return {
        queryKey: publicProfileKeys.byUsername(normalized),
        queryFn: () =>
            apiRequest(`/users/public/${encodeURIComponent(normalized)}`),
        staleTime: 60 * 1000,
        retry: false,
    };
}
