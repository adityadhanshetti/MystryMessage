export function getProfileUrl(username) {
    const normalizedUsername = username.trim().toLowerCase();

    return `${window.location.origin}/${normalizedUsername}`;
}
