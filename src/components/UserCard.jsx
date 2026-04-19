import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({user}) => {
    const {_id,firstName, lastName, age, gender, hobbies, photoUrl, about} = user;
    const dispatch = useDispatch();

    const handleRequest = async (status,id) => {
        try{
            const req = await axios.post(BASE_URL + "/request/send/" + status + "/" +id,
                {},
                {withCredentials:true},
            )
    
            dispatch(removeUserFromFeed(id));
        }
        catch(err){
            console.log(err.response.data);
        }

        
    }

    return (
        <div className="card bg-base-200 w-100 transform transition duration-300 hover:scale-103 mt-10 mx-auto myshadow-sm rounded-2xl hover:cursor-pointer">
            <figure className="p-5 h-100 overflow-hidden">
                <img
                    className="w-full h-full object-cover rounded-2xl"
                    src={photoUrl}
                    alt="User Image"
                />
            </figure>
            <div className="card-body mt-[-20px]">
                <h2 className="card-title text-2xl">{firstName + " " + lastName}</h2>
                <div className="flex mt-[-10px]">
                    {age && gender && (<div className="flex">
                        <h2>{age}</h2>
                        <h2>{", " + gender}</h2>
                        </div>
                    )}
                </div>
                <h1 className="text-md text-gray-400 pr-2">{about}</h1>
                <div className="card-actions justify-center p-2 mt-2">
                    <button
                        className="btn px-6 py-3 rounded-xl bg-red-800 py-6 text-white text-base font-medium 
                        shadow-md transition duration-300 hover:bg-red-900 hover:scale-105 hover:shadow-lg active:scale-95"
                        onClick={() => handleRequest("ignored", _id)}
                    >
                        Not Interested
                    </button>

                    <button
                        className="btn px-6 py-3 rounded-xl bg-blue-900 py-6 text-white text-base font-medium 
                        shadow-md transition duration-300 hover:bg-green-700 hover:scale-105 hover:shadow-lg active:scale-95"
                        onClick={() => handleRequest("interested", _id)}
                    >
                Interested
                </button>
                </div>
            </div>
        </div>
    )
};

export default UserCard;