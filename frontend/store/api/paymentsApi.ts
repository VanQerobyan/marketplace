import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { SuccessResponse } from "../../src/types/userTypes";
import type { Order, PaymentConfig, PurchasesResponse } from "../../src/types/paymentType";

export const paymentsApi = createApi({
    reducerPath: "paymentsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/payments",
        prepareHeaders: (headers) => {
            const token = sessionStorage.getItem("authToken");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["purchases"],
    endpoints: (builder) => ({
        getPaymentConfig: builder.query<SuccessResponse<PaymentConfig>, void>({
            query: () => "/config",
        }),
        createCheckout: builder.mutation<SuccessResponse<{ url: string }>, number>({
            query: (listingId) => ({ url: "/checkout", method: "POST", body: { listingId } }),
        }),
        confirmPayment: builder.mutation<SuccessResponse<Order>, string>({
            query: (sessionId) => ({ url: "/confirm", method: "POST", body: { sessionId } }),
            invalidatesTags: (_result, error) => error ? [] : ["purchases"],
        }),
        getMyPurchases: builder.query<PurchasesResponse, number>({
            query: (page) => ({ url: "/mine", params: { page } }),
            providesTags: ["purchases"],
        }),
    }),
});

export const { useGetPaymentConfigQuery, useCreateCheckoutMutation, useConfirmPaymentMutation, useGetMyPurchasesQuery } = paymentsApi;
