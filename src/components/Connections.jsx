import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeveloperLink from "./DeveloperLink";

const Connections = () => {
  const dispatch = useDispatch();
  let users = useSelector((store) => store?.connection);

  const [search, setSearch] = useState("");

  const getConnections = async () => {
    try {
      users = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      dispatch(addConnection(users.data.data));
    } catch (err) {

    }
  };

  useEffect(() => {
    getConnections();
  }, []);

  const filteredUsers = users?.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (!users || users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-24 px-4">
        <div className="text-6xl mb-4">🤝</div>
        <h1 className="text-3xl font-bold text-center">No Connections Yet</h1>
        <p className="text-base-content/50 mt-2 text-center">
          Start connecting with developers from your feed
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-[900px] mx-auto py-8 px-4">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">Your Connections</h1>
        <h3 className="text-base-content/50 text-md mt-1">
          Developers you have connected with
        </h3>

        {/* Search Bar */}
        <div className="mb-6 mt-8">
          <input
            type="text"
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full bg-base-200 rounded-lg"
          />
        </div>
      </div>

      {/* Connections List */}
      <div className="flex flex-col gap-5 bg-base-300 p-4 sm:p-7 rounded-2xl">

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-2xl font-bold">No matching connections</h2>
            <p className="text-base-content/50 mt-2">
              Try searching with another name
            </p>
          </div>
        )}

        {filteredUsers.map((user) => {
          const { _id, firstName, lastName, age, gender, photoUrl, about } = user;

          return (
            <div
              key={_id}
              className="bg-base-200 rounded-3xl p-4 sm:p-5 shadow-md border border-base-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <DeveloperLink userId={_id}>
                    <img
                      src={
                        photoUrl ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt="USER"
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border border-base-300 hover:ring-2 hover:ring-primary transition-all"
                    />
                  </DeveloperLink>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DeveloperLink
                      userId={_id}
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      <h2 className="text-lg sm:text-2xl font-bold truncate">
                        {firstName} {lastName}
                      </h2>
                    </DeveloperLink>

                    {age && gender && (
                      <span className="badge badge-outline capitalize text-xs hidden sm:inline-flex">
                        {age}, {gender}
                      </span>
                    )}
                  </div>

                  {age && gender && (
                    <span className="badge badge-outline capitalize text-xs sm:hidden mt-1">
                      {age}, {gender}
                    </span>
                  )}

                  {about && (
                    <p className="text-base-content/60 leading-relaxed text-xs sm:text-sm line-clamp-2 mt-1">
                      {about}
                    </p>
                  )}
                </div>

                {/* Chat Button */}
                <div className="flex-shrink-0">
                  <Link to={"/chat/" + _id}>
                    <button className="btn btn-primary rounded-xl px-3 sm:px-6 btn-sm sm:btn-md">
                      <span className="sm:hidden">💬</span>
                      <span className="hidden sm:inline">💬 Chat</span>
                    </button>
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;