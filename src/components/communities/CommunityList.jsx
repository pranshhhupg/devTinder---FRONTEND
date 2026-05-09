import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import {
  setCommunities,
  appendCommunities,
  addCommunity,
} from "../../utils/communitySlice";
import CreateCommunityModal from "./CreateCommunityModal";

const CATEGORIES = [
  { value: "", label: "All Categories" },
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

export default function CommunityList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: communities } = useSelector((store) => store.community);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchCommunities = useCallback(
    async (pageNum = 1, replace = true) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: pageNum, limit: 12 });
        if (search) params.set("search", search);
        if (category) params.set("category", category);

        const res = await axios.get(
          `${BASE_URL}/communities?${params}`,
          { withCredentials: true }
        );
        const { data, total: t, totalPages: tp } = res.data;
        replace
          ? dispatch(setCommunities(data))
          : dispatch(appendCommunities(data));
        setTotal(t);
        setTotalPages(tp);
        setFetched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [search, category, dispatch]
  );

  // Initial load + when filters change
  useEffect(() => {
    setPage(1);
    fetchCommunities(1, true);
  }, [search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchCommunities(next, false);
  };

  const handleCommunityCreated = (newCommunity) => {
    dispatch(addCommunity(newCommunity));
    setShowCreate(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Communities</h1>
          <p className="text-base-content/60">
            Find your tribe, connect with developers who share your interests
          </p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-lg">+</span> Create Community
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Search communities..."
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

        <select
          className="select select-bordered w-full sm:w-56"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filters */}
      {(search || category) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search && (
            <span className="badge badge-primary gap-1">
              🔍 {search}
              <button
                className="ml-1"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
              >
                ✕
              </button>
            </span>
          )}
          {category && (
            <span className="badge badge-secondary gap-1">
              {CATEGORY_ICONS[category]} {CATEGORIES.find((c) => c.value === category)?.label}
              <button className="ml-1" onClick={() => setCategory("")}>
                ✕
              </button>
            </span>
          )}
          <span className="text-sm text-base-content/50 self-center">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !fetched && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card bg-base-200 shadow animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {fetched && !loading && communities.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-xl font-semibold mb-2">No communities found</h3>
          <p className="text-base-content/50 mb-6">
            {search || category
              ? "Try different search terms or clear filters"
              : "Be the first to create a community!"}
          </p>
          {!search && !category && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
            >
              Create Community
            </button>
          )}
        </div>
      )}

      {/* Community Cards Grid */}
      {communities.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((community) => (
              <CommunityCard
                key={community._id}
                community={community}
                onClick={() => navigate(`/communities/${community._id}`)}
              />
            ))}
          </div>

          {/* Load more */}
          {page < totalPages && (
            <div className="flex justify-center mt-8">
              <button
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateCommunityModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCommunityCreated}
        />
      )}
    </div>
  );
}

// ── Community Card ─────────────────────────────────────────────────────────────
function CommunityCard({ community, onClick }) {
  const icon = CATEGORY_ICONS[community.category] || "💬";
  const categoryLabel =
    CATEGORIES.find((c) => c.value === community.category)?.label ||
    community.category;

  return (
    <div
      className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Cover image or gradient */}
      <div
        className="h-40 rounded-t-lg flex items-center justify-center text-4xl"
        style={{
          background: community.coverImage
            ? `url(${community.coverImage}) center/cover`
            : "linear-gradient(135deg, var(--p) 0%, var(--s) 100%)",
        }}
      >
        {!community.coverImage && icon}
      </div>

      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base font-bold leading-tight line-clamp-2">
            {community.name}
          </h3>
          {community.isMember && (
            <span className="badge badge-success badge-sm shrink-0">
              Joined
            </span>
          )}
        </div>

        <p className="text-sm text-base-content/60 line-clamp-2 mt-1">
          {community.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="badge badge-outline badge-sm">
            {icon} {categoryLabel}
          </span>
          <span className="text-xs text-base-content/50">
            👥 {community.members?.length ?? community.memberCount ?? 0} members
          </span>
        </div>
      </div>
    </div>
  );
}