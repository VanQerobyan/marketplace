import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Listing, ListingResponse, ListingsParams, MyListingsParams } from "../../src/types/listingType";
import type { SuccessResponse } from "../../src/types/userTypes";

export const listingsApi = createApi({
    reducerPath: "listings/api",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/listings",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["listing"],
    endpoints: (builder) => ({
        getListings: builder.query<ListingResponse, ListingsParams>({
            query: (params) => ({ url: "/", params }),
            providesTags: ["listing"],
        }),
        myListings: builder.query<ListingResponse, MyListingsParams | void>({
            query: (params) => ({
                url: "/mine",
                params: params || undefined,
            }),
            providesTags: ["listing"],
        }),
        createListing: builder.mutation<SuccessResponse<Listing>, FormData>({
            query: (listingData) => ({
                url: "",
                method: "POST",
                body: listingData
            }),
            invalidatesTags: ["listing"]
        }),
        oneListing: builder.query<SuccessResponse<Listing>, string>({
            query: (id) => `/${id}`,
            providesTags: ["listing"]
        }),
        editOneListing: builder.mutation<SuccessResponse<Listing>, {id: string, editingData: FormData}>({
            query: ({id, editingData}) => ({
                url: `/${id}`,
                method: "PATCH",
                body: editingData
            }),
            invalidatesTags: ["listing"]
        }),
        deleteListing: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["listing"]
        }),
        listingStatusUpdate: builder.mutation<SuccessResponse<Listing>, {id: string, status: string}>({
            query: ({id, status}) => ({
                url: `/${id}/status`,
                method: "PATCH",
                body: { "status": status }
            }),
            invalidatesTags: ["listing"]
        }),
        getUserListing: builder.query<ListingResponse, string>({
            query: (id: string) => ({
                url: `/`,
                params: {userId: id }
            }) 
        })
    })
})

export const { useGetListingsQuery, useMyListingsQuery, useCreateListingMutation, useOneListingQuery, useEditOneListingMutation, useDeleteListingMutation, useListingStatusUpdateMutation, useGetUserListingQuery } = listingsApi;
