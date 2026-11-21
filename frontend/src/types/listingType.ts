export type Listing = {
    id: number,
    userId: number,
    title: string,
    description: string,
    price: string,
    category: string | null,
    status: "sold" | "reserved" | "active",
    viewsCount: number,
    images: string[],
    createdAt: string,
    updatedAt: string
} 

export type Pagination = {
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number,
}

export type ListingResponse = {
    success: boolean,
    data: Listing[],
    pagination: Pagination
}

export type MyListingsParams = {
    page?: number,
    limit?: number,
    status?: Listing["status"],
    sort?: "newest" | "oldest" | "price_asc" | "price_desc",
}

export type UserListingsParams = MyListingsParams & {
    userId: number,
}

export type ListingsParams = MyListingsParams & {
    search?: string,
}

export type CreatedListing = Omit<Listing, "id" | "updatedAt" | "createdAt" |"viewsCount" | "userId" | "status" | "category" | "images"> & {
    category: string,
    images: FileList,
}
export type UpdatedListing = Omit<Listing, "id" | "updatedAt" | "createdAt" |"viewsCount" | "userId" | "category" | "images"> & {
    category: string,
    images: FileList,
}
