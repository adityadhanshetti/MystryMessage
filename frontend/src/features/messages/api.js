import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api";

export function useSendAnonymousMessage() {
    return useMutation({
        mutationFn: async ({ username, content }) => {
            return apiRequest(`/messages/${username}`, {
                method: "POST",
                body: {
                    content,
                },
            });
        },
    });
}
