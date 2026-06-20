import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { setMyOpportunities, removeOpportunityFromStore } from "../utils/opportunitySlice";
import { addUser } from "../utils/userSlice";


const TYPE_META = {
  "hackathon":{ badge: "badge-primary",icon: "" },
  "startup": { badge: "badge-primary",icon: "" },
  "company hiring":{ badge: "badge-primary",icon: "" },
  "open source": { badge: "badge-primary", icon: "" },
  "freelance": { badge: "badge-primary", icon: "" },
};

function Row({ label, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-base-content/40 w-24 shrink-0 mt-0.5 uppercase tracking-wide font-semibold">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const { myList: myOpportunities } = useSelector((store) => store.opportunity);

  const [loadingOpps, setLoadingOpps] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoToast, setPhotoToast ] = useState(null);

  useEffect(() => {
    const fetchMyOpportunities = async () => {
      setLoadingOpps(true);
      try {
        const res = await axios.get(`${BASE_URL}/collab/my-opportunities`, {
          withCredentials: true,
        });
        dispatch(setMyOpportunities(res.data.data));
      } catch (err) {
        console.error("Failed to fetch my opportunities:", err.message);
      } finally {
        setLoadingOpps(false);
      }
    };

    fetchMyOpportunities();
  }, []);

  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await axios.post(`${BASE_URL}/upload/profile-photo`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(addUser({ ...user, photoUrl: res.data.photoUrl }));
      setPhotoToast({ type: "success", msg: "Profile photo updated!" });
    } catch (err) {
      setPhotoToast({
        type: "error",
        msg: err?.response?.data?.message || "Photo upload failed",
      });
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setPhotoToast(null), 3000);
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (!window.confirm("Delete this opportunity?")) return;
    try {
      await axios.delete(`${BASE_URL}/collab/opportunity/${id}`, {
        withCredentials: true,
      });
      dispatch(removeOpportunityFromStore(id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  if (!user) return null;

  const {
    firstName, lastName, photoUrl, about, age, gender,
    skills = [], lookingFor = [], goals = [],
    availability, experienceLevel, timezone,
    hackathonInterest, startupInterest,
    learningGoals = [], projectIdeas = [],
    // desired developer preferences
    preferredRoles = [], preferredTimezones = [],
    preferredInterests = [], preferredExperienceLevel,
    preferredAvailability,
  } = user;

  // Resolve displayed preferred roles — fall back to ["any"] if nothing set
  const displayedPreferredRoles =
    preferredRoles.length > 0 ? preferredRoles : ["any"];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-6">

      {/* Toast */}
      {photoToast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert alert-${photoToast.type}`}>
            <span>{photoToast.msg}</span>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-md self-start"
        onClick={() => navigate(-1)}
      >
         Back
      </button>

      {/* ── Header Card ──────────────────────────────────────── */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body items-center justify-center mx-auto text-center gap-3">

          <img src={photoUrl}
          className="rounded-full w-30"/>

          <div>
            <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
            {(age || gender) && (
              <p className="text-sm text-base-content/50">
                {[age && `${age} yrs`, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {about && (
            <p className="text-sm text-base-content/70 max-w-sm">{about}</p>
          )}

          <Link to="/profile/edit" className="btn btn-primary btn-sm mt-1">
             Edit your Profile
          </Link>
        </div>
      </div>

      {/* ── Tech Profile ─────────────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Tech Profile</h2>

          {experienceLevel && (
            <Row label="Experience">
              <span className="badge badge-primary badge-sm capitalize font-semibold">
                {experienceLevel}
              </span>
            </Row>
          )}

          {skills.length > 0 && (
            <Row label="Skills">
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s} className="badge badge-primary badge-sm capitalize font-semibold">{s}</span>
                ))}
              </div>
            </Row>
          )}

          {/* My Role — what role this user identifies as / offers */}
          <Row label="My Role">
            <div className="flex flex-wrap gap-1">
              {lookingFor.filter((r) => r !== "any").length > 0
                ? lookingFor.map((r) => (
                    <span key={r} className="badge badge-primary badge-sm capitalize font-semibold">
                      {r}
                    </span>
                  ))
                : <span className="text-sm text-base-content/40">—</span>
              }
            </div>
          </Row>
        </div>
      </div>

      {/* ── Availability & Goals ─────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Availability & Goals</h2>

          {availability && (
            <Row label="Availability">
              <span className="badge badge-primary badge-sm font-semibold capitalize">{availability}</span>
            </Row>
          )}

          {timezone && (
            <Row label="Timezone">
              <span className="badge badge-primary badge-sm font-semibold text-base-content/70">{timezone}</span>
            </Row>
          )}

          {goals.length > 0 && (
            <Row label="Goals">
              <div className="flex flex-wrap gap-1">
                {goals.map((g) => (
                  <span key={g} className="badge badge-primary badge-sm font-semibold capitalize">{g}</span>
                ))}
              </div>
            </Row>
          )}

          <Row label="Interests">
            <div className="flex gap-2 flex-wrap">
              {hackathonInterest && (
                <span className="badge badge-primary badge-sm font-semibold">Hackathons</span>
              )}
              {startupInterest && (
                <span className="badge badge-primary badge-sm font-semibold">Startups</span>
              )}
              {!hackathonInterest && !startupInterest && (
                <span className="text-sm text-base-content/40">—</span>
              )}
            </div>
          </Row>
        </div>
      </div>

      {/* ── Looking For (desired developer) ──────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Looking For</h2>

          <Row label="Role">
            <div className="flex flex-wrap gap-1">
              {displayedPreferredRoles.map((r) => (
                <span key={r} className="badge badge-primary badge-sm capitalize font-semibold">
                  {r}
                </span>
              ))}
            </div>
          </Row>

          {preferredExperienceLevel && (
            <Row label="Experience">
              <span className="badge badge-primary badge-sm capitalize font-semibold">
                {preferredExperienceLevel}
              </span>
            </Row>
          )}

          {preferredAvailability && (
            <Row label="Availability">
              <span className="badge badge-primary badge-sm capitalize font-semibold">
                {preferredAvailability}
              </span>
            </Row>
          )}

          {preferredTimezones.length > 0 && (
            <Row label="Timezone">
              <div className="flex flex-wrap gap-1">
                {preferredTimezones.map((tz) => (
                  <span key={tz} className="badge badge-primary badge-sm font-semibold">
                    {tz}
                  </span>
                ))}
              </div>
            </Row>
          )}

          {preferredInterests.length > 0 && (
            <Row label="Interests">
              <div className="flex flex-wrap gap-1">
                {preferredInterests.map((i) => (
                  <span key={i} className="badge badge-primary badge-sm capitalize font-semibold">
                    {i}
                  </span>
                ))}
              </div>
            </Row>
          )}
        </div>
      </div>

      {/* ── Projects & Learning ──────────────────────────────── */}
      {(learningGoals.length > 0 || projectIdeas.length > 0) && (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body gap-4">
            <h2 className="card-title text-base">Projects & Learning</h2>

            {learningGoals.length > 0 && (
              <Row label="Learning">
                <div className="flex flex-wrap gap-1">
                  {learningGoals.map((g) => (
                    <span key={g} className="badge outline outline-primary badge-sm">{g}</span>
                  ))}
                </div>
              </Row>
            )}

            {projectIdeas.length > 0 && (
              <Row label="Ideas">
                <ul className="text-sm text-base-content/70 list-disc list-inside space-y-0.5">
                  {projectIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </Row>
            )}
          </div>
        </div>
      )}

      {/* ── My Opportunities ─────────────────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h2 className="card-title text-base">My Opportunities</h2>
            <Link to="/collab" className="btn btn-ghost btn-xs">
              + List New
            </Link>
          </div>

          {loadingOpps && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm text-primary" />
            </div>
          )}

          {!loadingOpps && myOpportunities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-base-content/40">
                You haven't listed any opportunities yet.
              </p>
              <Link to="/collab" className="btn btn-primary btn-sm mt-3">
                Go to Collab Hub
              </Link>
            </div>
          )}

          {!loadingOpps && myOpportunities.length > 0 && (
            <div className="flex flex-col gap-3">
              {myOpportunities.map((opp) => {
                const meta = TYPE_META[opp.eventType] || { badge: "badge-ghost", icon: "📌" };
                return (
                  <div
                    key={opp._id}
                    className="flex items-start justify-between gap-3 p-3 bg-base-100 rounded-xl"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${meta.badge} badge-sm capitalize`}>
                          {meta.icon} {opp.eventType}
                        </span>
                        {!opp.isActive && (
                          <span className="badge badge-ghost badge-sm">Inactive</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-1">
                        {opp.title}
                      </p>
                      <p className="text-xs text-base-content/40">
                        📍 {opp.location}
                        {opp.duration ? ` · ⏱ ${opp.duration}` : ""}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate("/collab")}
                        title="Edit in Collab Hub"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDeleteOpportunity(opp._id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}