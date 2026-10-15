import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVER_URL } from "../Constant.js";

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    // الاعتماد على خيار fetch credentials (وليس هيدر) لإرسال الكوكيز
    fetchFn: (url, options) =>
      fetch(url, { ...options, credentials: "include" }),
  }),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
