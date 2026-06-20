import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import DeveloperLink from "../DeveloperLink";

export default function MemberManagement({ community, onUpdate }) {
  const [loading, setLoading] = useState({});
  const [permission, setPermission] = useState(community.messagePermission);
  const [permLoading, setPermLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const setMemberLoading = (memberId, val) =>
    setLoading((prev) => ({ ...prev, [memberId]: val }));

  const isAdmin = (memberId) =>
    community.admins?.some((a) => (a._id || a).toString() === memberId.toString());

  const isCreator = (memberId) =>
    (community.createdBy?._id || community.createdBy)?.toString() ===
    memberId.toString();

  // ── Promote to admin ────────────────────────────────────────────────────────
  const handlePromote = async (memberId) => {
    setMemberLoading(memberId, "promoting");
    try {
      await axios.post(
        `${BASE_URL}/community/${community._id}/promote`,
        { memberId },
        { withCredentials: true }
      );
      showToast("Member promoted to admin ✅");
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to promote");
    } finally {
      setMemberLoading(memberId, null);
    }
  };

  // ── Demote admin ─────────────────────────────────────────────────────────────
  const handleDemote = async (memberId) => {
    setMemberLoading(memberId, "demoting");
    try {
      await axios.post(
        `${BASE_URL}/community/${community._id}/demote`,
        { memberId },
        { withCredentials: true }
      );
      showToast("Admin demoted to member ✅");
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to demote");
    } finally {
      setMemberLoading(memberId, null);
    }
  };

  // ── Remove member ─────────────────────────────────────────────────────────────
  const handleRemove = async (memberId) => {
    if (!confirm("Remove this member from the community?")) return;
    setMemberLoading(memberId, "removing");
    try {
      await axios.post(
        `${BASE_URL}/community/${community._id}/remove-member`,
        { memberId },
        { withCredentials: true }
      );
      showToast("Member removed ✅");
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    } finally {
      setMemberLoading(memberId, null);
    }
  };

  // ── Update message permission ─────────────────────────────────────────────────
  const handlePermissionChange = async (newPerm) => {
    setPermLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/community/${community._id}/message-permission`,
        { messagePermission: newPerm },
        { withCredentials: true }
      );
      setPermission(newPerm);
      showToast("Message permission updated ✅");
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update permission");
    } finally {
      setPermLoading(false);
    }
  };

  const filteredMembers = (community.members || []).filter((m) => {
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-7 p-4 md:p-6">
  
      {/* Toast */}
      {toast && (
        <div className="alert alert-success shadow-lg rounded-2xl">
          <span>{toast}</span>
        </div>
      )}
  
      {/* Permission Settings */}
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-md p-6">
  
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
  
          <div>
            <h2 className="text-xl font-bold">
               Group Chat Permissions
            </h2>
  
            <p className="text-sm text-base-content/60">
              Control who can participate in community discussions.
            </p>
          </div>
  
          <div className="flex gap-3">
  
            <button
              className={`btn rounded-lg px-6 ${
                permission === "all"
                  ? "btn-primary"
                  : "btn-outline"
              }`}
              onClick={() => handlePermissionChange("all")}
              disabled={permLoading || permission === "all"}
            >
              All Members
            </button>
  
            <button
              className={`btn rounded-lg px-6 ${
                permission === "admins_only"
                  ? "btn-primary"
                  : "btn-primary btn-outline"
              }`}
              onClick={() =>
                handlePermissionChange("admins_only")
              }
              disabled={
                permLoading ||
                permission === "admins_only"
              }
            >
              Admins Only
            </button>
          </div>
        </div>
  
        <div className="mt-4 text-sm text-base-content/50">
          Current Permission:
          <span className="font-semibold ml-2">
            {permission === "admins_only"
              ? "Admins Only"
              : "All Members"}
          </span>
        </div>
      </div>
  
      {/* Members */}
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-md overflow-hidden">
  
        {/* Header */}
        <div className="p-6 border-b border-base-300">
  
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  
            <div>
              <h2 className="text-xl font-bold">
                Community Members
              </h2>
  
              <p className="text-sm text-base-content/60 ">
                Manage admins, permissions, and members.
              </p>
            </div>
  
            {/* Search */}
            <input
              type="text"
              className="input input-bordered rounded-lg w-full md:w-72"
              placeholder="Search members..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>
  
        {/* Members List */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
  
          {filteredMembers.length === 0 && (
            <div className="py-16 text-center">
  
              <div className="text-5xl mb-3">
                🔍
              </div>
  
              <h3 className="text-xl font-semibold">
                No members found
              </h3>
  
              <p className="text-base-content/50 mt-2">
                Try searching with another name.
              </p>
            </div>
          )}
  
          {filteredMembers.map((member) => {
            const memberId = member._id || member;
  
            const admin = isAdmin(memberId);
  
            const creator = isCreator(memberId);
  
            const memberLoading =
              loading[memberId];
  
            return (
              <div
                key={memberId}
                className="bg-base-200 hover:bg-base-300 transition-all duration-200 rounded-xl p-4 border border-transparent hover:border-base-300"
              >
  
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
  
                  {/* LEFT */}
                  <DeveloperLink userId={memberId}>
                  <div className="flex items-center gap-4">
  
                    {/* Avatar */}
                    
                      <div className="avatar cursor-pointer">
  
                        <div className="w-12 rounded-xl  ring-primary/20 ring-offset-2 ring-offset-base-100">
  
                          <img
                            src={
                              member.photoUrl ||
                              "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
                            }
                            alt="avatar"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    
  
                    {/* Info */}
                    <div>
  
                      <DeveloperLink
                        userId={memberId}
                        className="hover:text-primary transition-colors"
                      >
                        <h3 className="font-bold text-md">
                          {member.firstName}{" "}
                          {member.lastName}
                        </h3>
                      </DeveloperLink>
  
                      <div className="flex flex-wrap gap-2 mt-2">
  
                        {creator && (
                          <span className="badge badge-primary text-black badge-md font-medium">
                             Creator
                          </span>
                        )}
  
                        {admin && !creator && (
                          <span className="badge badge-primary text-black badge-md font-medium">
                             Admin
                          </span>
                        )}
  
                        {member.experienceLevel && (
                          <span className="badge badge-primary badge-outline badge-md capitalize">
                            {member.experienceLevel}
                          </span>
                        )}
                      </div>
  
                      {member.about && (
                        <p className="text-sm text-base-content/60 mt-2 line-clamp-2 max-w-xl">
                          {member.about}
                        </p>
                      )}
                    </div>
                  </div>
                  </DeveloperLink>
                  {/* RIGHT ACTIONS */}
                  {!creator && (
                    <div className="flex flex-wrap gap-2">
  
                      {admin ? (
                        isCreator(
                          community.createdBy?._id ||
                            community.createdBy
                        ) ? (
                          <button
                            className="btn btn-warning btn-sm rounded-lg"
                            onClick={() =>
                              handleDemote(memberId)
                            }
                            disabled={!!memberLoading}
                          >
                            {memberLoading ===
                            "demoting" ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              "Demote"
                            )}
                          </button>
                        ) : null
                      ) : (
                        <button
                          className="btn btn-success btn-outline btn-sm rounded-lg"
                          onClick={() =>
                            handlePromote(memberId)
                          }
                          disabled={!!memberLoading}
                        >
                          {memberLoading ===
                          "promoting" ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "Promote"
                          )}
                        </button>
                      )}
  
                      <button
                        className="btn btn-error btn-outline btn-sm rounded-lg"
                        onClick={() =>
                          handleRemove(memberId)
                        }
                        disabled={!!memberLoading}
                      >
                        {memberLoading ===
                        "removing" ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            
            );
          })}
        </div>
      </div>
    </div>
  );
}