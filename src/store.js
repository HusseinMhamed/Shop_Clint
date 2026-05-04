import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import { apiSlice } from "./slices/apiSlice.js";
import SuccFaildComponent from "./slices/SuccessFaildState/SFS.ts";
const SuccFaildReducer = /** @type {import("@reduxjs/toolkit").Reducer} */ (
  SuccFaildComponent
);
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    SuccFaildComponent: SuccFaildReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});
