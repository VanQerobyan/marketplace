import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AddRatingResponse, ListingRatingResponse, ListingRatingsResponse, UserRating } from "../../src/types/ratingType";

export const ratingApi = createApi({
    reducerPath: "ratingApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/ratings",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["rating"],
    endpoints: (builder) => ({
        getUserRating: builder.query<UserRating, string>({
            query: (userId: string) => `/user/${userId}`,
            providesTags: ["rating"]
        }),

        addUserRating: builder.mutation<AddRatingResponse, {rating: number, comment: string, userId: string}>({
            query: ({rating, comment, userId}) => ({
                url: `user/${userId}`,
                method: "POST",
                body: {rating, comment}
            }),
            invalidatesTags: ["rating"]
        }),
        addListingRating: builder.mutation<ListingRatingResponse, {rating: number, comment: string, listingId: number}>({
            query: ({rating, comment, listingId}) => ({
                url: `/listing/${listingId}`,
                method: "POST",
                body: {rating, comment}
            }),
            invalidatesTags: ["rating"]
        }),
        getListingRatings: builder.query<ListingRatingsResponse, number>({
            query: (listingId) => `/listing/${listingId}`,
            providesTags: ["rating"]
        })
    })

})

export const { useGetUserRatingQuery, useAddUserRatingMutation, useAddListingRatingMutation, useGetListingRatingsQuery } = ratingApi;
