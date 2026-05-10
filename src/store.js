import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import { apiSlice } from "./slices/apiSlice.js";
import SuccFaildComponent from "./slices/SuccessFaildState/SFS.ts";
import ContactReducer from "./slices/ContactSlice.js";
const SuccFaildReducer = /** @type {import("@reduxjs/toolkit").Reducer} */ (
  SuccFaildComponent
);
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    SuccFaildComponent: SuccFaildReducer,
    ContactReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});
