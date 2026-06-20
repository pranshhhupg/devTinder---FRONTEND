import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { BASE_URL } from "../../utils/constants";

import {
  setCurrentCommunity,
  updateCommunityInStore,
} from "../../utils/communitySlice";

import CommunityPosts from "./CommunityPosts";
import CommunityGroupChat from "./CommunityGroupChat";
import MemberManagement from "./MemberManagement";
import CommunityEditModal from "./CommunityEditModal";

const CATEGORY_LABELS = {
  dsa: "DSA Preparation",
  backend: "Backend Developers",
  frontend: "Frontend Developers",
  ml: "ML Engineering Hub",
  ai: "AI & Prompt Engineering",
  "data-science": "Data Science & Analytics",
  devops: "DevOps & Cloud",
  mobile: "Mobile Development",
  qa: "QA & Testing",
  "open-source": "Open Source",
  startup: "Startup Builders",
  "system-design": "System Design",
  web3: "Web3 & Blockchain",
  cybersecurity: "Cybersecurity",
  consulting: "Consulting & Strategy",
  general: "General",
};

const CATEGORY_ICONS = {
  dsa: "🧮",
  backend: "⚙️",
  frontend: "🎨",
  ml: "🤖",
  ai: "✨",
  "data-science": "📊",
  devops: "☁️",
  mobile: "📱",
  qa: "🧪",
  "open-source": "🌐",
  startup: "🚀",
  "system-design": "🏗️",
  web3: "🔗",
  cybersecurity: "🔐",
  consulting: "💼",
  general: "💬",
};

export default function CommunityDetail() {
  const { communityId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loggedInUser = useSelector((store) => store.user);

  const community = useSelector(
    (store) => store.community.current
  );

  const [activeTab, setActiveTab] =
    useState("posts");

  const [loading, setLoading] = useState(true);

  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] =
    useState(false);

  const fetchCommunity = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/community/${communityId}`,
        {
          withCredentials: true,
        }
      );

      dispatch(setCurrentCommunity(res.data.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load community"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [communityId]);

  const handleJoinLeave = async () => {
    if (!community) return;

    setJoining(true);

    try {
      const action = community.isMember
        ? "leave"
        : "join";

      await axios.post(
        `${BASE_URL}/community/${communityId}/${action}`,
        {},
        { withCredentials: true }
      );

      await fetchCommunity();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Action failed"
      );
    } finally {
      setJoining(false);
    }
  };

  const handleCommunityUpdated = (
    updatedCommunity
  ) => {
    dispatch(
      updateCommunityInStore(updatedCommunity)
    );

    fetchCommunity();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-20">
        <p className="text-error text-lg">
          {error || "Community not found"}
        </p>

        <button
          className="btn btn-ghost mt-4"
          onClick={() =>
            navigate("/communities")
          }
        >
          ← Back to Communities
        </button>
      </div>
    );
  }

  const icon =
    CATEGORY_ICONS[community.category] || "💬";

  const categoryLabel =
    CATEGORY_LABELS[community.category] ||
    community.category;

    return (
      <>
        <div className="max-w-6xl mx-auto px-4 py-6">
    
          {/* Back Button */}
          <button
            className="btn btn-primary btn-sm text-lg mb-5 rounded-lg"
            onClick={() => navigate("/communities")}
          >
            ← Back to Communities
          </button>
    
          {/* Community Hero */}
          <div className="relative overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-xl mb-8">
    
            {/* Banner */}
            <div className="h-40 md:h-52 w-full overflow-hidden">
              <img
                src={community.coverImage}
                alt="community"
                className="w-full h-full object-cover"
              />
            </div>
    
            {/* Content */}
            <div className="p-6 bg-base-300">
    
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
    
                {/* LEFT */}
                <div className="flex-1">
    
                  {/* Avatar + Name */}
                  <div className="flex items-start gap-4">
  
                    <div>
    
                      <div className="flex flex-wrap items-center gap-2">
    
                        <h1 className="text-2xl font-bold">
                          {community.name}
                        </h1>
    
                        {community.isAdmin && (
                          <span className="badge badge-primary badge-outline md:ml-2 mt-1 badge-lg font-semibold">
                            Admin
                          </span>
                        )}
    
                        {community.isMember &&
                          !community.isAdmin && (
                            <span className="badge badge-primary badge-outline ml-2 mt-1 badge-lg font-semibold">
                              Member
                            </span>
                          )}
                      </div>
    
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-base-content/60">
    
                        <span className="badge badge-primary text-black font-semibold gap-1 px-3 py-3">
                          {categoryLabel}
                        </span>
    
                        <span className="badge badge-primary text-black font-semibold gap-1 px-3 py-3">
                          {community.members?.length || 0} Members
                        </span>
    
                        <span className="badge badge-primary text-black font-semibold gap-1 px-3 py-3">
                          
                          {new Date(
                            community.createdAt
                          ).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
    
                  {/* Description */}
                  <p className="mt-5 opacity-70 text-base-content/70 leading-relaxed text-[15px]">
                    {community.description}
                  </p>
    
                  {/* Message Permission */}
                  <div className="mt-4 text-sm text-base-content/50">
                    {community.messagePermission ===
                    "admins_only"
                      ? "🔒 Only admins can send messages"
                      : "󠁯➤ Open community discussions enabled"}
                  </div>
                </div>
    
                {/* RIGHT ACTIONS */}
                <div className="flex flex-row lg:flex-col gap-3">
    
                  {community.isAdmin && (
                    <button
                      className="btn btn-primary rounded-md btn-sm text-lg px-6"
                      onClick={() => setShowEditModal(true)}
                    >
                      Edit
                    </button>
                  )}
    
                  {community.isMember ? (
                    <button
                      className="btn bg-red-800 pb-1 hover:bg-red-900 rounded-md btn-sm text-lg px-6"
                      onClick={handleJoinLeave}
                      disabled={
                        joining ||
                        community.createdBy?._id ===
                          loggedInUser?._id ||
                        community.createdBy ===
                          loggedInUser?._id
                      }
                    >
                      {joining ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        "Leave"
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary rounded-md btn-sm text-lg px-6"
                      onClick={handleJoinLeave}
                      disabled={joining}
                    >
                      {joining ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        "Join Community"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
    
          {/* Member Content */}
          {community.isMember ? (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-7">
    
                <button
                  className={`btn rounded-lg text-md ${
                    activeTab === "posts"
                      ? "btn-primary"
                      : "btn-ghost border bg-base-300"
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  Posts
                </button>
    
                <button
                  className={`btn rounded-lg text-md ${
                    activeTab === "chat"
                      ? "btn-primary"
                      : "btn-ghost border bg-base-300"
                  }`}
                  onClick={() => setActiveTab("chat")}
                >
                   Group Chat
                </button>
    
                {community.isAdmin && (
                  <button
                    className={`btn rounded-lg text-md ${
                      activeTab === "members"
                        ? "btn-primary"
                        : "btn-ghost border bg-base-300"
                    }`}
                    onClick={() => setActiveTab("members")}
                  >
                     Manage Members
                  </button>
                )}
              </div>
    
              {/* Tab Content */}
              <div className="bg-base-300 border border-base-300 rounded-xl shadow-md">
    
                {activeTab === "posts" && (
                  <CommunityPosts
                    community={community}
                    onUpdate={fetchCommunity}
                  />
                )}
    
                {activeTab === "chat" && (
                  <CommunityGroupChat
                    community={community}
                  />
                )}
    
                {activeTab === "members" &&
                  community.isAdmin && (
                    <MemberManagement
                      community={community}
                      onUpdate={fetchCommunity}
                    />
                  )}
              </div>
            </>
          ) : (
            <div className=" bg-base-300 rounded-xl py-20 px-6 text-center">
    
              <div className="text-6xl mb-5">
                🔒
              </div>
    
              <h2 className="text-3xl font-bold mb-3">
                Members Only Community
              </h2>
    
              <p className="text-base-content/60 max-w-lg mx-auto leading-relaxed">
                Join this community to participate in discussions,
                access group chat, explore posts, and collaborate
                with other developers.
              </p>
    
              <button
                className="btn btn-primary rounded-2xl mt-8 px-8"
                onClick={handleJoinLeave}
                disabled={joining}
              >
                {joining ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Join Community"
                )}
              </button>
            </div>
          )}
        </div>
    
        {/* Edit Modal */}
        {showEditModal && (
          <CommunityEditModal
            community={community}
            onClose={() => setShowEditModal(false)}
            onUpdated={handleCommunityUpdated}
          />
        )}
      </>
    );
}