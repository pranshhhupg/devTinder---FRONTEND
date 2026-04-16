import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect } from "react";
import UserCard from "./UserCard";

const Feed = () => {
    const dispatch = useDispatch();
    let userFeed = useSelector((store) => store?.feed);

    const getFeed = async () => {
        try{
            if(userFeed) return; 
            userFeed = await axios.get(BASE_URL + "/user/feed",
                {withCredentials : true},
            )
            dispatch(addFeed(userFeed.data.data));
            console.log(userFeed.data);
        }
        catch(err){
            console.log(err.response);
        }
    }

    useEffect(()=>{
        getFeed();
    },[])

    return (
        <div>
            {userFeed && <UserCard user = {userFeed[0]}/>}
        </div>
    )
};

export default Feed;