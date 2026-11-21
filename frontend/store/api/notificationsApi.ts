import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AllNotificationRead, NotificationResponse, ReadNotificationResponse } from "../../src/types/notificationType";

export const notificationsApi = createApi({
    reducerPath: "notificationsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/notifications",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["notification"],
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationResponse, void>({
            query: () => "/",
            providesTags: ["notification"]
        }),
        readAllNotifications: builder.mutation<AllNotificationRead, void>({
            query: () => ({
                url: "/read-all",
                method: "PATCH"                
            }),
            invalidatesTags: ["notification"]
        }),
        readOneNotification: builder.mutation<ReadNotificationResponse, number>({
            query: (id: number) => ({
                url: `/${id}/read`,
                method: "PATCH"
            }),
            invalidatesTags: ["notification"]
        }),
        deleteNotification: builder.mutation<void, number>({
            query: (id: number) => ({
                url: `/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["notification"]
        })
    })
})


export const {useGetNotificationsQuery, useReadAllNotificationsMutation, useReadOneNotificationMutation, useDeleteNotificationMutation} = notificationsApi;
