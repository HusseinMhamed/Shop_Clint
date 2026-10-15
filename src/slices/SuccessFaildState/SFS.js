import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "none",
  showComponent: false,
  title: "",
  descreption: "",
};
export const SFS_Slice = createSlice({
  name: "SFS",
  initialState,
  reducers: {
    open: (
      state,
      action,
    ) => {
      state.showComponent = true;
      // required
      state.state = action.payload.state;
      state.title = action.payload.title || "";
      state.descreption = action.payload.descreption || "";
    },
    close: () => {
      return initialState;
    },
    loading: (state) => {
      state.state = "loading";
    },
  },
});

export const { open, close, loading } = SFS_Slice.actions;

export default SFS_Slice.reducer;
