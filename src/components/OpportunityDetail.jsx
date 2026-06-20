import { useEffect, useRef } from "react";

export default function OpportunityDetails({ opportunity, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  if (!opportunity) return null;

  const {
    title,
    description,
    eventType,
    location,
    duration,
    level,
    teamSize,
    techStack = [],
    rolesNeeded = [],
    applyLink,
    postedBy,
    createdAt,
  } = opportunity;

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold leading-tight">
              {title}
            </h2>

            <div className="flex flex-wrap gap-2 mt-3">
              {eventType && (
                <span className="badge badge-primary capitalize font-semibold">
                  {eventType}
                </span>
              )}

              {level && (
                <span className="badge badge-primary capitalize font-semibold">
                  {level}
                </span>
              )}

              {location && (
                <span className="badge badge-outline font-semibold">
                  📍 {location}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">
            About this opportunity
          </h3>

          <p className="text-base-content/80 whitespace-pre-wrap leading-relaxed">
            {description}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {duration && (
            <div className="bg-base-200 rounded-xl p-4">
              <p className="text-xs text-base-content/50 uppercase font-semibold">
                Duration
              </p>
              <p className="font-medium mt-1">{duration}</p>
            </div>
          )}

          {teamSize && (
            <div className="bg-base-200 rounded-xl p-4">
              <p className="text-xs text-base-content/50 uppercase font-semibold">
                Team Size
              </p>
              <p className="font-medium mt-1">{teamSize} members</p>
            </div>
          )}
        </div>

        {/* Roles Needed */}
        {rolesNeeded.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Roles Needed
            </h3>

            <div className="flex flex-wrap gap-2">
              {rolesNeeded.map((role) => (
                <span
                  key={role}
                  className="badge badge-primary badge-outline capitalize"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Tech Stack
            </h3>

            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="badge badge-primary capitalize"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posted By */}
        {postedBy && (
          <div className="bg-base-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-4">

              <img
                src={
                  postedBy.photoUrl ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                }
                alt={postedBy.firstName}
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>
                <h4 className="font-semibold text-lg">
                  {postedBy.firstName} {postedBy.lastName}
                </h4>

                <p className="text-sm text-base-content/50 capitalize">
                  {postedBy.experienceLevel || "developer"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-base-300 pt-5">

          <p className="text-xs text-base-content/40">
            Posted{" "}
            {createdAt
              ? new Date(createdAt).toLocaleDateString()
              : ""}
          </p>

          <div className="flex gap-2">

            {applyLink && (
              <a
                href={applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Apply Now ↗
              </a>
            )}

            <button
              onClick={onClose}
              className="btn btn-ghost"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}