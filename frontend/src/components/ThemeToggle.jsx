import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../store/uiSlice";
import { SunIcon, MoonIcon, MonitorIcon } from "./icons";

export default function ThemeToggle({ className = "" }) {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.ui.theme) || "system";

    const nextThemeMap = {
        system: "dark",
        dark: "light",
        light: "system",
    };

    function handleToggle() {
        const next = nextThemeMap[currentTheme] || "dark";
        dispatch(setTheme(next));
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            title={`Current theme: ${currentTheme.toUpperCase()} (Click to switch)`}
            aria-label={`Switch theme (current: ${currentTheme})`}
            className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium 
                bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700
                dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:border-white/[0.1] dark:text-slate-300 dark:hover:text-white
                ${className}`}
        >
            {currentTheme === "dark" && (
                <MoonIcon className="w-4 h-4 text-indigo-400 transition-transform hover:scale-110" />
            )}
            {currentTheme === "light" && (
                <SunIcon className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
            )}
            {currentTheme === "system" && (
                <MonitorIcon className="w-4 h-4 text-sky-400 transition-transform hover:scale-110" />
            )}
            <span className="capitalize hidden sm:inline text-[11px] font-semibold">
                {currentTheme}
            </span>
        </button>
    );
}
