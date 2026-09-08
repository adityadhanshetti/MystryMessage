import { useEffect } from "react";
import { useSelector } from "react-redux";
import { applyTheme } from "../lib/theme";

export default function ThemeWatcher() {
    const theme = useSelector((state) => state.ui.theme) || "system";

    useEffect(() => {
        applyTheme(theme);

        if (theme === "system" && typeof window !== "undefined") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                applyTheme("system");
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => {
                mediaQuery.removeEventListener("change", handleChange);
            };
        }
    }, [theme]);

    return null;
}
