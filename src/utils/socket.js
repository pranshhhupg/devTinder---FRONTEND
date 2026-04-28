import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

//Real time connection between frontend and backend.
export const createSocketConnection = () => {
    if(location.hostname==="localhost"){
        return io(BASE_URL);
    }
    else{
        return io("/", {path : "/api/socket.io"});
    }
};