export type SignUpUser = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type SigninUser = {
  username: string;
  password: string;
};

export type AccountUser = {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null
  username: string;
  email: string;
  hasPassword?: boolean;
};

export type AccountProfile = AccountUser & {
  averageRating: number;
  ratingsCount: number;
};

export type UserById = {
    id: number,
    avatar: string | null,
    firstName: string,
    lastName: string,
    username: string,
    createdAt: string,
    averageRating: number,
    ratingsCount: number
}

export type SuccessResponse<T> = {
  success: boolean,
  data: T
}

export type EditAccount = Omit<AccountUser, "id" | "avatar" | "hasPassword">


export type UserSearchResponse = {
  success: boolean;
  data: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export type UserSearchParams = {
   search: string;
  page?: number;
  limit?: number;
}
