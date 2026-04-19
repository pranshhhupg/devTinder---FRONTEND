import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addStatus } from "../utils/statusSlice";
import { useEffect } from "react";

const Status = () => {
    let statusData = useSelector((store)=>store?.status);
    const dispatch = useDispatch();
    
    const getStatusData = async () => {
        statusData = await axios.get(BASE_URL + "/user/request/all",
            {withCredentials:true}
        );
        
        dispatch(addStatus(statusData.data.data));
    }

    useEffect(()=>{
        getStatusData();
    },[]);

    if(!statusData || statusData.length === 0) return (<h1
        className="text-2xl text-center mx-auto mt-10 p-4 opacity-50">No status Found</h1>)
    
    return (
        <div>
            <div className="text-center ">
                <h1 className ="text-4xl mt-10 text-center opacity-60 mb-10">Your Status</h1>
            </div>

            {statusData.map((user)=>{
                const {_id,firstName, lastName, age, gender, photoUrl, about} = user.toUserId;
                const status = user.status;
                let tag = null;
                if(status === "interested") tag = "pending"
                else tag = status;

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
                            {tag==="accepted" &&
                            <h1 className="bg-green-900 p-4 mr-2 font-bold text-lg rounded-lg">Accepted</h1>}
                            {
                                tag==="rejected" &&
                                <h1 className="bg-red-900 p-4 mr-2 font-bold text-lg rounded-lg">Rejected</h1>
                            }
                            {
                                tag==="pending" &&
                                <h1 className="bg-blue-900 p-4 mr-2 font-bold text-lg rounded-lg">Pending</h1>
                            }
                        </div>
                    </div>
                )
            })}
        </div>
    )
};

export default Status;