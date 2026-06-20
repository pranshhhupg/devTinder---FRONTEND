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
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/chat/conversations/all`, {
          withCredentials: true,
        });
        dispatch(setConversations(res.data.conversations));
      } catch (_) {}
    };

    fetchConversations();
  }, [user, dispatch]);

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
      <div className="navbar bg-base-300 shadow-sm md:px-5">

        {/* LEFT SIDE */}
        <div className="flex-1 flex items-center gap-1">

          {/* Hamburger — only shown when logged in */}
          {user && (
            <button
              className="btn btn-ghost px-2 md:px-4 text-xl"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>
          )}

          <Link to="/feed" className="btn btn-ghost px-1 text-2xl font-bold">
            <p>Dev<span className="text-primary">Match</span></p>
          </Link>

        </div>

        {/* RIGHT SIDE */}
        {user && (
          <div className="flex gap-2 items-center">
            <Link
              to="/messenger"
              className="btn btn-ghost btn-circle relative"
              title="Messages"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyCGKJlEQKUOcWMWM3Wwgy08DniWXJTP6SCQ&s"
                alt="Chat Icon"
                className="w-5 h-5 object-contain"
              />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 bg-error text-error-content text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </Link>

            {/* PROFILE DROPDOWN */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={user.photoUrl} alt="user" />
                </div>
              </div>
              <ul
                tabIndex={-1}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
              >
                <li><Link to="/profile">Profile</Link></li>
                <li onClick={handleLogOut}><a>Logout</a></li>
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

        {user ? (
          <ul className="menu p-4 space-y-3">
            <li>
              <Link to="/feed" onClick={() => setOpen(false)}>Feed</Link>
            </li>
            <li>
              <Link to="/collab" onClick={() => setOpen(false)}>CollabHub</Link>
            </li>
            <li>
              <Link to="/communities" onClick={() => setOpen(false)}>Communities</Link>
            </li>
            <li>
              <Link to="/search" onClick={() => setOpen(false)}>Find Developers</Link>
            </li>
            <li>
              <Link to="/connections" onClick={() => setOpen(false)}>Connections</Link>
            </li>
            <li>
              <Link to="/request" onClick={() => setOpen(false)}>Requests</Link>
            </li>
            <li>
              <Link to="/status" onClick={() => setOpen(false)}>Status</Link>
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
            <li>
              <Link to="/about" onClick={() => setOpen(false)}>About</Link>
            </li>
          </ul>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-sm text-base-content/50 mb-4">Please log in to access all features.</p>
            <Link
              to="/login"
              className="btn btn-primary w-full"
              onClick={() => setOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="btn btn-outline w-full"
              onClick={() => setOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;