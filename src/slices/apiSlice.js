import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
    prepareHeaders: (headers, { getState }) => {
      headers.set("credentials", "include"); // يخبر المتصفح بالتعامل مع الكوكيز
      return headers;
    },
    fetchFn: (url, options) =>
      fetch(url, { ...options, credentials: "include" }),
  }),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
