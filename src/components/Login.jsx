import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import validate from "../utils/validate";

const Login = () => {
    const [emailId, setEmailId] = useState("pranshuguptaaa@gmail.com");
    const [password, setPassword] = useState("pranshuG@1210");
    const [firstName, setFirstName] =useState("");
    const [lastName, setLastName] =useState("");
    const [error, setError] = useState("");
    const [signup, setSignUp] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeToSignUp = async () => {
        setSignUp(!signup);
        setError("");
    }

    const handleSignUp = async () => {
        const message = validate(firstName,lastName);

        if(message.length>0){
            setError(message);
            return ;
        }

        try{
            const res = await axios.post(BASE_URL + "/signup",
                {
                    firstName,lastName,emailId,password,
                },
                {withCredentials : true}
            )

            dispatch(addUser(res.data.data));
            navigate("/profile");
        }
        catch(err){
            setError(err.response.data);
        }
    
    }

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
            setError(err.response.data);
        }
    }

    return (
        <div>
            <div className="card bg-base-300 w-90 shadow-sm my-10 mx-auto">
                <div className="card-body">
                    <h2 className="card-title mx-auto">{signup ? "Sign Up" : "Log In"}</h2>
                    
                    <div className = "px-2">

                        {signup && (
                            <>
                                <label className="fieldset">
                                    <legend className="fieldset-legend">First Name</legend>
                                    <input type="text" className="input" placeholder="Enter your First Name" 
                                    value = {firstName}
                                    onChange={(e)=>setFirstName(e.target.value)}/>
                                </label>
                                <label className="fieldset">
                                    <legend className="fieldset-legend">Last Name</legend>
                                    <input type="text" className="input" placeholder="Enter your Last Name" 
                                    value = {lastName}
                                    onChange={(e)=>setLastName(e.target.value)}/>
                                </label>
                                
                            </>
                        )}
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
                            <p className="text-red-500 pt-2">{error}</p>
                            <p className="text-gray-200 flex py-1 justify-end hover:cursor-pointer" 
                            onClick={changeToSignUp}>{signup ? "Already a User? Login in here" : "New User? Sign Up Here"}</p>
                    </div>
                    
                    <div className="card-actions justify-center pt-2">
                    <button className="btn btn-primary"
                    onClick={signup ? handleSignUp : handleLogin}>{signup ? "Sign Up" : "Login"}</button>
                    </div>

                    </div>
                </div>
            </div>
        
    );
};

export default Login;