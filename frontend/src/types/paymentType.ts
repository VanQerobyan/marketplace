import type { Pagination } from "./listingType";

export type Order = {
    id: number;
    buyerId: number;
    listingId: number | null;
    title: string;
    amount: number;
    currency: "usd";
    status: "paid_test";
    stripeSessionId: string;
    createdAt: string;
    updatedAt: string;
};

export type PurchasesResponse = {
    success: boolean;
    data: Order[];
    pagination: Pagination;
};

export type PaymentConfig = {
    enabled: boolean;
    testMode: true;
};
