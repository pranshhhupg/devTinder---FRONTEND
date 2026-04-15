import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [emailId, setEmailId] = useState("pranshuguptaaa@gmail.com");
    const [password, setPassword] = useState("pranshuG@1210");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try{
            const res = await axios.post(BASE_URL + "/login",
                {
                    emailId,password,
                },
                {withCredentials : true}
            )

            dispatch(addUser(res.data.data));
            navigate("/feed");
        }
        catch(err){
            console.log(err.message);
        }
    }

    return (
        <div>
            <div className="card bg-base-300 w-90 shadow-sm my-30 mx-auto">
                <div className="card-body">
                    <h2 className="card-title mx-auto">Login</h2>
                    
                    <div className = "px-2">
                    <label className="fieldset">
                        <legend className="fieldset-legend">Email ID</legend>
                        <input type="text" className="input" placeholder="Enter your Email ID" 
                        value = {emailId}
                        onChange={(e)=>setEmailId(e.target.value)}/>
                    </label>

                    <label className="fieldset">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="text" className="input" placeholder="Enter your Password" 
                        value = {password}
                        onChange={(e)=>setPassword(e.target.value)}/>
                    </label>

                    </div>
                    <div className="card-actions justify-center pt-5">
                        <button className="btn btn-primary"
                        onClick={handleLogin}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;