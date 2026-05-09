import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { createSocketConnection } from '../utils/socket';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { updateLastMessage, markConversationRead } from '../utils/messengerSlice';

const Chat = () => {
  const [message, setMessage] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [input, setInput] = useState('');

  const { targetUserId } = useParams();

  const user = useSelector((store) => store?.user);
  const dispatch = useDispatch();

  const userId = user?._id;

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetchTargetUser = async () => {
    try {
      const res = await axios.get(BASE_URL + '/user/' + targetUserId, {
        withCredentials: true,
      });
      setTargetUser(res.data);
    } catch (err) {
      console.log(err.response);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const chat = await axios.get(BASE_URL + '/chat/' + targetUserId, {
        withCredentials: true,
      });

      const msgs = chat.data.messages.map((msg) => {
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const { senderId, text } = msg;
        return {
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          photoUrl: senderId?.photoUrl,
          senderId: senderId?._id,
          text,
          time,
        };
      });

      setMessage(msgs);
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    fetchTargetUser();

    // Mark messages as read when opening the chat
    axios
      .post(
        `${BASE_URL}/chat/mark-read/${targetUserId}`,
        {},
        { withCredentials: true }
      )
      .catch(() => {});
    dispatch(markConversationRead({ userId: targetUserId }));
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit('registerUser', { userId });
    socket.emit('joinChat', { firstName: user.firstName, userId, targetUserId });

    socket.on('messageReceived', ({ firstName, lastName, photoUrl, text, createdAt, senderId }) => {
      const time = new Date(createdAt || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setMessage((prev) => [
        ...prev,
        { firstName, lastName, photoUrl, text, time, senderId },
      ]);

      // If from the other person, mark read immediately
      if (senderId && senderId !== userId) {
        axios
          .post(
            `${BASE_URL}/chat/mark-read/${targetUserId}`,
            {},
            { withCredentials: true }
          )
          .catch(() => {});
        dispatch(markConversationRead({ userId: targetUserId }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  const HandleSendBtn = () => {
    if (!input.trim()) return;

    const socket = createSocketConnection();

    const now = new Date().toISOString();

    socket.emit('sendMessage', {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      photoUrl: user.photoUrl,
      targetUserId,
      text: input,
    });

    // Update messenger sidebar state
    dispatch(updateLastMessage({ targetUserId, text: input, createdAt: now }));

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      HandleSendBtn();
    }
  };

  return (
    <div className="w-full md:w-2/3 lg:w-2/3 mx-auto mt-8 h-[90vh] flex flex-col bg-base-200 border border-base-300 rounded-3xl shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-base-300 bg-base-100/70 backdrop-blur">
        <div className="avatar online">
          <div className="w-13 rounded-full">
            <img src={targetUser?.photoUrl} alt="user" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg">
            {targetUser?.firstName} {targetUser?.lastName}
          </h1>
          <h1 className="opacity-50 text-sm capitalize">
            {targetUser?.experienceLevel || 'Intermediate'}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-base-100">
        {message.map((msg, index) => {
          const isMine =
            msg.senderId
              ? msg.senderId === userId || msg.senderId?.toString() === userId?.toString()
              : msg.firstName === user.firstName;

          return (
            <div
              key={index}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] flex gap-2 items-end ${
                  isMine ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img
                      src={
                        msg.photoUrl ||
                        'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                      }
                      alt="avatar"
                    />
                  </div>
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-md break-words ${
                    isMine
                      ? 'bg-primary text-primary-content rounded-br-md'
                      : 'bg-base-200 rounded-bl-md'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.firstName} {msg.lastName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div
                    className={`text-[10px] mt-2 flex justify-end ${
                      isMine
                        ? 'text-primary-content/70'
                        : 'text-base-content/40'
                    }`}
                  >
                    {msg.time || 'Now'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base-300 bg-base-100">
        <div className="flex items-end gap-3">
          <textarea
            className="textarea textarea-bordered flex-1 resize-none rounded-2xl min-h-[52px] max-h-36"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-primary rounded-2xl px-6"
            onClick={HandleSendBtn}
          >
            ➤
          </button>
        </div>
        <p className="text-[11px] text-base-content/40 mt-2 px-1">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;