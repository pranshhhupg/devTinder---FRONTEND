import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

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
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="alert alert-success py-2 text-sm">
          <span>{toast}</span>
        </div>
      )}

      {/* Message Permission Panel */}
      <div className="card bg-base-100 border border-base-300 shadow p-5">
        <h3 className="font-bold text-base mb-3">💬 Group Chat Permissions</h3>
        <p className="text-sm text-base-content/60 mb-4">
          Control who can send messages in the group chat.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className={`btn flex-1 gap-2 ${
              permission === "all" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => handlePermissionChange("all")}
            disabled={permLoading || permission === "all"}
          >
            🌐 All Members
          </button>
          <button
            className={`btn flex-1 gap-2 ${
              permission === "admins_only" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => handlePermissionChange("admins_only")}
            disabled={permLoading || permission === "admins_only"}
          >
            🔒 Admins Only
          </button>
        </div>
        <p className="text-xs text-base-content/40 mt-2">
          Current:{" "}
          <strong>
            {permission === "admins_only" ? "Admins Only" : "All Members"}
          </strong>
        </p>
      </div>

      {/* Members List */}
      <div className="card bg-base-100 border border-base-300 shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">
            👥 Members ({community.members?.length || 0})
          </h3>
          <input
            type="text"
            className="input input-bordered input-sm w-44"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredMembers.length === 0 && (
            <p className="text-center text-base-content/40 py-8">
              No members found
            </p>
          )}

          {filteredMembers.map((member) => {
            const memberId = member._id || member;
            const admin = isAdmin(memberId);
            const creator = isCreator(memberId);
            const memberLoading = loading[memberId];

            return (
              <div
                key={memberId}
                className="flex items-center justify-between p-3 rounded-xl bg-base-200 hover:bg-base-300 transition"
              >
                {/* Member info */}
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          member.photoUrl ||
                          "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
                        }
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {member.firstName} {member.lastName}
                    </p>
                    <div className="flex gap-1 mt-0.5">
                      {creator && (
                        <span className="badge badge-warning badge-xs">
                          Creator
                        </span>
                      )}
                      {admin && !creator && (
                        <span className="badge badge-info badge-xs">
                          Admin
                        </span>
                      )}
                      {member.experienceLevel && (
                        <span className="badge badge-ghost badge-xs capitalize">
                          {member.experienceLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions — don't show for creator */}
                {!creator && (
                  <div className="flex gap-2">
                    {admin ? (
                      /* Demote (only creator can demote) */
                      isCreator(
                        community.createdBy?._id || community.createdBy
                      ) ? (
                        <button
                          className="btn btn-xs btn-warning"
                          onClick={() => handleDemote(memberId)}
                          disabled={!!memberLoading}
                        >
                          {memberLoading === "demoting" ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "Demote"
                          )}
                        </button>
                      ) : null
                    ) : (
                      /* Promote */
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() => handlePromote(memberId)}
                        disabled={!!memberLoading}
                      >
                        {memberLoading === "promoting" ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          "Promote"
                        )}
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={() => handleRemove(memberId)}
                      disabled={!!memberLoading}
                    >
                      {memberLoading === "removing" ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "Remove"
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}