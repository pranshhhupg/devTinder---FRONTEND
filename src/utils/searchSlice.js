import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    results:      [],
    query:        "",
    role:         "all",
    availability: "all",
    total:        0,
    page:         1,
    totalPages:   0,
    loading:      false,
    error:        null,
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.results    = action.payload.data;
      state.total      = action.payload.total;
      state.page       = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.error      = null;
    },
    setSearchQuery:        (state, action) => { state.query        = action.payload; },
    setSearchRole:         (state, action) => { state.role         = action.payload; },
    setSearchAvailability: (state, action) => { state.availability = action.payload; },
    setSearchLoading:      (state, action) => { state.loading      = action.payload; },
    setSearchError:        (state, action) => { state.error        = action.payload; loading: false; },
    clearSearch: (state) => {
      state.results      = [];
      state.query        = "";
      state.role         = "all";
      state.availability = "all";
      state.total        = 0;
      state.page         = 1;
      state.totalPages   = 0;
      state.loading      = false;
      state.error        = null;
    },
  },
});

export const {
  setSearchResults,
  setSearchQuery,
  setSearchRole,
  setSearchAvailability,
  setSearchLoading,
  setSearchError,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;