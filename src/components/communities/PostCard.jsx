import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

export default function PostCard({
  post,
  community,
  loggedInUser,
  onDeleted,
  onUpdated,
  onLikeToggled,
  onTagClick,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likePending, setLikePending] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content || "");
  const [editTags, setEditTags] = useState((post.tags || []).join(", "));
  const [editLoading, setEditLoading] = useState(false);

  const isAuthor = loggedInUser?._id === (post.author?._id || post.author);
  const isAdmin = community?.isAdmin;

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/community/post/${post._id}/like`,
        {},
        { withCredentials: true }
      );
      onLikeToggled(post._id, res.data.likesCount, res.data.isLiked);
    } catch (err) {
      console.error(err);
    } finally {
      setLikePending(false);
    }
  };

  // ── Delete Post ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await axios.delete(`${BASE_URL}/community/post/${post._id}`, {
        withCredentials: true,
      });
      onDeleted(post._id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  // ── Edit Post ────────────────────────────────────────────────────────────────
  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      const tags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await axios.put(
        `${BASE_URL}/community/post/${post._id}`,
        { title: editTitle, content: editContent, tags },
        { withCredentials: true }
      );
      onUpdated(res.data.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Add Comment ──────────────────────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/community/post/${post._id}/comment`,
        { content: commentInput.trim() },
        { withCredentials: true }
      );
      setComments((prev) => [...prev, res.data.data]);
      setCommentInput("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // ── Delete Comment ───────────────────────────────────────────────────────────
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${BASE_URL}/community/post/${post._id}/comment/${commentId}`,
        { withCredentials: true }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const author = post.author;

  return (
    <div className="card bg-base-100 border border-base-300 shadow hover:shadow-md transition-shadow rounded-2xl">
      <div className="card-body p-5">
        {/* Author row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img
                  src={
                    author?.photoUrl ||
                    "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
                  }
                  alt="avatar"
                />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">
                {author?.firstName} {author?.lastName}
              </p>
              <p className="text-xs text-base-content/40">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Post actions */}
          {(isAuthor || isAdmin) && (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                ⋯
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box z-10 w-36"
              >
                {isAuthor && (
                  <li>
                    <button onClick={() => setIsEditing(true)}>✏️ Edit</button>
                  </li>
                )}
                <li>
                  <button
                    className="text-error"
                    onClick={handleDelete}
                  >
                    🗑 Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Post title (optional)"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full resize-none h-28"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <input
              type="text"
              className="input input-bordered w-full text-sm"
              placeholder="Tags (comma separated)"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.title && (
              <h3 className="font-bold text-base mb-1">{post.title}</h3>
            )}
            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    className="badge badge-outline badge-sm hover:badge-primary cursor-pointer transition"
                    onClick={() => onTagClick && onTagClick(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Like + Comment bar */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-base-300">
          <button
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              post.isLiked
                ? "text-error font-semibold"
                : "text-base-content/50 hover:text-error"
            }`}
            onClick={handleLike}
            disabled={likePending}
          >
            {post.isLiked ? "❤️" : "🤍"} {post.likesCount ?? post.likes?.length ?? 0}
          </button>

          <button
            className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-primary transition-colors"
            onClick={() => setShowComments((v) => !v)}
          >
            💬 {comments.length} Comment{comments.length !== 1 ? "s" : ""}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-3">
            {comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                loggedInUser={loggedInUser}
                isAdmin={isAdmin}
                onDelete={() => handleDeleteComment(c._id)}
                timeAgo={timeAgo}
              />
            ))}

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img
                    src={loggedInUser?.photoUrl}
                    alt="me"
                  />
                </div>
              </div>
              <input
                type="text"
                className="input input-bordered input-sm flex-1 rounded-full"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingComment || !commentInput.trim()}
              >
                {submittingComment ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Post"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comment Item ───────────────────────────────────────────────────────────────
function CommentItem({ comment, loggedInUser, isAdmin, onDelete, timeAgo }) {
  const author = comment.author;
  const isOwn =
    loggedInUser?._id === (author?._id || author);

  return (
    <div className="flex gap-2 items-start group">
      <div className="avatar">
        <div className="w-7 h-7 rounded-full shrink-0">
          <img
            src={
              author?.photoUrl ||
              "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
            }
            alt="avatar"
          />
        </div>
      </div>
      <div className="bg-base-200 rounded-2xl px-3 py-2 flex-1 text-sm relative">
        <span className="font-semibold mr-1">
          {author?.firstName} {author?.lastName}
        </span>
        <span className="text-base-content/70">{comment.content}</span>
        <span className="text-xs text-base-content/30 ml-2">
          {timeAgo(comment.createdAt)}
        </span>
      </div>
      {(isOwn || isAdmin) && (
        <button
          className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity text-error"
          onClick={onDelete}
        >
          ✕
        </button>
      )}
    </div>
  );
}