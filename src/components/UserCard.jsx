import axios from "axios";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { BASE_URL } from "../utils/constants";
import MatchBadge from "./MatchBadge";

/**
 * Receives a full feed item: { user, matchScore, matchReasons, matchBreakdown }
 */
export default function UserCard({ feedItem }) {
  const { user, matchScore, matchReasons, matchBreakdown , rawBreakdown} = feedItem;
  const dispatch = useDispatch();

  const { _id, firstName, lastName, photoUrl, about, age, gender, skills = [],
          experienceLevel, availability, lookingFor = [] } = user;

  const handleAction = async (status) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(_id));
    } catch (err) {
      console.error("Action failed:", err.message);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl w-80 sm:w-96">
      {/* Photo */}
      <figure className="relative">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-60 hover:h-96 object-cover transition-all duration-500 ease-in-out"
          onError={(e) => {
            e.target.src =
              "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
          }}
        />
        {/* Experience badge overlay */}
        {experienceLevel && (
          <span className="absolute top-2 right-2 badge badge-neutral capitalize text-xs">
            {experienceLevel}
          </span>
        )}
      </figure>

      <div className="card-body p-4 gap-2">
        {/* Name + meta */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="card-title text-base-content text-lg leading-tight">
              {firstName} {lastName}
            </h2>
            {(age || gender) && (
              <p className="text-xs text-base-content/50 mt-0.5">
                {[age && `${age}y`, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {availability && (
            <span className="badge badge-outline text-xs capitalize shrink-0">
              {availability}
            </span>
          )}
        </div>

        {/* About */}
        {about && (
          <p className="text-sm text-base-content/70 line-clamp-2">{about}</p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.slice(0, 5).map((skill) => (
              <span key={skill} className="badge badge-primary badge-sm text-xs font-medium">
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="badge badge-ghost badge-sm text-xs">
                +{skills.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Looking for */}
        {lookingFor.length > 0 && (
          <p className="text-xs text-base-content/50">
            Looking for:{" "}
            <span className="text-primary font-medium">
              {lookingFor.join(", ")}
            </span>
          </p>
        )}

        {/* Match Badge */}
        <MatchBadge
          score={matchScore}
          reasons={matchReasons}
          breakdown={matchBreakdown}
          rawBreakdown={rawBreakdown}
        />

        {/* Action buttons */}
        <div className="card-actions justify-between mt-2 gap-2">
          <button
            className="btn btn-error btn-sm flex-1"
            onClick={() => handleAction("ignored")}
          >
            ✕ Pass
          </button>
          <button
            className="btn btn-success btn-sm flex-1"
            onClick={() => handleAction("interested")}
          >
            ♥ Connect
          </button>
        </div>
      </div>
    </div>
  );
}