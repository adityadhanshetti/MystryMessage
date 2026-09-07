import { useEffect, useState } from "react";
import { useMyProfile, useUpdateProfile, useAvatarUploadSignature, useMyStats } from "./api";
import CopyProfileLink from "./CopyProfileLink";
import ShareProfile from "./ShareProfile";
import ProfileQRCode from "./ProfileQRCode";

export default function Profile() {
    const { data, isLoading, isError, error } = useMyProfile();
    const { data: statsData } = useMyStats();
    const updateProfile = useUpdateProfile();
    const getUploadSignature = useAvatarUploadSignature();

    const [form, setForm] = useState({
        username: "",
        display_name: "",
        bio: "",
        avatar_url: "",
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    useEffect(() => {
        if (!data?.data) return;
        setForm({
            username: data.data.username || "",
            display_name: data.data.display_name || "",
            bio: data.data.bio || "",
            avatar_url: data.data.avatar_url || "",
        });
    }, [data]);

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/4" />
                <div className="surface-panel p-6 rounded-2xl space-y-4">
                    <div className="h-16 w-16 bg-slate-800 rounded-2xl" />
                    <div className="h-10 bg-slate-800 rounded w-1/2" />
                    <div className="h-20 bg-slate-800 rounded" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full max-w-4xl mx-auto p-5 rounded-2xl bg-red-950/30 border border-red-500/20 text-red-200">
                <p className="font-semibold text-sm">Unable to load profile</p>
                <p className="text-xs text-red-300/80 mt-1">{error.message}</p>
            </div>
        );
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((curr) => ({ ...curr, [name]: value }));
    }

    async function handleAvatarFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError("");
        setIsUploading(true);

        try {
            const sigResponse = await getUploadSignature.mutateAsync();
            const sigData = sigResponse?.data;

            if (sigData?.configured) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", sigData.api_key);
                formData.append("timestamp", sigData.timestamp);
                formData.append("signature", sigData.signature);
                formData.append("folder", sigData.folder);

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload image to Cloudinary.");
                }

                const result = await uploadRes.json();
                const secureUrl = result.secure_url;

                setForm((curr) => ({ ...curr, avatar_url: secureUrl }));
                updateProfile.mutate({ avatar_url: secureUrl });
            } else {
                setUploadError(
                    "Cloudinary is not configured. You can paste an image URL below.",
                );
            }
        } catch (err) {
            setUploadError(err.message || "Failed to upload avatar.");
        } finally {
            setIsUploading(false);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateProfile.mutate({
            username: form.username,
            display_name: form.display_name,
            bio: form.bio,
            avatar_url: form.avatar_url,
        });
    }

    const stats = statsData?.data;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="pb-5 border-b border-white/[0.08]">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    Profile
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Manage your public handle, bio, and sharing link.
                </p>
            </div>

            {/* Engagement Stats Bar */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="surface-panel p-4 rounded-2xl border border-white/[0.06]">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">
                            Total Messages
                        </span>
                        <div className="text-xl font-extrabold text-white mt-1">
                            {stats.total_messages ?? 0}
                        </div>
                    </div>

                    <div className="surface-panel p-4 rounded-2xl border border-white/[0.06]">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold block">
                            Reply Rate
                        </span>
                        <div className="text-xl font-extrabold text-emerald-300 mt-1">
                            {stats.reply_rate ?? 0}%
                        </div>
                    </div>

                    <div className="surface-panel p-4 rounded-2xl border border-white/[0.06]">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold block">
                            Unread
                        </span>
                        <div className="text-xl font-extrabold text-indigo-300 mt-1">
                            {stats.unread_count ?? 0}
                        </div>
                    </div>

                    <div className="surface-panel p-4 rounded-2xl border border-white/[0.06]">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-semibold block">
                            My Replies
                        </span>
                        <div className="text-xl font-extrabold text-purple-300 mt-1">
                            {stats.owner_replies ?? 0}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form column */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleSubmit}
                        className="surface-panel p-6 sm:p-7 rounded-2xl space-y-5"
                    >
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            {form.avatar_url ? (
                                <img
                                    src={form.avatar_url}
                                    alt={form.display_name}
                                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/[0.08]"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-white text-xl font-bold">
                                    {form.display_name?.charAt(0) || "U"}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-300">
                                    Profile Avatar
                                </label>
                                <label className="inline-block px-3 py-1.5 rounded-lg btn-secondary text-xs cursor-pointer">
                                    {isUploading ? "Uploading..." : "Upload via Cloudinary"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarFileChange}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                </label>
                                {uploadError && (
                                    <p className="text-[11px] text-amber-400 mt-1">
                                        {uploadError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Avatar Image URL (Optional)
                            </label>
                            <input
                                name="avatar_url"
                                value={form.avatar_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full surface-input rounded-xl px-3.5 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Display Name
                            </label>
                            <input
                                name="display_name"
                                value={form.display_name}
                                onChange={handleChange}
                                maxLength={80}
                                required
                                className="w-full surface-input rounded-xl px-3.5 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">
                                    @
                                </span>
                                <input
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    minLength={3}
                                    maxLength={30}
                                    required
                                    className="w-full surface-input rounded-xl pl-7 pr-3.5 py-2 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                maxLength={300}
                                rows={3}
                                placeholder="Write something about yourself..."
                                className="w-full surface-input rounded-xl p-3 text-xs resize-none"
                            />
                            <span className="text-[10px] text-slate-500 font-mono block text-right mt-1">
                                {form.bio.length}/300
                            </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={updateProfile.isPending}
                                className="px-5 py-2 rounded-xl btn-primary text-white font-semibold text-xs disabled:opacity-50 cursor-pointer"
                            >
                                {updateProfile.isPending ? "Saving..." : "Save Changes"}
                            </button>

                            {updateProfile.isSuccess && (
                                <span className="text-xs text-emerald-400 font-medium">
                                    ✓ Changes saved
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

                {/* Share Sidebar */}
                <div className="space-y-4">
                    <div className="surface-panel p-6 rounded-2xl space-y-4">
                        <h2 className="font-bold text-white text-sm">
                            Share Profile Link
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Share this link with friends or on social media to
                            receive anonymous questions.
                        </p>

                        <div className="space-y-2">
                            <CopyProfileLink username={form.username} />
                            <ShareProfile username={form.username} />
                        </div>

                        <div className="pt-4 border-t border-white/[0.08]">
                            <ProfileQRCode username={form.username} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
