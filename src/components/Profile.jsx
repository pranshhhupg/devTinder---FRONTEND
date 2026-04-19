import { useDispatch, useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Profile = () => {
    const user = useSelector((store) => store?.user);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const res = await axios.get("/profile", {
            withCredentials: true
        });
        dispatch(addUser(res.data));
    };

    return (
        <div>
            {user && <EditProfile user={user} />}
        </div>
    );
};

export default Profile;