import { createSlice } from "@reduxjs/toolkit";

const statusSlice = createSlice({
    name : "status",
    initialState : null,
    reducers : {
        addStatus : (state,action) => {
            return action.payload;
        },
        removeStatus : (state,action) => null
    }
});

export const {addStatus, removeStatus} = statusSlice.actions;
export default statusSlice.reducer;