import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import { useEffect } from "react";

const Connections = () => {
    const dispatch = useDispatch();
    let users = useSelector((store)=> store?.connection);

    const getConnections = async () => {
        try{
            if(!users) {
                users = await axios.get(BASE_URL + "/user/connections",{
                withCredentials: true
            });
                dispatch(addConnection(users.data.data));
            }
        }
        catch(err){
            console.log(err.response);
        }
    }

    useEffect(()=>{
        getConnections();
    },[])

    if(!users || users.length === 0) return (<h1
    className="text-2xl text-center mx-auto mt-10 p-4">No Connections Found</h1>)

    return (
        <div>
            <div className="text-center ">
                <h1 className ="text-4xl font-bold mt-10 text-center">Your Connections</h1>
            </div>

            {users.map((user)=>{
                const {firstName, lastName, age, gender, photoUrl, about} = user;

                return (
                    <div className="flex items-center bg-base-300 w-1/2 mx-auto my-6 p-4 rounded-lg">
                        <div className="ml-1 w-30 h-30 overflow-hidden flex-shrink-0">
                            <img
                                src={photoUrl}
                                alt="USER_IMAGE"
                                className="w-full h-full flex items-center object-cover rounded-full justify-center my-auto"
                            />
                        </div>
                        <div className="ml-7 ">
                            <h1 className="text-2xl font-bold ">{firstName + " " + lastName}</h1>
                            <div className="flex">
                            {age && gender && (<div className="flex">
                                <h2>{age}</h2>
                                <h2>{", " + gender}</h2>
                                </div>
                            )}
                            </div>
                            <h2 className="opacity-60 mt-1 pr-5">{about}</h2>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Connections;