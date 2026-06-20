import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most_liked", label: "Most Liked" },
];

export default function CommunityPosts({ community }) {
  const loggedInUser = useSelector((store) => store.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(false);

  // Filters
  const [sortBy, setSortBy] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum = 1, replace = true) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: pageNum, limit: 10, sortBy });
        if (search) params.set("search", search);
        if (tagFilter) params.set("tag", tagFilter);

        const res = await axios.get(
          `${BASE_URL}/community/${community._id}/posts?${params}`,
          { withCredentials: true }
        );

        const { data, totalPages: tp, total: t } = res.data;
        replace ? setPosts(data) : setPosts((prev) => [...prev, ...data]);
        setTotalPages(tp);
        setTotal(t);
        setFetched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [community._id, sortBy, search, tagFilter]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [sortBy, search, tagFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, false);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setTotal((t) => t + 1);
    setShowCreate(false);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setTotal((t) => t - 1);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleLikeToggled = (postId, likesCount, isLiked) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likesCount, isLiked } : p
      )
    );
  };

  const handleTagClick = (tag) => {
    setTagFilter(tag);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Toolbar */}
      <div className="flex pt-2 flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
            >
              ✕
            </button>
          )}
        </form>

        {/* Sort */}
        <select
          className="select select-bordered w-full sm:w-44"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Create Post button */}
        <button
          className="btn btn-primary gap-1"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-lg">+</span> Post
        </button>
      </div>

      {/* Active filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {search && (
          <span className="badge badge-primary gap-1">
            🔍 {search}
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
            >
              ✕
            </button>
          </span>
        )}
        {tagFilter && (
          <span className="badge badge-primary gap-1">
             {tagFilter}
            <button onClick={() => setTagFilter("")}>✕</button>
          </span>
        )}
        {(search || tagFilter) && (
          <span className="text-sm text-base-content/40 self-center">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Posts list */}
      {loading && !fetched ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="card bg-base-200 animate-pulse h-40 rounded-2xl"
            />
          ))}
        </div>
      ) : !fetched || posts.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-2xl">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
          <p className="text-base-content/50 mb-5">
            {search || tagFilter
              ? "No posts match your search"
              : "Be the first to post in this community!"}
          </p>
          {!search && !tagFilter && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(true)}
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              community={community}
              loggedInUser={loggedInUser}
              onDeleted={handlePostDeleted}
              onUpdated={handlePostUpdated}
              onLikeToggled={handleLikeToggled}
              onTagClick={handleTagClick}
            />
          ))}

          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <button
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Load More Posts"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create post modal */}
      {showCreate && (
        <CreatePostModal
          communityId={community._id}
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}