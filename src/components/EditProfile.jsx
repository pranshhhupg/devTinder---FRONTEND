import { useState } from "react";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const EditProfile = ({user}) => {
    const [firstName, setFirstName] =useState(user.firstName);
    const [lastName, setLastName] =useState(user.lastName);
    const [age, setAge] =useState(user.age);
    const [gender, setGender] =useState(user.gender);
    const [hobbies, setHobbies] =useState(user.hobbies);
    const [photoUrl, setPhotoUrl] =useState(user.photoUrl);
    const [about, setAbout] =useState(user.about);
    const [error,setError]=useState("");
    const [toast,setToast] = useState(false);

    const userInfo = {firstName,lastName,age,gender,hobbies,photoUrl,about};
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSaveProfile = async () => {
        try {
          const res = await axios.put(
            BASE_URL + "/profile/edit",
            {
              firstName,
              lastName,
              age,
              gender,
              hobbies: Array.isArray(hobbies)
                ? hobbies
                : hobbies.split(",").map(h => h.trim()).filter(Boolean),
              photoUrl,
              about,
            },
            {
              withCredentials: true,
            }
          );
      
          dispatch(addUser(res?.data?.data));
          setError("");
          setToast(true);

          setTimeout(()=>{
            setToast(false)
          },3000);
          navigate("/feed");

        } catch (err) {
          setError(err?.response?.data || "Something went wrong");
          console.log(err?.response?.data);
        }
    };

    return (
        <div>
            {toast && (<div className="toast toast-top toast-start z-10 mt-2 ml-5">
                <div className="alert alert-success">
                    <h1>Profile Saved Successfully!</h1>
                </div>
            </div>)}
            <div className="flex justify-center mx-auto mb-20">
                <div className="card bg-base-300 w-200 shadow-sm my-10  mr-10">
                    <h1 className="text-4xl text-gray-300 font-bold bg-base-200 pl-10 py-5"> Edit Your Profile</h1>
                    <div className=" pl-10 pt-5 pb-10">
                        <div className="flex">
                            <label className="fieldset mr-10">
                                <legend className="fieldset-legend text-lg">First Name</legend>
                                <input type="text" className="input w-70" placeholder="Enter your First Name" 
                                value = {firstName}
                                onChange={(e)=>setFirstName(e.target.value)}/>
                            </label>
                            <label className="fieldset">
                                <legend className="fieldset-legend text-lg">Last Name</legend>
                                <input type="text" className="input w-70" placeholder="Enter your Last Name" 
                                value = {lastName}
                                onChange={(e)=>setLastName(e.target.value)}/>
                            </label>
                        </div>
                        <div className="flex">
                        <label className="fieldset">
                            <legend className="fieldset-legend text-lg">Age</legend>
                            <input type="text" className="input w-70 mr-10" placeholder="Enter your Age" 
                            value = {age}
                            onChange={(e)=>setAge(e.target.value)}/>
                        </label>
                        <label className="fieldset">
                            <legend className="fieldset-legend text-lg">Gender</legend>
                            <input type="text" className="input w-70" placeholder="Enter your Gender" 
                            value = {gender}
                            onChange={(e)=>setGender(e.target.value)}/>
                        </label>
                        </div>
                        <label className="fieldset pr-10">
                            <legend className="fieldset-legend text-lg">Photo URL</legend>
                            <input type="text" className="input w-full" placeholder="Enter your Photo URL" 
                            value = {photoUrl}
                            onChange={(e)=>setPhotoUrl(e.target.value)}/>
                        </label>
                        
                        <label className="fieldset pr-10">
                            <legend className="fieldset-legend text-lg">About</legend>
                            <textarea
                                className="w-full min-h-[100px] text-md p-3 bg-base-200 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Tell something about yourself..."
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                            />
                        </label>
                        <label className="fieldset pr-10">
                            <legend className="fieldset-legend text-lg">Hobbies</legend>
                            <textarea
                                className="w-full text-md p-3 bg-base-200 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Tell something about yourself..."
                                value={Array.isArray(hobbies) ? hobbies.join(", ") : hobbies}
                                onChange={(e) => setHobbies(e.target.value)}
                            />
                        </label>
                        <p className="text-red-600 pr-5">{error}</p>
                        <div className="flex mt-8 justify-end pr-10 ">
                            <button className="btn btn-primary text-lg "
                            onClick={handleSaveProfile}>Save Profile</button>
                        </div>

                    </div>
                    
                </div>
                <div className="pt-20">
                    <UserCard user = {userInfo}/>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;