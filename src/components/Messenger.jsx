import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { createSocketConnection } from '../utils/socket';
import {
  setConversations,
  markConversationRead,
  updateLastMessage,
  bumpConversation,
} from '../utils/messengerSlice';
import { addConnection } from '../utils/connectionSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const formatMsgTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ConversationItem — one row in the sidebar list
// ─────────────────────────────────────────────────────────────────────────────
const ConversationItem = ({ conv, isActive, onClick }) => {
  const { user, lastMessage, unreadCount, updatedAt } = conv;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 rounded-xl mx-2 ${
        isActive
          ? 'bg-primary/15 border border-primary/30'
          : 'hover:bg-base-300'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full">
            <img
              src={
                user?.photoUrl ||
                'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg'
              }
              alt={user?.firstName}
              className="object-cover"
            />
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-content text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span
            className={`font-semibold text-sm truncate ${
              unreadCount > 0 ? 'text-base-content' : 'text-base-content/80'
            }`}
          >
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] text-base-content/40 flex-shrink-0 ml-1">
            {formatTime(updatedAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate mt-0.5 ${
            unreadCount > 0
              ? 'text-base-content font-medium'
              : 'text-base-content/50'
          }`}
        >
          {lastMessage?.text || 'Start the conversation…'}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ChatPanel — the right-side embedded chat window
// ─────────────────────────────────────────────────────────────────────────────
const ChatPanel = ({ targetUserId, onMessageSent }) => {
  const user = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch chat history + target user info
  useEffect(() => {
    if (!targetUserId) return;
    setMessages([]);
    setLoading(true);

    const fetchAll = async () => {
      try {
        const [chatRes, userRes] = await Promise.all([
          axios.get(`${BASE_URL}/chat/${targetUserId}`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/user/${targetUserId}`, {
            withCredentials: true,
          }),
        ]);

        const msgs = chatRes.data.messages.map((m) => ({
          firstName: m.senderId?.firstName,
          lastName: m.senderId?.lastName,
          photoUrl: m.senderId?.photoUrl,
          senderId: m.senderId?._id,
          text: m.text,
          time: formatMsgTime(m.createdAt),
          createdAt: m.createdAt,
        }));

        setMessages(msgs);
        setTargetUser(userRes.data);
      } catch (err) {
        console.error('ChatPanel fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    // Mark messages as read
    axios
      .post(
        `${BASE_URL}/chat/mark-read/${targetUserId}`,
        {},
        { withCredentials: true }
      )
      .catch(() => {});

    dispatch(markConversationRead({ userId: targetUserId }));
  }, [targetUserId, dispatch]);

  // Socket connection for this chat room
  useEffect(() => {
    if (!user || !targetUserId) return;

    const sock = createSocketConnection();
    socketRef.current = sock;

    sock.emit('registerUser', { userId: user._id });
    sock.emit('joinChat', {
      firstName: user.firstName,
      userId: user._id,
      targetUserId,
    });

    sock.on('messageReceived', ({ firstName, lastName, photoUrl, text, createdAt, senderId }) => {
      const time = formatMsgTime(createdAt || new Date());
      setMessages((prev) => [
        ...prev,
        { firstName, lastName, photoUrl, text, time, createdAt, senderId },
      ]);

      // If this message came from the other person, mark it read immediately
      if (senderId && senderId !== user._id) {
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
      sock.disconnect();
      socketRef.current = null;
    };
  }, [user, targetUserId, dispatch]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id,
      photoUrl: user.photoUrl,
      targetUserId,
      text: input.trim(),
    });

    const now = new Date().toISOString();
    onMessageSent?.({ targetUserId, text: input.trim(), createdAt: now });
    setInput('');
  }, [input, user, targetUserId, onMessageSent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300 bg-base-100/80 backdrop-blur flex-shrink-0">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img
              src={
                targetUser?.photoUrl ||
                'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg'
              }
              alt="user"
            />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-base leading-tight">
            {targetUser?.firstName} {targetUser?.lastName}
          </h2>
          <p className="text-xs text-base-content/50 capitalize">
            {targetUser?.experienceLevel || 'Developer'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-base-100">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine =
            msg.senderId
              ? msg.senderId === user._id || msg.senderId?.toString() === user._id?.toString()
              : msg.firstName === user.firstName;

          return (
            <div
              key={i}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] flex gap-2 items-end ${
                  isMine ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="avatar flex-shrink-0">
                  <div className="w-7 h-7 rounded-full">
                    <img
                      src={
                        msg.photoUrl ||
                        'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg'
                      }
                      alt="avatar"
                    />
                  </div>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl shadow break-words ${
                    isMine
                      ? 'bg-primary text-primary-content rounded-br-sm'
                      : 'bg-base-200 rounded-bl-sm'
                  }`}
                >
                  {!isMine && (
                    <p className="text-[10px] font-semibold mb-1 opacity-70">
                      {msg.firstName} {msg.lastName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div
                    className={`text-[9px] mt-1 flex justify-end ${
                      isMine
                        ? 'text-primary-content/60'
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
      <div className="p-3 border-t border-base-300 bg-base-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            className="textarea textarea-bordered flex-1 resize-none rounded-2xl text-sm min-h-[44px] max-h-28"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="btn btn-primary btn-sm rounded-2xl px-4 h-[44px]"
            onClick={handleSend}
          >
            ➤
          </button>
        </div>
        <p className="text-[10px] text-base-content/30 mt-1 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Messenger — main page
// ─────────────────────────────────────────────────────────────────────────────
const Messenger = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector((s) => s.user);
  const { conversations } = useSelector((s) => s.messenger);
  const connections = useSelector((s) => s.connection);

  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);

  // Active chat from URL query ?userId=...
  const activeUserId = searchParams.get('userId') || null;

  // ── Fetch conversations ──
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/chat/conversations/all`, {
          withCredentials: true,
        });
        dispatch(setConversations(res.data.conversations));
      } catch (err) {
        console.error('Fetch conversations error:', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConversations();
  }, [dispatch]);

  // ── Fetch connections if not already in store (for search) ──
  useEffect(() => {
    if (connections && connections.length > 0) return;
    const fetchConnections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });
        dispatch(addConnection(res.data.data));
      } catch (err) {
        console.error('Fetch connections error:', err);
      }
    };
    fetchConnections();
  }, [dispatch, connections]);

  // ── Global socket for new message notifications (navbar badge updates) ──
  useEffect(() => {
    if (!user) return;
    const sock = createSocketConnection();
    sock.emit('registerUser', { userId: user._id });

    sock.on('newMessageNotification', (payload) => {
      dispatch(bumpConversation(payload));
    });

    return () => sock.disconnect();
  }, [user, dispatch]);

  // ── Build the search results from connections (not full user list) ──
  const connectionResults = (connections || []).filter((c) => {
    if (!search.trim()) return false;
    const q = search.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q)
    );
  });

  // Connections who already have a conversation (avoid duplicates in list)
  const convUserIds = new Set(conversations.map((c) => c.user?._id));

  // ── Handlers ──
  const openChat = (userId) => {
    setSearchParams({ userId });
    setSearch('');
  };

  const handleMessageSent = useCallback(
    ({ targetUserId, text, createdAt }) => {
      dispatch(updateLastMessage({ targetUserId, text, createdAt }));
    },
    [dispatch]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-base-200 overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div
        className={`flex flex-col bg-base-100 border-r border-base-300 transition-all duration-200 ${
          activeUserId
            ? 'hidden md:flex md:w-80 lg:w-96'
            : 'flex w-full md:w-80 lg:w-96'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-base-300 flex-shrink-0">
          <h1 className="text-xl font-bold mb-3">Messages</h1>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search connections…"
              className="input input-bordered input-sm w-full pl-8 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content text-xs"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results (connections only) */}
        {search.trim() && (
          <div className="border-b border-base-300 flex-shrink-0">
            <p className="text-[10px] uppercase font-bold text-base-content/40 px-4 pt-3 pb-1">
              Connections
            </p>
            {connectionResults.length === 0 ? (
              <p className="text-xs text-base-content/40 px-4 pb-3">
                No connections match "{search}"
              </p>
            ) : (
              <div className="pb-2">
                {connectionResults.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => openChat(c._id)}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-base-200 transition-colors"
                  >
                    <div className="avatar">
                      <div className="w-9 h-9 rounded-full">
                        <img
                          src={
                            c.photoUrl ||
                            'https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg'
                          }
                          alt={c.firstName}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-[11px] text-base-content/40 capitalize">
                        {c.experienceLevel || 'Developer'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loadingConvs ? (
            <div className="flex justify-center pt-10">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          ) : conversations.length === 0 && !search ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 px-4 text-center">
              <span className="text-4xl mb-3">💬</span>
              <p className="font-semibold text-sm">No conversations yet</p>
              <p className="text-xs mt-1">
                Search your connections above to start chatting
              </p>
            </div>
          ) : (
            <>
              {!search && conversations.length > 0 && (
                <p className="text-[10px] uppercase font-bold text-base-content/40 px-4 pt-1 pb-2">
                  Recent
                </p>
              )}
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.user?._id || conv.chatId}
                  conv={conv}
                  isActive={activeUserId === conv.user?._id}
                  onClick={() => openChat(conv.user?._id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT CHAT PANEL ── */}
      <div
        className={`flex-1 flex flex-col ${
          !activeUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeUserId ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden px-3 pt-3 flex-shrink-0">
              <button
                className="btn btn-ghost btn-sm gap-1"
                onClick={() => setSearchParams({})}
              >
                ← Back
              </button>
            </div>
            <ChatPanel
              key={activeUserId}
              targetUserId={activeUserId}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 select-none">
            <span className="text-6xl mb-4">💬</span>
            <h2 className="text-xl font-bold">DevTinder Messenger</h2>
            <p className="text-sm mt-2">
              Select a conversation or search connections to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;