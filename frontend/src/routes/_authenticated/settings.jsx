import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../../store/uiSlice";
import { useMyProfile, useUpdateProfile } from "../../features/profile/api";

export const Route = createFileRoute("/_authenticated/settings")({
    component: SettingsPage,
});

function SettingsPage() {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.ui.theme) || "system";

    const { data, isLoading, isError, error } = useMyProfile();
    const updateProfile = useUpdateProfile();

    const [form, setForm] = useState({
        username: "",
        display_name: "",
        bio: "",
        is_public: true,
        accept_messages: true,
    });

    useEffect(() => {
        const profile = data?.data;
        if (!profile) return;

        setForm({
            username: profile.username || "",
            display_name: profile.display_name || "",
            bio: profile.bio || "",
            is_public: profile.is_public !== false,
            accept_messages: profile.accept_messages !== false,
        });
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/4" />
                <div className="surface-panel p-6 rounded-2xl space-y-4">
                    <div className="h-10 bg-slate-800 rounded" />
                    <div className="h-10 bg-slate-800 rounded" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full max-w-2xl mx-auto p-5 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-200">
                <p className="font-semibold text-sm">Unable to load settings</p>
                <p className="text-xs text-red-300/80 mt-1">{error.message}</p>
            </div>
        );
    }

    function handleChange(event) {
        const { name, type, checked } = event.target;
        setForm((curr) => ({
            ...curr,
            [name]: type === "checkbox" ? checked : event.target.value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateProfile.mutate({
            username: form.username,
            display_name: form.display_name,
            bio: form.bio,
            is_public: form.is_public,
            accept_messages: form.accept_messages,
        });
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="pb-5 border-b border-white/[0.08]">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Settings
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Privacy controls, messaging availability, and display preferences.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Privacy Panel */}
                <div className="surface-panel p-5 sm:p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-bold text-white border-b border-white/[0.08] pb-3">
                        Privacy & Safety
                    </h2>

                    {/* Accept Messages Toggle */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white block">
                                Allow Anonymous Messages
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                When turned off, visitors to your profile cannot send
                                messages or start threads.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                name="accept_messages"
                                checked={form.accept_messages}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600" />
                        </label>
                    </div>

                    {/* Public Profile Toggle */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
                        <div>
                            <label className="text-xs font-semibold text-white block">
                                Public Profile Visibility
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                Allows your public handle to be resolved by anyone with
                                your link.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                name="is_public"
                                checked={form.is_public}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600" />
                        </label>
                    </div>
                </div>

                {/* Appearance Panel */}
                <div className="surface-panel p-5 sm:p-6 rounded-2xl space-y-4">
                    <h2 className="text-sm font-bold text-white border-b border-white/[0.08] pb-3">
                        Appearance
                    </h2>

                    <div>
                        <label className="text-xs font-semibold text-white block mb-2">
                            Theme Mode
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "system", label: "System" },
                                { id: "dark", label: "Dark" },
                                { id: "light", label: "Light" },
                            ].map(({ id, label }) => (
                                <button
                                    type="button"
                                    key={id}
                                    onClick={() => dispatch(setTheme(id))}
                                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                        currentTheme === id
                                            ? "bg-white/[0.12] text-white border-white/[0.15] shadow-sm"
                                            : "btn-secondary text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="px-5 py-2 rounded-xl btn-primary text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
                    >
                        {updateProfile.isPending ? "Saving..." : "Save Settings"}
                    </button>

                    {updateProfile.isSuccess && (
                        <span className="text-xs text-emerald-400 font-medium">
                            ✓ Settings saved
                        </span>
                    )}
                    {updateProfile.isError && (
                        <span className="text-xs text-red-400 font-medium">
                            {updateProfile.error.message}
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
