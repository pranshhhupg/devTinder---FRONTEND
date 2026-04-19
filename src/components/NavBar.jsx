import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { useState } from "react";

const NavBar = () => {
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 🆕 LEFT DRAWER STATE
    const [open, setOpen] = useState(false);

    const handleLogOut = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
            dispatch(removeUser());
            navigate("/login");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {/* NAVBAR */}
            <div className="navbar bg-base-300 shadow-sm px-5">

                {/* LEFT SIDE */}
                <div className="flex-1 flex items-center gap-2">

                    {/* 🆕 HAMBURGER BUTTON */}
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
                        <p className="text-gray-400 pr-2">
                            Welcome, {user.firstName}
                        </p>

                        {/* PROFILE (NO DRAWER NOW) */}
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

            {/* 🆕 OVERLAY */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            {/* 🆕 LEFT SLIDING DRAWER */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-base-100 z-50 shadow-lg transform transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full"
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
                {/* MENU ITEMS */}
                <ul className="menu p-4 space-y-3">
                    <li>
                        <Link to="/feed" onClick={() => setOpen(false)}>
                            Feed
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
                </ul>
            </div>
        </>
    );
};

export default NavBar;