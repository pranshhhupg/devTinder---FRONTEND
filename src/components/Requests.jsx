import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";
import { addUserToConnection } from "../utils/connectionSlice";

const Requests = () => {
    const dispatch = useDispatch();
    let request = useSelector((store)=>store?.requests);

    const handleRequest = async (status,id) => {
        try{
            const res = await axios.post(BASE_URL +"/request/review/" + status + "/"+id,
                {},{
                    withCredentials:true
                }
            );
    
            dispatch(removeRequest(id));  
        }
        catch(err){
            console.log(err.response.data);
        }
    }

    const fetchRequests = async () => {
        try{
            request = await axios.get(BASE_URL + "/user/requests",{
                withCredentials: true,
            });

            dispatch(addRequest(request.data.data));
            
        }
        catch(err){
            console.log(err.response);
        }
    }

    useEffect(()=>{
        fetchRequests();
    },[])

    if(!request || request.length === 0) return (<h1
        className="text-2xl text-center mx-auto mt-10 p-4">No request Found</h1>)
    
    return (
        <div>
            <div className="text-center ">
                <h1 className ="text-4xl font-bold mt-10 text-center opacity-60 mb-10">Your Requests</h1>
            </div>

            {request.map((user)=>{
                const {_id,firstName, lastName, age, gender, photoUrl, about} = user.fromUserId;

                return (
                    <div className="flex items-center bg-base-300 w-1/2 mx-auto my-6 p-4 rounded-2xl">
                        <div className="ml-1 w-30 h-30 overflow-hidden flex-shrink-0">
                            <img
                                src={photoUrl}
                                alt="USER_IMAGE"
                                className="w-full h-full flex items-center object-cover rounded-full justify-center my-auto"
                            />
                        </div>
                        <div className="ml-7 ">
                            <h1 className="text-2xl font-bold ">{firstName + " " + lastName}</h1>
                            {age && gender && (<div className="flex">
                                <h2>{age}</h2>
                                <h2>{", " + gender}</h2>
                                </div>
                            )}
                            <h2 className="opacity-60 mt-1 pr-5">{about}</h2>
                        </div>
                        <div className="ml-auto flex">
                            <button
                            className="btn px-6 mr-3 rounded-xl bg-red-800 py-6 text-white text-base font-medium 
                            shadow-md transition duration-300 hover:bg-red-900 hover:scale-105 hover:shadow-lg active:scale-95"
                            onClick={() => handleRequest("rejected", user._id)}
                            >
                                Reject
                            </button>

                            <button
                                className="btn px-6  rounded-xl bg-blue-900 py-6 text-white text-base font-medium 
                                shadow-md transition duration-300 hover:bg-green-700 hover:scale-105 hover:shadow-lg active:scale-95"
                                onClick={() => handleRequest("accepted", user._id)}
                            >
                            Accept
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
};

export default Requests;