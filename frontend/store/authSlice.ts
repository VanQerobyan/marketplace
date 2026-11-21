import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
    token: string | null;
    refreshToken: string | null;
    sessionVersion: number;
};

const initialState: AuthState = {
    token: sessionStorage.getItem("authToken"),
    refreshToken: sessionStorage.getItem("refreshToken"),
    sessionVersion: 0,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        credentialsReceived: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.sessionVersion += 1;
        },
        accessTokenReceived: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        loggedOut: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.sessionVersion += 1;
        },
    },
});

export const { credentialsReceived, accessTokenReceived, loggedOut } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
