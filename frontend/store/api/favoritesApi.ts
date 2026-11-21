import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AddFavoriteResponse, SuccessFavoriteResponse } from "../../src/types/favoritesType";

export const favoriteApi = createApi({
    reducerPath: "favoriteApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/favorites",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["favorites"],
    endpoints: (builder) => ({
        getFavorites: builder.query<SuccessFavoriteResponse, void>({
            query: () => "/",
            providesTags:["favorites"],
        }),
        addListing: builder.mutation<AddFavoriteResponse, string>({
            query: (listingId: string) => ({
                url: `/${listingId}`,
                method: "POST",
            }),
            invalidatesTags: ["favorites"]
        }),
        deleteFavoriteListing: builder.mutation<void, number>({
            query: (listingId: number) => ({
                url: `/${listingId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["favorites"]
        })


    })
})


export const { useGetFavoritesQuery, useAddListingMutation, useDeleteFavoriteListingMutation } = favoriteApi;
