import { createSlice } from "@reduxjs/toolkit";

const ContactSlice = createSlice({
  name: "contact",
  initialState: {
    openOverlay: false,
  },
  reducers: {
    open: (state) => {
      state.openOverlay = true;
    },
    close: (state) => {
      state.openOverlay = false;
    },
  },
});

export const { open, close } = ContactSlice.actions;

export default ContactSlice.reducer;
