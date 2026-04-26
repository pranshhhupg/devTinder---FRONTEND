import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Body = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((store) => store?.user);

    const fetchUser = async() => {
        try{
            const user = await axios.get(BASE_URL + "/profile/view",
                {withCredentials: true}
            )
            console.log(user.data);
            dispatch(addUser(user.data));
            
            navigate("/feed");
        }

        catch(err){
            if(err.response?.status===401) navigate("/login");
            console.log(err.response);
        }
    }

    useEffect(()=>{
        fetchUser();
    },[]);

    return (
    <div className="min-h-screen flex flex-col">
      
      <NavBar />

      {/* This is where Feed/UserCard renders */}
      <div className="flex-grow">
        <Outlet />
      </div>

      <Footer />

    </div>
  );
};

export default Body;