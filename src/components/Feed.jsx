import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";

export default function Feed() {
  const dispatch  = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetched, setFetched ] = useState(false);

  const fetchFeed = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/user/feed?page=${pageNum}&limit=10`,
        { withCredentials: true }
      );
      const { data, totalPages: tp, page: p } = res.data;

      // On page 1 replace the store; on subsequent pages append
      if (pageNum === 1) {
        dispatch(addFeed(data));
      } else {
        dispatch(addFeed([...feed, ...data]));
      }

      setTotalPages(tp);
      setPage(p);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load feed. Try again.");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    // Only fetch on mount if feed is empty
    fetchFeed(1)
    if (feed.length === 0) {
      fetchFeed(1);
    } else {
      setFetched(true);
    }
  }, []);

  // ── States ──────────────────────────────────────────────────────────────────

  if (!fetched && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/50 text-sm">Finding your best matches…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="alert alert-error max-w-sm">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => fetchFeed(1)}>
          Retry
        </button>
      </div>
    );
  }

  if (fetched && feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-xl font-bold text-base-content">You're all caught up!</h2>
        <p className="text-base-content/50 text-sm max-w-xs">
          No more profiles to explore right now. Check back later or update your
          profile to get better matches.
        </p>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => fetchFeed(1)}
        >
          Refresh Feed
        </button>
      </div>
    );
  }

  // ── Main feed view — shows top card only (Tinder style) ─────────────────────
  const currentItem = feed[0];

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6 min-h-[80vh]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-base-content">Discover Developers</h1>
        <p className="text-sm text-base-content/50 mt-1">
          Developers Curated for You
        </p>
      </div>

      {/* Card */}
      {currentItem && (
        <UserCard key={currentItem.user._id} feedItem={currentItem} />
      )}

      {/* Queue preview dots */}
      {feed.length > 1 && (
        <div className="flex gap-1 mt-1">
          {feed.slice(0, Math.min(feed.length, 7)).map((item, i) => (
            <div
              key={item.user._id}
              className={`rounded-full transition-all ${
                i === 0
                  ? "w-4 h-2 bg-primary"
                  : "w-2 h-2 bg-base-300"
              }`}
            />
          ))}
          {feed.length > 7 && (
            <span className="text-xs text-base-content/30 ml-1">
              +{feed.length - 7}
            </span>
          )}
        </div>
      )}

      {/* Load more — when feed is running low */}
      {feed.length <= 3 && page < totalPages && (
        <button
          className={`btn btn-ghost btn-sm ${loading ? "loading" : ""}`}
          onClick={() => fetchFeed(page + 1)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load more profiles"}
        </button>
      )}
    </div>
  );
}