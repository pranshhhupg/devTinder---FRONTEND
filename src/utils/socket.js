import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

//Real time connection between frontend and backend.
export const createSocketConnection = () => {
    return io(BASE_URL);
};