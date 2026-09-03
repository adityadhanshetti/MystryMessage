import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useUsernameAvailability } from "../../features/profile/publicApi";

import { useMyProfile, useUpdateProfile } from "../../features/profile/api";

export const Route = createFileRoute("/_authenticated/settings")({
    component: SettingsPage,
});

function SettingsPage() {
    const { data, isLoading, isError, error } = useMyProfile();
    const usernameAvailability = useUsernameAvailability(form.username);

    const updateProfile = useUpdateProfile();

    const [form, setForm] = useState({
        username: "",
        display_name: "",
        bio: "",
        is_public: true,
    });

    useEffect(() => {
        const profile = data?.data;

        if (!profile) {
            return;
        }

        setForm({
            username: profile.username,
            display_name: profile.display_name,
            bio: profile.bio,
            is_public: profile.is_public,
        });
    }, [data]);

    if (isLoading) {
        return <p>Loading settings...</p>;
    }

    if (isError) {
        return <p>Error: {error.message}</p>;
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,

            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        updateProfile.mutate({
            username: form.username,
            display_name: form.display_name,
            bio: form.bio,
            is_public: form.is_public,
        });
    }

    return (
        <section>
            <h1>Settings</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>

                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        minLength={3}
                        maxLength={30}
                        required
                    />
                    {usernameAvailability.isLoading && (
                        <small>Checking username...</small>
                    )}

                    {usernameAvailability.data?.data && (
                        <small>
                            {usernameAvailability.data.data.available
                                ? "Username is available."
                                : "Username is already taken."}
                        </small>
                    )}
                </div>

                <div>
                    <label>Display name</label>

                    <input
                        name="display_name"
                        value={form.display_name}
                        onChange={handleChange}
                        maxLength={80}
                        required
                    />
                </div>

                <div>
                    <label>Bio</label>

                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        maxLength={300}
                        rows={4}
                    />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={form.is_public}
                            onChange={handleChange}
                        />
                        Public profile
                    </label>

                    <p>
                        Allow people to visit your Mystry profile and send you
                        anonymous messages.
                    </p>
                </div>

                <button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving..." : "Save changes"}
                </button>

                {updateProfile.isSuccess && <p>Settings saved successfully.</p>}

                {updateProfile.isError && <p>{updateProfile.error.message}</p>}
            </form>
        </section>
    );
}
