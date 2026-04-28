import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
    const [message, setMessage] = useState([]);
    const [input, setInput] = useState("");
    const { targetUserId } = useParams();
    const user = useSelector((store)=>store?.user);
    const userId = user?._id;

    const messagesEndRef = useRef(null); // ✅ only added this

    const fetchChatMessages = async () =>{
        try{
            let chat = await axios.get(BASE_URL+"/chat/" + targetUserId, {
                withCredentials: true,
            });

            const oldMessages = chat.data.messages;

            const message = oldMessages.map((msg)=>{
                const time = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
                const {senderId, text} = msg;
                return {
                    firstName : senderId?.firstName,
                    lastName : senderId?.lastName,
                    text : text,
                    time,
                }
            });

            setMessage(message);
        }
        catch(err){
            console.log(err.response);
        }
    }

    useEffect(()=>{
        fetchChatMessages();
    },[])

    useEffect(()=>{
        if(!user) return ;

        const socket = createSocketConnection();
        socket.emit("joinChat", {firstName : user.firstName, userId, targetUserId});

        socket.on("messageReceived", ({firstName,lastName, text}) => {
            setMessage((prev) => [...prev, {firstName, lastName,text}]);
        });

        return () => {
            socket.disconnect();
        }
    },[userId, targetUserId]);

    // ✅ AUTO SCROLL ONLY
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    const HandleSendBtn = () => {
        if(!input.trim()) return ;
        const socket = createSocketConnection();
        socket.emit("sendMessage",{firstName : user.firstName,lastName : user.lastName, userId, targetUserId, text:input});
        setInput("");
    }

    return (
        <div className="w-1/2 mt-10 mx-auto border-2 border-gray-600 rounded-2xl">
            
            <div className="border-b-2 p-4 border-gray-600 font-bold text-xl opacity-70">
                <h1>Chat</h1>
            </div>

            <div className="h-[60vh] overflow-auto p-4 space-y-4">
                {message.map((msg, index) => (
                    <div key={index} className={"chat " + (user.firstName === msg.firstName ? "chat-end" : "chat-start")}>
                        <div className="chat-header">
                            {msg.firstName + " " + msg.lastName}
                            <time className="text-xs opacity-50 ml-2">
                                {msg.time ? msg.time : "Just Now"}
                            </time>
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                        {
                            user.firstName==msg.firstName && 
                            <div className="chat-footer opacity-50">Seen</div>
                        }
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-row">
                <textarea
                    className="w-full text-md p-3 bg-base-200 rounded-l-2xl border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button className="p-5 bg-green-800 rounded-r-2xl hover:cursor-pointer font-bold"
                onClick={HandleSendBtn}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;