import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";

import { createFileRoute } from "@tanstack/react-router";
import Profile from "../features/profile/Profile";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <main>
            <h1>Mystry Message</h1>

            <SignedOut>
                <SignInButton />
            </SignedOut>

            <SignedIn>
                <UserButton />
                <Profile />
            </SignedIn>
        </main>
    );
}
