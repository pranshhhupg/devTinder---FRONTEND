import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";

const NavBar = () => {
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogOut = async () => {
        try{
            await axios.post(BASE_URL + "/logout",
                {},
                {withCredentials : true}
            );
            dispatch(removeUser());
            navigate("/login");
        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <div className="navbar bg-base-300 shadow-sm px-5">
            <div className="flex-1">
                <Link to = "/" className="btn btn-ghost text-xl">DevTinder</Link>
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
                        <Link to = "/profile" className="justify-between">
                            Profile
                            <span className="badge">New</span>
                        </Link>
                        </li>
                        <li><a>Settings</a></li>
                        <li onClick={handleLogOut}><a>Logout</a></li>
                    </ul>
                </div>
            </div>}
        </div>
    )
};

export default NavBar;