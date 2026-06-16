import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import {
  setSearchResults,
  setSearchQuery,
  setSearchRole,
  setSearchAvailability,
  setSearchLoading,
  setSearchError,
  clearSearch,
} from "../utils/searchSlice";
import SearchDeveloperCard from "./SearchDeveloperCard";

// ── Filter option definitions ─────────────────────────────────────────────────

const ROLE_FILTERS = [
  { value: "all", label: "All Roles"   },
  { value: "frontend", label: "Frontend Dev"  },
  { value: "backend", label: "Backend Dev"   },
  { value: "fullstack", label: "Full Stack"     },
  { value: "ml", label: "ML Engineer"   },
  { value: "ai", label: "AI Engineer" },
  { value: "prompt", label: "Prompt Engineer" },
  { value: "datascientist", label: "Data Scientist" },
  { value: "dataanalyst", label: "Data Analyst" },
  { value: "devops",label: "DevOps"         },
  { value: "mobile",  label: "Mobile Dev"    },
  { value: "designer", label: "UI/UX Designer" },
  { value: "product", label: "Product Manager"},
  { value: "qa", label: "QA Engineer" },
  { value: "blockchain", label: "Blockchain Dev" },
  { value: "consultant", label: "Consultant" },
];

const AVAILABILITY_FILTERS = [
  { value: "all", label: "Any Availability"},
  { value: "weekends", label: "Weekends Only"},
  { value: "fulltime", label: "Full-time" },
  { value: "evenings", label: "Night Owls" },
  { value: "hackathon",label: "Hackathon-ready" },
  { value: "startup", label: "Startup-ready"   },
  { value: "flexible", label: "Flexible" },
];

// ── Example suggestions ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  "React developer",
  "AI engineer",
  "Prompt engineer",
  "hackathon builders",
  "startup founders",
  "Flutter dev",
  "DevOps engineer",
  "Full stack MERN",
  "UI designer",
  "Data scientist",
  "Data analyst",
  "QA engineer",
  "Blockchain dev",
  "Node.js backend",
];

// ─────────────────────────────────────────────────────────────────────────────

export default function SearchDevelopers() {
  const dispatch = useDispatch();
  const {
    results,
    query,
    role,
    availability,
    total,
    page,
    totalPages,
    loading,
    error,
  } = useSelector((store) => store.search);

  const [inputValue, setInputValue] = useState(query);
  const debounceTimer                = useRef(null);

  // ── Fetch results from API ──────────────────────────────────────────────────
  const fetchResults = useCallback(
    async ({ q, role: r, availability: a, pageNum = 1 } = {}) => {
      const searchQ    = q    ?? query;
      const searchRole = r    ?? role;
      const searchAvail= a    ?? availability;

      // Need at least one filter active
      const hasFilter =
        searchQ.trim() ||
        (searchRole && searchRole !== "all") ||
        (searchAvail && searchAvail !== "all");

      if (!hasFilter) return;

      dispatch(setSearchLoading(true));
      try {
        const params = new URLSearchParams({
          ...(searchQ.trim()                   && { q: searchQ.trim() }),
          ...(searchRole !== "all"             && { role: searchRole }),
          ...(searchAvail !== "all"            && { availability: searchAvail }),
          page:  pageNum,
          limit: 20,
        });

        const res = await axios.get(`${BASE_URL}/user/search?${params}`, {
          withCredentials: true,
        });

        dispatch(setSearchResults(res.data));
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Search failed.";
        dispatch(setSearchError(msg));
      } finally {
        dispatch(setSearchLoading(false));
      }
    },
    [query, role, availability, dispatch]
  );

  // ── Debounced text input handler ────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch(setSearchQuery(val));
      fetchResults({ q: val });
    }, 400);
  };

  // ── Immediate search (Enter / button) ──────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    clearTimeout(debounceTimer.current);
    dispatch(setSearchQuery(inputValue));
    fetchResults({ q: inputValue });
  };

  // ── Role filter change ──────────────────────────────────────────────────────
  const handleRoleChange = (val) => {
    dispatch(setSearchRole(val));
    fetchResults({ role: val });
  };

  // ── Availability filter change ──────────────────────────────────────────────
  const handleAvailChange = (val) => {
    dispatch(setSearchAvailability(val));
    fetchResults({ availability: val });
  };

  // ── Suggestion click ────────────────────────────────────────────────────────
  const handleSuggestion = (text) => {
    setInputValue(text);
    dispatch(setSearchQuery(text));
    fetchResults({ q: text });
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    fetchResults({ pageNum: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Clear ───────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setInputValue("");
    dispatch(clearSearch());
  };

  // Re-fetch if role/availability changed via redux from another source
  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  const hasActiveSearch =
    inputValue.trim() || role !== "all" || availability !== "all";

  return (
    <div className="min-h-screen bg-base-200 pb-16">

      {/* ── Hero / Search bar ─────────────────────────────────────────────── */}
      <div className="bg-base-200 px-4 py-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-1">Find Developers</h1>
        <p className="text-base-content/50 text-sm mb-6">
          Search by name, skill, role, or goal, smart matching does the rest.
        </p>

        {/* Search input */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex max-w-xl mx-auto gap-2"
        >
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
              🔍
            </span>
            <input
              type="text"
              placeholder='Try "react developer" or "AI engineer"…'
              value={inputValue}
              onChange={handleInputChange}
              className="input input-bordered w-full pl-9 pr-10"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Quick suggestions */}
        {!inputValue && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-2xl mx-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="badge bg-base-100 capitalize outline-base-200 hover:badge-primary cursor-pointer transition-colors text-xs py-3 px-3"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
<div className="top-0 mx-2 sm:mx-6 lg:mx-50 py-2 rounded-lg z-20 bg-base-300 border-b border-base-300 backdrop-blur">

<div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">

  {/* Filter Header */}
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    {/* Left */}
    <div>
      <h2 className="font-bold text-lg ml-2 sm:ml-10">
        Filters
      </h2>

      <p className="text-sm text-base-content/50 ml-2 sm:ml-10">
        Narrow developers by role and availability
      </p>
    </div>

    {/* Active Filter Pills */}
    <div className="flex flex-wrap gap-2">

      {role !== "all" && (
        <div className="badge badge-primary font-semibold badge-md gap-2 px-4 py-3">
           {
            ROLE_FILTERS.find(
              (f) => f.value === role
            )?.label
          }

          <button
            onClick={() =>
              handleRoleChange("all")
            }
          >
            ✕
          </button>
        </div>
      )}

      {availability !== "all" && (
        <div className="badge badge-primary badge-md font-semibold gap-2 px-4 py-3">
          
          {
            AVAILABILITY_FILTERS.find(
              (f) =>
                f.value === availability
            )?.label
          }

          <button
            onClick={() =>
              handleAvailChange("all")
            }
          >
            ✕
          </button>
        </div>
      )}

      {(role !== "all" ||
        availability !== "all") && (
        <div className="">
          <button
            className="btn btn-ghost btn-md rounded-md pb-4"
            onClick={() => {
              handleRoleChange("all");
              handleAvailChange("all");
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Filters Grid */}
  <div className="grid mx-2 sm:mx-10 grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

    {/* Role Filters */}
    <div className="bg-base-100 rounded-3xl p-4 border border-base-300 shadow-sm">

      <div className="flex items-center gap-2 mb-4 ml-2 mt-1">
        <h3 className="font-semibold">
          Developer Roles
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">

        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() =>
              handleRoleChange(f.value)
            }
            className={`btn btn-sm rounded-2xl ${
              role === f.value
                ? "btn-primary"
                : "btn-ghost border border-base-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>

    {/* Availability Filters */}
    <div className="bg-base-100 rounded-3xl p-4 border border-base-300 shadow-sm">

      <div className="flex items-center gap-2 mb-4">

        <h3 className="font-semibold ml-2 mt-1">
          Availability
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">

        {AVAILABILITY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() =>
              handleAvailChange(f.value)
            }
            className={`btn btn-sm rounded-2xl ${
              availability === f.value
                ? "btn-primary"
                : "btn-ghost border border-base-300"
            }`}
          >
             {f.label}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
</div>

      {/* ── Results area ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-2 sm:mx-6 lg:mx-50 bg-base-300 mt-10 rounded-xl px-3 sm:px-8 py-6">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="alert alert-error max-w-lg mx-auto mt-8">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Empty state — no search yet */}
        {!loading && !error && !hasActiveSearch && (
          <div className="text-center py-20 text-base-content/40">
            <div className="text-6xl mb-4">🔭</div>
            <p className="text-lg font-medium">Search for developers</p>
            <p className="text-sm mt-1">
              Use the bar above or click a suggestion to get started
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasActiveSearch && results.length === 0 && (
          <div className="text-center py-20 text-base-content/40">
            <div className="text-6xl mb-4">🤷</div>
            <p className="text-lg font-medium">No developers found</p>
            <p className="text-sm mt-1">
              Try a different keyword, role, or availability filter
            </p>
            <button
              className="btn btn-outline btn-sm mt-4"
              onClick={handleClear}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Results header */}
        {!loading && results.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-base-content/50">
              {total} developer{total !== 1 ? "s" : ""} found
              {inputValue && (
                <span className="ml-1">
                  for <span className="text-primary font-medium">"{inputValue}"</span>
                </span>
              )}
            </p>
            <button
              className="btn btn-ghost btn-xs text-base-content/40"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((user) => (
              <SearchDeveloperCard
                key={user._id}
                user={user}
                highlight={inputValue}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mt-10">
            <button
              className="btn btn-sm btn-ghost"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 2
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="btn btn-sm btn-disabled btn-ghost">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              className="btn btn-sm btn-ghost"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}