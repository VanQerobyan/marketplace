import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ConversationsResponse, MessagesResponse } from "../../src/types/messageType";
import { notificationsApi } from "./notificationsApi";

export const messagesApi = createApi({
    reducerPath: "messagesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/messages",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["messages"],
    endpoints: (builder) => ({
        getConversations: builder.query<ConversationsResponse, number>({
            query: (page) => ({ url: "/conversations", params: { page, limit: 20 } }),
            providesTags: ["messages"]
        }),
        getMessages: builder.query<MessagesResponse, { userId: number; page: number }>({
            query: ({ userId, page }) => ({ url: `/user/${userId}`, params: { page, limit: 20 } }),
            providesTags: ["messages"]
        }),
        readMessages: builder.mutation<{ success: boolean; data: { updatedCount: number } }, number>({
            query: (userId) => ({ url: `/user/${userId}/read`, method: "PATCH" }),
            invalidatesTags: (result) => result ? ["messages"] : [],
            async onQueryStarted(_userId, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(notificationsApi.util.invalidateTags(["notification"]));
                } catch {
                    // Keep notification state unchanged when marking messages as read fails.
                }
            },
        })
    })
});

export const { useGetConversationsQuery, useGetMessagesQuery, useReadMessagesMutation } = messagesApi;
