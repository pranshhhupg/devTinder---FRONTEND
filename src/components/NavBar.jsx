import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { removeUser } from '../utils/userSlice';
import { useState, useEffect } from 'react';
import { createSocketConnection } from '../utils/socket';
import { bumpConversation, setConversations } from '../utils/messengerSlice';

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const totalUnread = useSelector((store) => store.messenger?.totalUnread || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogOut = async () => {
    try {
      await axios.post(BASE_URL + '/logout', {}, { withCredentials: true });
      dispatch(removeUser());
      navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  // ── Bootstrap: fetch conversation list once so unread count is ready ──
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/chat/conversations/all`, {
          withCredentials: true,
        });
        dispatch(setConversations(res.data.conversations));
      } catch (_) {
        // silently fail — badge just won't show until Messenger page loads
      }
    };

    fetchConversations();
  }, [user, dispatch]);

  // ── Global socket listener for new message notifications ──
  useEffect(() => {
    if (!user) return;

    const sock = createSocketConnection();
    sock.emit('registerUser', { userId: user._id });

    sock.on('newMessageNotification', (payload) => {
      dispatch(bumpConversation(payload));
    });

    return () => {
      sock.disconnect();
    };
  }, [user, dispatch]);

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-base-300 shadow-sm px-5">

        {/* LEFT SIDE */}
        <div className="flex-1 flex items-center gap-2">

          {/* HAMBURGER BUTTON */}
          <button
            className="btn btn-ghost text-xl"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>

          <Link to="/feed" className="btn btn-ghost text-xl">
            DevTinder
          </Link>
        </div>

        {/* RIGHT SIDE */}
        {user && (
          <div className="flex gap-2 items-center">
            <p className="text-gray-400 pr-2 hidden sm:block">
              Welcome, {user.firstName}
            </p>

            {/* ── MESSENGER ICON ── */}
            <Link
              to="/messenger"
              className="btn btn-ghost btn-circle relative"
              title="Messages"
            >
              {/* Chat bubble icon (inline SVG so no extra deps) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>

              {/* Red dot badge */}
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 bg-error text-error-content text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </Link>

            {/* PROFILE DROPDOWN */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img src={user.photoUrl} alt="user" />
                </div>
              </div>

              <ul
                tabIndex={-1}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li onClick={handleLogOut}>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* LEFT SLIDING DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-base-100 z-50 shadow-lg transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-base-200">
          <button
            className="p-4 text-xl hover:cursor-pointer font-bold"
            onClick={() => setOpen(false)}
          >
            ❮❮❮❮ BACK
          </button>
        </div>

        <ul className="menu p-4 space-y-3">
          <li>
            <Link to="/feed" onClick={() => setOpen(false)}>
              Feed
            </Link>
          </li>
          <li>
            <Link to="/collab" onClick={() => setOpen(false)}>
              CollabHub
            </Link>
          </li>
          <li>
            <Link to="/communities" onClick={() => setOpen(false)}>
              Communities
            </Link>
          </li>
          <li>
            <Link to="/search" onClick={() => setOpen(false)}>
              Find Developers
            </Link>
          </li>
          <li>
            <Link to="/connections" onClick={() => setOpen(false)}>
              Connections
            </Link>
          </li>
          <li>
            <Link to="/request" onClick={() => setOpen(false)}>
              Requests
            </Link>
          </li>
          <li>
            <Link to="/status" onClick={() => setOpen(false)}>
              Status
            </Link>
          </li>
          <li>
            <Link to="/messenger" onClick={() => setOpen(false)} className="flex items-center justify-between">
              <span>Messages</span>
              {totalUnread > 0 && (
                <span className="badge badge-error badge-sm text-white">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default NavBar;