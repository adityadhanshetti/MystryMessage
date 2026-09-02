import { useEffect, useState } from "react";

import { useMyProfile, useUpdateProfile } from "./api";

export default function Profile() {
    const { data, isLoading, isError, error } = useMyProfile();

    const updateProfile = useUpdateProfile();

    const [form, setForm] = useState({
        username: "",
        display_name: "",
        bio: "",
    });

    useEffect(() => {
        if (!data?.data) {
            return;
        }

        setForm({
            username: data.data.username,
            display_name: data.data.display_name,
            bio: data.data.bio,
        });
    }, [data]);

    if (isLoading) {
        return <p>Loading profile...</p>;
    }

    if (isError) {
        return <p>Error: {error.message}</p>;
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        updateProfile.mutate({
            username: form.username,
            display_name: form.display_name,
            bio: form.bio,
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username</label>

                <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    minLength={3}
                    maxLength={30}
                />
            </div>

            <div>
                <label>Display name</label>

                <input
                    name="display_name"
                    value={form.display_name}
                    onChange={handleChange}
                    maxLength={80}
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

            <button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>

            {updateProfile.isSuccess && <p>Profile updated successfully.</p>}

            {updateProfile.isError && <p>{updateProfile.error.message}</p>}
        </form>
    );
}
