import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <main>
            <h1>Mystry Message</h1>

            <p>Receive anonymous messages from anyone.</p>

            <SignedOut>
                <SignInButton />
            </SignedOut>

            <SignedIn>
                <Link to="/inbox">Go to Inbox</Link>
            </SignedIn>
        </main>
    );
}
