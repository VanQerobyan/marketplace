import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type ChangePasswordType, type SignIn, type SignUp, type SignUpResponse, type SuccessRefreshToken, type SuccessSignInResponse, type SuccessSignUpResponse} from "../../src/types/authType";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/auth",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        googleConfig: builder.query<{ success: boolean; data: { clientId: string | null } }, void>({
            query: () => "/google/config",
            extraOptions: { skipReauth: true },
        }),
        googleSignIn: builder.mutation<SuccessSignInResponse, { credential: string; nonce: string; password?: string }>({
            query: (body) => ({ url: "/google", method: "POST", body }),
            extraOptions: { skipReauth: true },
        }),
        signUp: builder.mutation<SuccessSignUpResponse<SignUpResponse>, SignUp>({
            query: (signUpdata) => ({
                url: "/register",
                method: "POST",
                body: signUpdata
            }),
            extraOptions: { skipReauth: true },
        }),
        signIn: builder.mutation<SuccessSignInResponse, SignIn>({
            query: (signInData) => ({
                url: "/login",
                method: "POST",
                body: signInData
            }),
            extraOptions: { skipReauth: true },
        }),
        changePassword: builder.mutation<void, ChangePasswordType>({
            query: (data) => ({
                url: "/change-password",
                method: "PATCH",
                body: data
            }),
        }),
        refreshToken: builder.mutation<SuccessRefreshToken, string>({
            query: (refreshToken) => ({
                url: "/refresh",
                method:"POST",
                body: { refreshToken }
            }),
            extraOptions: { skipReauth: true },
        })
    })
})

export const { useSignUpMutation, useSignInMutation, useChangePasswordMutation, useRefreshTokenMutation, useGoogleConfigQuery, useGoogleSignInMutation } = authApi
