import { configureStore } from "@reduxjs/toolkit";
import { usersApi } from "./api/usersApi";
import { listingsApi } from "./api/listingsApi";
import { authApi } from "./api/authApi";
import { favoriteApi } from "./api/favoritesApi";
import { ratingApi } from "./api/ratingApi";
import authReducer from "./authSlice";
import { createSessionMiddleware } from "./sessionMiddleware";
import { notificationsApi } from "./api/notificationsApi";
import { messagesApi } from "./api/messagesApi";
import { paymentsApi } from "./api/paymentsApi";

const sessionMiddleware = createSessionMiddleware(
    [usersApi, listingsApi, authApi, favoriteApi, ratingApi, notificationsApi, messagesApi, paymentsApi].map((service) => service.util.resetApiState),
);

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [usersApi.reducerPath]: usersApi.reducer,
        [listingsApi.reducerPath]: listingsApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
        [favoriteApi.reducerPath]: favoriteApi.reducer,
        [ratingApi.reducerPath]: ratingApi.reducer,
        [notificationsApi.reducerPath]: notificationsApi.reducer,
        [messagesApi.reducerPath]: messagesApi.reducer,
        [paymentsApi.reducerPath]: paymentsApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sessionMiddleware, usersApi.middleware, listingsApi.middleware, authApi.middleware, favoriteApi.middleware, ratingApi.middleware, notificationsApi.middleware, messagesApi.middleware, paymentsApi.middleware)
})
