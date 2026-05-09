import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

const CATEGORIES = [
  { value: "dsa", label: "DSA Preparation" },
  { value: "backend", label: "Backend Developers" },
  { value: "frontend", label: "Frontend Developers" },
  { value: "ml", label: "ML Engineering Hub" },
  { value: "devops", label: "DevOps & Cloud" },
  { value: "mobile", label: "Mobile Development" },
  { value: "open-source", label: "Open Source" },
  { value: "startup", label: "Startup Builders" },
  { value: "system-design", label: "System Design" },
  { value: "web3", label: "Web3 & Blockchain" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "general", label: "General" },
];

export default function CreateCommunityModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "general",
    coverImage: "https://png.pngtree.com/png-vector/20191009/ourmid/pngtree-group-icon-png-image_1796653.jpg",
    messagePermission: "all",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError("Name and description are required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/community`,
        form,
        { withCredentials: true }
      );
      onCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create community");
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
                Create Community
              </h2>
  
              <p className="text-base-content/70 text-sm sm:text-base">
                Build a developer space where people can collaborate,
                learn, and grow together.
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
                className="input input-bordered w-full h-12 sm:h-14 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Backend Developers India"
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
                  {CATEGORIES.map((c) => (
                    <option
                      key={c.value}
                      value={c.value}
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Cover Image URL
                </label>
  
                <input
                  type="url"
                  name="coverImage"
                  className="input input-bordered w-full h-12 sm:h-14 rounded-2xl"
                  placeholder="https://..."
                  value={form.coverImage}
                  onChange={handleChange}
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
                    checked={form.messagePermission === "all"}
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
                      Everyone in the community can send
                      and participate in discussions.
                    </p>
                  </div>
                </label>
  
                {/* Admins Only */}
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    form.messagePermission === "admins_only"
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
                      form.messagePermission === "admins_only"
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
                      Only admins can send messages while
                      members can read conversations.
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
                  "Create Community"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}