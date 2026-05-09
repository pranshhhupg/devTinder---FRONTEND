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
  devops: "DevOps & Cloud",
  mobile: "Mobile Development",
  "open-source": "Open Source",
  startup: "Startup Builders",
  "system-design": "System Design",
  web3: "Web3 & Blockchain",
  cybersecurity: "Cybersecurity",
  general: "General",
};

const CATEGORY_ICONS = {
  dsa: "🧮",
  backend: "⚙️",
  frontend: "🎨",
  ml: "🤖",
  devops: "☁️",
  mobile: "📱",
  "open-source": "🌐",
  startup: "🚀",
  "system-design": "🏗️",
  web3: "🔗",
  cybersecurity: "🔐",
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
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Back */}
        <button
          className="btn btn-ghost btn-sm mb-4 gap-1"
          onClick={() =>
            navigate("/communities")
          }
        >
          ← Communities
        </button>

        {/* Community Header */}
        <div className="card bg-base-100 border border-base-300 shadow-lg mb-6 overflow-hidden">


          {/* Content */}
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

              {/* Left */}
              <div className="flex-1">

                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">
                    {community.name}
                  </h1>

                  {community.isAdmin && (
                    <span className="badge badge-warning badge-sm">
                      Admin
                    </span>
                  )}

                  {community.isMember &&
                    !community.isAdmin && (
                      <span className="badge badge-success badge-sm">
                        Member
                      </span>
                    )}
                </div>

                <p className="text-base-content/60 mt-1 leading-relaxed">
                  {community.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-base-content/50">

                  <span>
                    {icon} {categoryLabel}
                  </span>

                  <span>
                    👥{" "}
                    {community.members?.length || 0}{" "}
                    members
                  </span>

                  <span>
                    📅 Created{" "}
                    {new Date(
                      community.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <span>
                    💬{" "}
                    {community.messagePermission ===
                    "admins_only"
                      ? "Admins can message"
                      : "Open messaging"}
                  </span>
                </div>
              </div>

              {/* Right Buttons */}
              <div className="flex flex-wrap gap-2">

                {/* Edit */}
                {community.isAdmin && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      setShowEditModal(true)
                    }
                  >
                    ✏️ Edit
                  </button>
                )}

                {/* Join / Leave */}
                {community.isMember ? (
                  <button
                    className="btn btn-outline btn-sm"
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
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Leave"
                    )}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleJoinLeave}
                    disabled={joining}
                  >
                    {joining ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Join Community"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {community.isMember ? (
          <>
            <div className="tabs tabs-boxed mb-6 overflow-x-auto">

              <button
                className={`tab gap-2 ${
                  activeTab === "posts"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("posts")
                }
              >
                📝 Community Posts
              </button>

              <button
                className={`tab gap-2 ${
                  activeTab === "chat"
                    ? "tab-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab("chat")
                }
              >
                💬 Group Chat
              </button>

              {community.isAdmin && (
                <button
                  className={`tab gap-2 ${
                    activeTab === "members"
                      ? "tab-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("members")
                  }
                >
                  👥 Manage Members
                </button>
              )}
            </div>

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
          </>
        ) : (
          <div className="text-center py-16 bg-base-200 rounded-2xl">

            <div className="text-5xl mb-4">
              🔒
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Members-Only Content
            </h3>

            <p className="text-base-content/50 mb-6">
              Join this community to see posts
              and participate in discussions
            </p>

            <button
              className="btn btn-primary"
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
          onClose={() =>
            setShowEditModal(false)
          }
          onUpdated={handleCommunityUpdated}
        />
      )}
    </>
  );
}