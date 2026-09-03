import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Provider } from "react-redux";

import { RouterProvider } from "@tanstack/react-router";

import { store } from "./store";
import { router } from "./router";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

function App() {
    const auth = useAuth();

    return (
        <RouterProvider
            router={router}
            context={{
                auth,
                queryClient,
            }}
        />
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ClerkProvider publishableKey={clerkPubKey}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </Provider>
        </ClerkProvider>
    </React.StrictMode>,
);
