import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

export default function CreatePostModal({ communityId, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setError("Post content is required");
      return;
    }
    setLoading(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await axios.post(
        `${BASE_URL}/community/${communityId}/posts`,
        { title: form.title.trim(), content: form.content.trim(), tags },
        { withCredentials: true }
      );
      onCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
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
                Create Post
              </h2>
  
              <p className="text-base-content/70 text-sm sm:text-base">
                Share ideas, ask questions, and contribute to your community.
              </p>
            </div>
          </div>
  
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
          >
  
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Title
                </label>
  
                <span className="text-xs text-base-content/50">
                  Optional
                </span>
              </div>
  
              <input
                type="text"
                name="title"
                className="input input-bordered w-full h-12 sm:h-14 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Give your post a title..."
                value={form.title}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
  
            {/* Content */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">
                  Content
                </label>
  
                <span className="text-xs text-base-content/50">
                  {form.content.length}/5000
                </span>
              </div>
  
              <textarea
                name="content"
                className="textarea textarea-bordered w-full rounded-2xl resize-none h-40 text-base leading-relaxed"
                placeholder="Share something valuable with the community..."
                value={form.content}
                onChange={handleChange}
                maxLength={5000}
              />
            </div>
  
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Tags
                </label>
  
                <span className="text-xs text-base-content/50">
                  comma separated
                </span>
              </div>
  
              <input
                type="text"
                name="tags"
                className="input input-bordered w-full h-12 sm:h-14 rounded-2xl"
                placeholder="e.g. leetcode, arrays, ai, startup"
                value={form.tags}
                onChange={handleChange}
              />
  
              {/* Tag Preview */}
              {form.tags.trim() && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((tag, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        #{tag}
                      </div>
                    ))}
                </div>
              )}
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
                  "Publish Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}