import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const TYPE_META = {
  "hackathon": { badge: "badge-primary",   icon: "", label: "Hackathon" },
  "startup": { badge: "badge-primary",  icon: "", label: "Startup" },
  "company hiring": { badge: "badge-primary",    icon: "", label: "Company Hiring" },
  "open source": { badge: "badge-primary",       icon: "", label: "Open Source" },
  "freelance":  { badge: "badge-primary",    icon: "", label: "Freelance" },
};

const DEFAULT_AVATAR =
  "https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg?w=768";

function Row({ label, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-base-content/40 w-28 shrink-0 mt-0.5 uppercase tracking-wide font-semibold">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body gap-4">
        <h2 className="card-title text-base">
          {icon && <span>{icon}</span>} {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [profileData,  setProfileData]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_URL}/user/${userId}/profile`, {
          withCredentials: true,
        });
        setProfileData(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/40 text-sm">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 py-16">
        <div className="text-5xl">😕</div>
        <p className="text-error font-semibold">{error}</p>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!profileData) return null;

  const { user, opportunities = [] } = profileData;

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

  const fullName = `${firstName} ${lastName}`.trim();

  // Resolve displayed preferred roles — fall back to ["any"] if nothing set
  const displayedPreferredRoles =
    preferredRoles.length > 0 ? preferredRoles : ["any"];

  // Roles this user actually plays (their own identity), filter "any"
  const ownRoles = lookingFor.filter((r) => r !== "any");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">

      <button
        className="btn btn-primary btn-md self-start"
        onClick={() => navigate(-1)}
      >
         Back
      </button>

      {/* Header Card */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body items-center text-center gap-3">
          <div className="avatar">
            <div className="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={photoUrl || DEFAULT_AVATAR}
                alt={fullName}
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{fullName}</h1>
            {(age || gender) && (
              <p className="text-sm text-base-content/50 mt-0.5">
                {[age && `${age} yrs`, gender].filter(Boolean).join(" · ")}
              </p>
            )}
            {experienceLevel && (
              <span className="badge badge-primary badge-lg mt-1 font-semibold capitalize">
                {experienceLevel}
              </span>
            )}
          </div>

          {about && (
            <p className="text-sm text-base-content/70 max-w-md leading-relaxed">
              {about}
            </p>
          )}
        </div>
      </div>

      {/* Tech Profile */}
      <Section title="Tech Profile">
        {skills.length > 0 && (
          <Row label="Skills">
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="badge badge-primary badge-sm capitalize font-medium">
                  {s}
                </span>
              ))}
            </div>
          </Row>
        )}

        {/* My Role — what role this user identifies as / offers */}
        <Row label="My Role">
          <div className="flex flex-wrap gap-1.5">
            {ownRoles.length > 0
              ? ownRoles.map((r) => (
                  <span key={r} className="badge badge-primary badge-sm font-semibold capitalize">
                    {r}
                  </span>
                ))
              : <span className="text-sm text-base-content/40">—</span>
            }
          </div>
        </Row>

        {!skills.length && !ownRoles.length && (
          <p className="text-sm text-base-content/40">No tech details shared yet.</p>
        )}
      </Section>

      {/* Availability & Goals */}
      <Section title="Availability & Goals">
        {availability && (
          <Row label="Availability">
            <span className="badge badge-primary badge-sm font-semibold capitalize">{availability}</span>
          </Row>
        )}

        {timezone && (
          <Row label="Timezone">
            <span className="badge badge-primary badge-sm font-semibold capitalize">{timezone}</span>
          </Row>
        )}

        {goals.length > 0 && (
          <Row label="Goals">
            <div className="flex flex-wrap gap-1.5">
              {goals.map((g) => (
                <span key={g} className="badge badge-primary badge-sm font-semibold capitalize">
                  {g}
                </span>
              ))}
            </div>
          </Row>
        )}

        {(hackathonInterest || startupInterest) && (
          <Row label="Interests">
            <div className="flex gap-2 flex-wrap">
              {hackathonInterest && (
                <span className="badge badge-primary badge-sm font-semibold capitalize">Hackathons</span>
              )}
              {startupInterest && (
                <span className="badge badge-primary badge-sm font-semibold capitalize">Startups</span>
              )}
            </div>
          </Row>
        )}

        {!availability && !goals.length && !hackathonInterest && !startupInterest && (
          <p className="text-sm text-base-content/40">No availability info shared yet.</p>
        )}
      </Section>

      {/* Looking For (desired developer preferences) */}
      <Section title="Looking For">
        <Row label="Role">
          <div className="flex flex-wrap gap-1.5">
            {displayedPreferredRoles.map((r) => (
              <span key={r} className="badge badge-primary badge-sm font-semibold capitalize">
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
            <div className="flex flex-wrap gap-1.5">
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
            <div className="flex flex-wrap gap-1.5">
              {preferredInterests.map((i) => (
                <span key={i} className="badge badge-primary badge-sm capitalize font-semibold">
                  {i}
                </span>
              ))}
            </div>
          </Row>
        )}
      </Section>

      {/* Projects & Learning */}
      {(learningGoals.length > 0 || projectIdeas.length > 0) && (
        <Section title="Projects & Learning">
          {learningGoals.length > 0 && (
            <Row label="Learning">
              <div className="flex flex-wrap gap-1.5">
                {learningGoals.map((g) => (
                  <span key={g} className="badge outline outline-primary badge-sm">{g}</span>
                ))}
              </div>
            </Row>
          )}

          {projectIdeas.length > 0 && (
            <Row label="Ideas">
              <ul className="text-sm text-base-content/70 list-disc list-inside space-y-1">
                {projectIdeas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </Row>
          )}
        </Section>
      )}

      {/* Posted Opportunities */}
      <Section title="Posted Opportunities">
        {opportunities.length === 0 ? (
          <p className="text-sm text-base-content/40 text-center py-4">
            {firstName} hasn't posted any opportunities yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {opportunities.map((opp) => {
              const meta = TYPE_META[opp.eventType] || {
                badge: "badge-ghost", label: opp.eventType,
              };
              return (
                <div
                  key={opp._id}
                  className="p-4 bg-base-100 rounded-xl border border-base-300 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${meta.badge} badge-sm capitalize gap-1`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-base-content/30">
                      {timeAgo(opp.createdAt)}
                    </span>
                  </div>

                  <p className="font-semibold text-sm leading-snug mb-1">{opp.title}</p>
                  <p className="text-xs text-base-content/60 line-clamp-2 mb-2">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50 mb-2">
                    {opp.location && <span>📍 {opp.location}</span>}
                    {opp.duration  && <span>⏱ {opp.duration}</span>}
                    {opp.level     && <span>📊 {opp.level}</span>}
                    {opp.teamSize  && <span>👥 Team of {opp.teamSize}</span>}
                  </div>

                  {opp.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {opp.techStack.map((t) => (
                        <span key={t} className="badge badge-ghost badge-xs">{t}</span>
                      ))}
                    </div>
                  )}

                  {opp.rolesNeeded?.length > 0 && (
                    <p className="text-xs text-base-content/50">
                      Roles: {opp.rolesNeeded.join(", ")}
                    </p>
                  )}

                  {opp.applyLink && (
                    <a
                      href={opp.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-xs mt-3 w-full"
                    >
                      Apply / Learn More ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}