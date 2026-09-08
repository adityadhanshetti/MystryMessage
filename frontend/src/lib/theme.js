const THEME_STORAGE_KEY = "mystry-theme";

export function getStoredTheme() {
    if (typeof window === "undefined") return "system";
    return localStorage.getItem(THEME_STORAGE_KEY) || "system";
}

export function applyTheme(theme) {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
    } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
    }

    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore localStorage quota or access errors
    }
}
