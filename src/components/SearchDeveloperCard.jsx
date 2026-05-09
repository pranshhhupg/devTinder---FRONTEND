import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

/**
 * SearchDeveloperCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays a developer in search results.
 * Props:
 *   user      – user object from /user/search
 *   highlight – search query string used to highlight matched skills
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function SearchDeveloperCard({ user, highlight = "" }) {
  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    about,
    skills          = [],
    lookingFor      = [],
    goals           = [],
    availability,
    experienceLevel,
    hackathonInterest,
    startupInterest,
  } = user;

  const [status, setStatus]   = useState("idle"); // idle | loading | connected | error
  const [errMsg, setErrMsg]   = useState("");

  // ── Highlight a skill if it partially matches the search query ─────────────
  const isHighlighted = (skill) => {
    if (!highlight.trim()) return false;
    return skill.toLowerCase().includes(highlight.toLowerCase());
  };

  // ── Send connection request ────────────────────────────────────────────────
  const handleConnect = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${_id}`,
        {},
        { withCredentials: true }
      );
      setStatus("connected");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to send request";
      setErrMsg(msg);
      setStatus("error");
    }
  };

  // ── Availability badge colour ──────────────────────────────────────────────
  const availBadge = {
    weekends:   "badge-info",
    evenings:   "badge-warning",
    "full-time":"badge-success",
    flexible:   "badge-ghost",
  }[availability] || "badge-ghost";

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">

      {/* ── Photo ── */}
      <figure className="relative">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-44 object-cover"
          onError={(e) => {
            e.target.src =
              "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768";
          }}
        />
        {/* Experience level overlay */}
        {experienceLevel && (
          <span className="absolute top-2 right-2 badge badge-neutral capitalize text-xs">
            {experienceLevel}
          </span>
        )}
        {/* Interest badges overlay */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {hackathonInterest && (
            <span className="badge badge-accent badge-sm text-xs">⚡ Hackathon</span>
          )}
          {startupInterest && (
            <span className="badge badge-secondary badge-sm text-xs">🚀 Startup</span>
          )}
        </div>
      </figure>

      {/* ── Body ── */}
      <div className="card-body p-4 gap-2">

        {/* Name + availability */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base leading-tight">
            {firstName} {lastName}
          </h2>
          {availability && (
            <span className={`badge ${availBadge} badge-sm shrink-0 capitalize text-xs`}>
              {availability}
            </span>
          )}
        </div>

        {/* About */}
        {about && (
          <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">
            {about}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className={`badge badge-sm text-xs font-medium ${
                  isHighlighted(skill)
                    ? "badge-primary ring-1 ring-primary"
                    : "badge-outline"
                }`}
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="badge badge-ghost badge-sm text-xs">
                +{skills.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <p className="text-xs text-base-content/50 mt-0.5">
            🎯{" "}
            <span className="text-base-content/70">
              {goals.slice(0, 2).join(", ")}
            </span>
          </p>
        )}

        {/* Looking for */}
        {lookingFor.length > 0 && lookingFor[0] !== "any" && (
          <p className="text-xs text-base-content/50">
            🤝{" "}
            <span className="text-primary font-medium capitalize">
              {lookingFor.join(", ")}
            </span>
          </p>
        )}

        {/* Error message */}
        {status === "error" && (
          <p className="text-xs text-error mt-1">{errMsg}</p>
        )}

        {/* Connect button */}
        <div className="card-actions mt-2">
          {status === "connected" ? (
            <button className="btn btn-success btn-sm w-full" disabled>
              ✓ Request Sent
            </button>
          ) : (
            <button
              className={`btn btn-primary btn-sm w-full ${
                status === "loading" ? "loading" : ""
              }`}
              onClick={handleConnect}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "♥ Connect"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}