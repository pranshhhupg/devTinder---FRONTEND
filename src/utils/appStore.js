import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import feedSlice from "./feedSlice";
import connectionSlice from "./connectionSlice";
import requestSlice from "./requestSlice";
import statusSlice from "./statusSlice";

const appStore = configureStore({
    reducer : {
        user : userSlice,
        feed : feedSlice,
        connection : connectionSlice,
        requests : requestSlice,
        status : statusSlice,
    }
});

export default appStore;