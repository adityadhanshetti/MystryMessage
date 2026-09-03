export function getProfileUrl(username) {
    if (!username) {
        return typeof window !== "undefined" ? window.location.origin : "";
    }
    const normalizedUsername = username.trim().toLowerCase();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${normalizedUsername}`;
}
