import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
    const user = useSelector((store)=>store?.user);

    return (
        <div>
            {user && <EditProfile user = {user}/>}
        </div>
    );
};

export default Profile;