import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  AccountProfile,
  AccountUser,
  EditAccount,
  SuccessResponse,
  UserById,
  UserSearchParams,
  UserSearchResponse,
} from "../../src/types/userTypes";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
      baseUrl: "http://localhost:5000/api/users",
      prepareHeaders: (headers) => {
          const token = sessionStorage.getItem("authToken");
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return headers;
      },
  }),
  tagTypes: ["usersData"],
  endpoints: (builder) => ({
    getUsers: builder.query<SuccessResponse<AccountProfile>, void>({
      query: () => "/me",
      providesTags: ["usersData"],
    }),
    updateAvatar: builder.mutation<SuccessResponse<AccountUser>, FormData>({
      query: (avatar) => ({
        url: "/me/avatar",
        method: "PATCH",
        body: avatar,
      }),
      invalidatesTags: ["usersData"],
    }),
    editUser: builder.mutation<SuccessResponse<AccountUser>, Partial<EditAccount>>({
      query: (editingData) => ({
        url: "/me",
        method: "PATCH",
        body: editingData,
      }),
      invalidatesTags: ["usersData"],
    }),
    userById: builder.query<SuccessResponse<UserById>, string>({
      query: (id: string) => `/${id}`,
      providesTags: ["usersData"]
    }),
    getAnotherUser: builder.query<UserSearchResponse, UserSearchParams>({
      query: ({search, page = 1, limit = 12}) => ({
        url: "/",
        params: {search, page, limit}
      })
    })
  }),
});

export const {
  useGetUsersQuery,
  useUpdateAvatarMutation,
  useEditUserMutation,
  useUserByIdQuery,
  useGetAnotherUserQuery
} = usersApi;
