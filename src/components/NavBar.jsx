import { useSelector } from "react-redux";

const NavBar = () => {
    const user = useSelector((store) => store.user);

    return (
        <div className="navbar bg-base-300 shadow-sm px-5">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">DevTinder</a>
            </div>
            {user && <div className="flex gap-2">
                <p className ="text-gray-400 pr-2 pt-2">Welcome, {user.firstName}</p>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                        <img
                            alt="Tailwind CSS Navbar component"
                            src={user.photoUrl} />
                        </div>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                        <a className="justify-between">
                            Profile
                            <span className="badge">New</span>
                        </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>}
        </div>
    )
};

export default NavBar;