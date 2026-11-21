import type { Listing } from "./listingType";

type FavoriteListing = Omit<Listing, "images"> & {
    images: string[];
};

export type FavoriteResponseData = {
    id: number,
    userId: number,
    listingId: number,
    createdAt: string,
    listing: FavoriteListing | null
}

export type SuccessFavoriteResponse = {
    success: boolean,
    data: FavoriteResponseData[]
}

export type AddFavoriteResponse = {
    success: boolean;
    data: Omit<FavoriteResponseData, "listing"> & {
        updatedAt: string;
    };
};
