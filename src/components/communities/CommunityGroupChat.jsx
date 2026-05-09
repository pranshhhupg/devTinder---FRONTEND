import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { createSocketConnection } from "../../utils/socket";

export default function CommunityGroupChat({ community }) {
  const loggedInUser = useSelector((store) => store.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [canSend, setCanSend] = useState(true);
  const [permissionMsg, setPermissionMsg] = useState("");
  const [socketError, setSocketError] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch past messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/community/${community._id}/chat-messages?limit=100`,
        { withCredentials: true }
      );
      const formatted = res.data.data.map((msg) => ({
        _id: msg._id,
        senderId: msg.senderId,
        text: msg.text,
        createdAt: msg.createdAt,
      }));
      setMessages(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [community._id]);

  // Check send permission
  const fetchPermission = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/community/${community._id}/message-permission`,
        { withCredentials: true }
      );
      setCanSend(res.data.canSend);
      if (!res.data.canSend) {
        setPermissionMsg("Only admins can send messages in this community");
      }
    } catch (err) {
      console.error(err);
    }
  }, [community._id]);

  // Setup socket connection
  useEffect(() => {
    fetchMessages();
    fetchPermission();

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinCommunityRoom", {
      communityId: community._id,
      userId: loggedInUser._id,
    });

    socket.on("communityMessageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("communityMessageError", ({ message }) => {
      setSocketError(message);
      setTimeout(() => setSocketError(""), 4000);
    });

    return () => {
      socket.emit("leaveCommunityRoom", { communityId: community._id });
      socket.disconnect();
    };
  }, [community._id, loggedInUser._id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !canSend) return;
    socketRef.current?.emit("sendCommunityMessage", {
      communityId: community._id,
      userId: loggedInUser._id,
      firstName: loggedInUser.firstName,
      lastName: loggedInUser.lastName,
      photoUrl: loggedInUser.photoUrl,
      text: input.trim(),
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isMe = (senderId) => {
    const id =
      typeof senderId === "object" ? senderId?._id : senderId;
    return id?.toString() === loggedInUser?._id?.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-base-100 border border-base-300 rounded-2xl shadow overflow-hidden h-[100vh]">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200">
        <div>
          <h3 className="font-bold">{community.name} — Group Chat</h3>
          <p className="text-xs text-base-content/50">
            {community.members?.length || 0} members ·{" "}
            {community.messagePermission === "admins_only"
              ? "🔒 Admins only can send"
              : "🌐 Open messaging"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-base-100">
        {messages.length === 0 && (
          <div className="text-center py-12 text-base-content/40">
            <div className="text-4xl mb-2">👋</div>
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const sender = msg.senderId;
          const mine = isMe(sender);

          return (
            <div
              key={msg._id || i}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] flex gap-2 items-end ${
                  mine ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="avatar shrink-0">
                  <div className="w-8 h-8 rounded-full">
                    <img
                      src={
                        sender?.photoUrl ||
                        "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
                      }
                      alt="avatar"
                    />
                  </div>
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow break-words ${
                    mine
                      ? "bg-primary text-primary-content rounded-br-sm"
                      : "bg-base-200 rounded-bl-sm"
                  }`}
                >
                  {!mine && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {sender?.firstName} {sender?.lastName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div
                    className={`text-[10px] mt-1 ${
                      mine
                        ? "text-primary-content/60 text-right"
                        : "text-base-content/40"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Socket error toast */}
      {socketError && (
        <div className="mx-4 mb-2 alert alert-warning py-2 text-sm">
          {socketError}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-base-300 bg-base-100">
        {canSend ? (
          <>
            <div className="flex items-end gap-2">
              <textarea
                className="textarea textarea-bordered flex-1 resize-none rounded-2xl min-h-[48px] max-h-32"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-primary rounded-2xl px-5"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                ➤
              </button>
            </div>
            <p className="text-[11px] text-base-content/40 mt-1 px-1">
              Enter to send · Shift+Enter for new line
            </p>
          </>
        ) : (
          <div className="text-center py-2 text-sm text-base-content/50">
            🔒 {permissionMsg}
          </div>
        )}
      </div>
    </div>
  );
}