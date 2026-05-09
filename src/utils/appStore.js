import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import feedSlice from "./feedSlice";
import connectionSlice from "./connectionSlice";
import requestSlice from "./requestSlice";
import statusSlice from "./statusSlice";
import opportunitySlice from "./opportunitySlice";
import communitySlice from "./communitySlice";
import searchSlice from "./searchSlice";
import messengerSlice from "./messengerSlice";

const appStore = configureStore({
    reducer : {
        user : userSlice,
        feed : feedSlice,
        connection : connectionSlice,
        requests : requestSlice,
        status : statusSlice,
        opportunity : opportunitySlice,
        community : communitySlice,
        search : searchSlice,
        messenger : messengerSlice,
    }
});

export default appStore;