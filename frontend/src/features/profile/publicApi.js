import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/api";

export const publicProfileKeys = {
    all: ["public-profile"],

    byUsername: (username) => [...publicProfileKeys.all, username],
};

export function usePublicProfile(username) {
    return useQuery({
        queryKey: publicProfileKeys.byUsername(username),

        queryFn: () =>
            apiRequest(`/users/public/${encodeURIComponent(username)}`),

        enabled: Boolean(username),

        staleTime: 60 * 1000,

        retry: false,
    });
}
