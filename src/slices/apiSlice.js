import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    // baseUrl: "http://localhost:5000",
    baseUrl: "https://shop-server-gupk.onrender.com",
    prepareHeaders: (headers) => {
      headers.set("credentials", "include"); // يخبر المتصفح بالتعامل مع الكوكيز
      return headers;
    },
    fetchFn: (url, options) =>
      fetch(url, { ...options, credentials: "include" }),
  }),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
