import { createSlice } from "@reduxjs/toolkit";
import { applyTheme, getStoredTheme } from "../lib/theme";

const initialTheme = getStoredTheme();
if (typeof window !== "undefined") {
    applyTheme(initialTheme);
}

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
            applyTheme(action.payload);
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
