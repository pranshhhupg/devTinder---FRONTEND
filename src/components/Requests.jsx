import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { useEffect, useMemo, useState } from "react";
import DeveloperLink from "./DeveloperLink";

const Requests = () => {
  const dispatch = useDispatch();

  const requests = useSelector((store) => store?.requests);

  const [search, setSearch] = useState("");

  const handleRequest = async (status, id) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + id,
        {},
        {
          withCredentials: true,
        }
      );

      dispatch(removeRequest(id));
    } catch (err) {
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(BASE_URL + "/user/requests", {
        withCredentials: true,
      });

      dispatch(addRequest(response.data.data));
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter Requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((user) => {
      const profile = user.fromUserId;

      const fullName =
        `${profile.firstName} ${profile.lastName}`.toLowerCase();

      const about = profile.about?.toLowerCase() || "";

      return (
        fullName.includes(search.toLowerCase()) ||
        about.includes(search.toLowerCase())
      );
    });
  }, [requests, search]);

  if (!requests || requests.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <div className="text-6xl mb-4">📬</div>

        <h1 className="text-3xl font-bold">
          No Requests Found
        </h1>

        <p className="text-base-content/50 mt-2">
          New connection requests will appear here
        </p>
      </div>
    );

  return (
    <div className="w-full md:w-240 mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          Connection Requests
        </h1>

        <p className="text-base-content/50">
          Developers who want to connect with you
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full rounded-lg bg-base-200"
        />
      </div>

      {/* Request Cards */}
      <div className="flex flex-col gap-5 bg-base-300 p-7 rounded-2xl">

        {filteredRequests.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold">
              No matching requests found
            </h2>

            <p className="text-base-content/50 mt-2">
              Try searching with another name
            </p>
          </div>
        ) : (
          filteredRequests.map((user) => {
            const {
              _id,
              firstName,
              lastName,
              age,
              gender,
              photoUrl,
              about,
            } = user.fromUserId;

            return (
              <div
                key={user._id}
                className="bg-base-200 border border-base-300 rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">

                  {/* Avatar */}
                  <div className="avatar">
                    <div className="w-24 rounded-2xl">
                      <DeveloperLink userId={_id}>
                        <img
                          src={
                            photoUrl ||
                            "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768"
                          }
                          alt="USER"
                          className="object-cover hover:ring-2 hover:ring-primary transition-all rounded-2xl"
                        />
                      </DeveloperLink>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <DeveloperLink
                        userId={_id}
                        className="hover:underline hover:text-primary transition-colors"
                      >
                        <h2 className="text-2xl font-bold">
                          {firstName} {lastName}
                        </h2>
                      </DeveloperLink>

                      {age && gender && (
                        <span className="badge badge-outline capitalize">
                          {age}, {gender}
                        </span>
                      )}
                    </div>

                    {about && (
                      <p className="text-base-content/60 leading-relaxed line-clamp-2">
                        {about}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full lg:w-auto">

                    <button
                      className="btn bg-red-800 hover:bg-red-900 flex-1 lg:flex-none rounded-lg px-6"
                      onClick={() =>
                        handleRequest("rejected", user._id)
                      }
                    >
                      Reject
                    </button>

                    <button
                      className="btn bg-green-800 hover:bg-green-900 flex-1 lg:flex-none rounded-lg px-6"
                      onClick={() =>
                        handleRequest("accepted", user._id)
                      }
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Requests;