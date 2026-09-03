import { createSlice } from "@reduxjs/toolkit";

const initialTheme =
    typeof window !== "undefined" && localStorage.getItem("mystry-theme")
        ? localStorage.getItem("mystry-theme")
        : "system";

const initialState = {
    theme: initialTheme,
    inboxFilter: "all", // 'all' | 'unread' | 'read'
    toast: null, // { type: 'success' | 'error' | 'info', message: string } | null
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("mystry-theme", action.payload);
            }
        },
        setInboxFilter: (state, action) => {
            state.inboxFilter = action.payload;
        },
        showToast: (state, action) => {
            state.toast = action.payload;
        },
        clearToast: (state) => {
            state.toast = null;
        },
    },
});

export const { setTheme, setInboxFilter, showToast, clearToast } =
    uiSlice.actions;

export default uiSlice.reducer;
