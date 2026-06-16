import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import ImageUploader from "../ImageUploader";

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

export default function CommunityEditModal({
  community,
  onClose,
  onUpdated,
}) {
  const [form, setForm] = useState({
    name: community?.name || "",
    description: community?.description || "",
    category: community?.category || "general",
    coverImage: community?.coverImage || "https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-group-icon-png-image_1796653.jpg",
    messagePermission: community?.messagePermission || "all",
  });

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [bannerFile,setBannerFile] = useState(null);
  const [uploadingBanner,setUploadingBanner] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Update text fields (send coverImage only if no new file was picked)
      const { coverImage: _ignored, ...bodyWithoutCover } = form;
      const res = await axios.put(
        `${BASE_URL}/community/${community._id}`,
        bodyWithoutCover,
        { withCredentials: true }
      );
      let updatedCommunity = res.data.data;

      // 2. If user picked a new banner, upload it
      if (bannerFile) {
        setUploadingBanner(true);
        const fd = new FormData();
        fd.append("banner", bannerFile);
        try {
          const bannerRes = await axios.post(
            `${BASE_URL}/upload/community-banner/${community._id}`,
            fd,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
          );
          updatedCommunity = { ...updatedCommunity, coverImage: bannerRes.data.coverImage };
        } catch {
          // Banner upload failed — other edits still saved
        } finally {
          setUploadingBanner(false);
        }
      }

      onUpdated(updatedCommunity);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update community"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">

        <div className="w-full max-w-2xl bg-base-100 rounded-3xl border border-base-300 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">

          {/* Header */}
          <div className="relative p-5 sm:p-8 border-b border-base-300 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">

            <button
              className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
              onClick={onClose}
            >
              ✕
            </button>

            <div className="space-y-2 pr-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Edit Community
              </h2>

              <p className="text-base-content/70 text-sm sm:text-base">
                Update your community details and settings.
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
          >

            {/* Community Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Community Name
              </label>

              <input
                type="text"
                name="name"
                className="input input-bordered w-full h-12 sm:h-14 rounded-2xl text-base"
                placeholder="Community name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">
                  Description
                </label>

                <span className="text-xs text-base-content/50">
                  {form.description.length}/1000
                </span>
              </div>

              <textarea
                name="description"
                className="textarea textarea-bordered w-full rounded-2xl resize-none h-32 text-base"
                placeholder="Describe your community..."
                value={form.description}
                onChange={handleChange}
                maxLength={1000}
              />
            </div>

            {/* Category + Cover */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  className="select select-bordered w-full h-12 sm:h-14 rounded-2xl"
                  value={form.category}
                  onChange={handleChange}
                >
                  {Object.entries(CATEGORY_LABELS).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Cover Image
                </label>
                <ImageUploader
                  shape="banner"
                  currentImage={form.coverImage}
                  onUpload={(file) => setBannerFile(file)}
                  uploading={uploadingBanner}
                />
              </div>
            </div>

            {/* Message Permissions */}
            <div className="space-y-4">
              <label className="text-sm font-semibold">
                Group Chat Permissions
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* All Members */}
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    form.messagePermission === "all"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="messagePermission"
                    value="all"
                    className="hidden"
                    checked={
                      form.messagePermission === "all"
                    }
                    onChange={handleChange}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        All Members
                      </h3>

                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          form.messagePermission === "all"
                            ? "border-primary bg-primary"
                            : "border-base-content/30"
                        }`}
                      />
                    </div>

                    <p className="text-sm text-base-content/60 leading-relaxed">
                      Everyone in the community can
                      participate in discussions.
                    </p>
                  </div>
                </label>

                {/* Admins Only */}
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    form.messagePermission ===
                    "admins_only"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="messagePermission"
                    value="admins_only"
                    className="hidden"
                    checked={
                      form.messagePermission ===
                      "admins_only"
                    }
                    onChange={handleChange}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Admins Only
                      </h3>

                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          form.messagePermission ===
                          "admins_only"
                            ? "border-primary bg-primary"
                            : "border-base-content/30"
                        }`}
                      />
                    </div>

                    <p className="text-sm text-base-content/60 leading-relaxed">
                      Only admins can send messages
                      while members can read chats.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error rounded-2xl">
                <span>{error}</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">

              <button
                type="button"
                className="btn btn-ghost rounded-xl px-6"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary rounded-xl px-8"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}