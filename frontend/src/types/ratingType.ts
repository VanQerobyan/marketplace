export type RatingItems = {
        id: number,
        raterId: number,
        ratedUserId: number,
        rating: number,
        comment: string | null,
        createdAt: string,
        updatedAt: string
}      


 export type ListingRating = {
    id: number,
    raterId: number,
    listingId: number,
    rating: number,
    comment: string | null,
    updatedAt: string,
    createdAt: string,
}

export type ListingRatingResponse = {
    success: boolean,
    data: ListingRating
} 

export type Data = {
    averageRating: number,
    ratingsCount: number,
    items: RatingItems[]
}

export type UserRating = {
    success: boolean,
    data: Data
} 

export type AddRatingResponse = {
    success: boolean,
    data: RatingItems
}

export type ListingRatingsResponse = {
    success: boolean,
    data: {
        averageRating: number,
        ratingsCount: number,
        items: ListingRating[]
    }
}
