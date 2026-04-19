import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name : "feed",
    initialState : null,
    reducers : {
        addFeed : (state,action) => {
            return action.payload
        },
        removeUserFromFeed : (state,action) => {
            const newArray = state.filter((user) => user._id!=action.payload);
            return newArray;
        },
        removeFeed : (state,action) => null
    }
});

export const {addFeed, removeFeed, removeUserFromFeed} = feedSlice.actions;
export default feedSlice.reducer;