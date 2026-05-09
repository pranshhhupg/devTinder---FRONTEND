import { createSlice } from "@reduxjs/toolkit";

/**
 * community state shape:
 * {
 *   list:    [...all communities shown in CommunityList],
 *   current: {...single community detail},
 * }
 */
const communitySlice = createSlice({
  name: "community",
  initialState: {
    list: [],
    current: null,
  },
  reducers: {
    setCommunities: (state, action) => {
      state.list = action.payload;
    },
    appendCommunities: (state, action) => {
      state.list = [...state.list, ...action.payload];
    },
    addCommunity: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateCommunityInStore: (state, action) => {
      const idx = state.list.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
      if (state.current?._id === action.payload._id)
        state.current = action.payload;
    },
    removeCommunityFromStore: (state, action) => {
      state.list = state.list.filter((c) => c._id !== action.payload);
      if (state.current?._id === action.payload) state.current = null;
    },
    setCurrentCommunity: (state, action) => {
      state.current = action.payload;
    },
    clearCurrentCommunity: (state) => {
      state.current = null;
    },
  },
});

export const {
  setCommunities,
  appendCommunities,
  addCommunity,
  updateCommunityInStore,
  removeCommunityFromStore,
  setCurrentCommunity,
  clearCurrentCommunity,
} = communitySlice.actions;

export default communitySlice.reducer;