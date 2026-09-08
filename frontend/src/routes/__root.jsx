import { createRootRoute, Outlet } from "@tanstack/react-router";
import ThemeWatcher from "../components/ThemeWatcher";

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-150">
            <ThemeWatcher />
            <Outlet />
        </div>
    );
}
