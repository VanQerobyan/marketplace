import type { Middleware, UnknownAction } from "@reduxjs/toolkit";
import { accessTokenReceived, credentialsReceived, loggedOut, selectAuth } from "./authSlice";
import type { AuthState } from "./authSlice";

export const createSessionMiddleware = (resetApiStates: Array<() => UnknownAction>): Middleware =>
    (api) => (next) => (action) => {
        const result = next(action);
        if (credentialsReceived.match(action) || accessTokenReceived.match(action)) {
            const { token, refreshToken } = selectAuth(api.getState() as { auth: AuthState });
            if (token) sessionStorage.setItem("authToken", token);
            else sessionStorage.removeItem("authToken");
            if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
            else sessionStorage.removeItem("refreshToken");
        }
        if (loggedOut.match(action)) {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("refreshToken");
        }
        if (loggedOut.match(action) || credentialsReceived.match(action)) {
            for (const resetApiState of resetApiStates) api.dispatch(resetApiState());
        }
        return result;
    };
