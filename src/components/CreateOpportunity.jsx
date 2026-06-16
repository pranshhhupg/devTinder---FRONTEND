import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPES  = ["hackathon", "startup", "company hiring", "open source", "freelance"];
const LEVELS = ["beginner", "intermediate", "expert", "any"];

const ROLE_OPTIONS = [
  "frontend dev", "backend dev", "full stack", "ml engineer",
  "ai engineer", "prompt engineer", "data scientist", "data analyst",
  "designer", "product manager", "devops", "mobile dev", "qa engineer",
  "blockchain dev", "consultant",
];

const TECH_SUGGESTIONS = [
  "React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Java", "Spring",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL",
  "Docker", "Kubernetes", "AWS", "Flutter", "Kotlin", "Swift",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
  "LLM", "GPT", "OpenAI", "Gemini", "Claude", "Anthropic", "HuggingFace",
  "Prompt Engineering", "RAG", "Vector DB", "Pinecone", "LangChain",
  "LangGraph", "LlamaIndex", "Agents", "CrewAI", "AutoGen", "Fine-tuning",
  "MLflow", "Airflow", "NLP", "Computer Vision", "Pandas", "Tableau",
  "Selenium", "Cypress", "Solidity", "Web3", "Excel",
];

const EMPTY_FORM = {
  title: "", description: "", eventType: "hackathon", location: "",
  duration: "", techStack: [], teamSize: "", level: "any",
  rolesNeeded: [], applyLink: "",
};

// ── Local TagInput ─────────────────────────────────────────────────────────────
// (self-contained so CreateOpportunity has no external component deps)
function TagInput({ label, placeholder, values, onChange, suggestions = [] }) {
  const [input, setInput] = useState("");
  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !values.map((v) => v.toLowerCase()).includes(s.toLowerCase())
  );

  const add = (val) => {
    const v = val.trim();
    if (v && !values.map((x) => x.toLowerCase()).includes(v.toLowerCase()))
      onChange([...values, v]);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="label-text font-medium text-sm">{label}</span>
      <div className="flex flex-wrap gap-1 min-h-6">
        {values.map((v) => (
          <span key={v} className="badge badge-primary badge-sm gap-1">
            {v}
            <button
              type="button"
              className="font-bold leading-none"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className="input input-bordered input-sm w-full"
        />
        {input && filtered.length > 0 && (
          <ul className="absolute z-30 bg-base-100 border border-base-300 rounded-box w-full mt-1 max-h-36 overflow-y-auto shadow-xl">
            {filtered.slice(0, 6).map((s) => (
              <li
                key={s}
                className="px-3 py-1.5 text-sm hover:bg-base-200 cursor-pointer"
                onMouseDown={() => add(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[10px] text-base-content/40">Press Enter or comma to add</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateOpportunity({ editData, onClose, onSuccess }) {
  const dialogRef = useRef(null);
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const isEdit = Boolean(editData);

  // Pre-fill in edit mode, reset in create mode
  useEffect(() => {
    setForm(
      isEdit
        ? {
            title: editData.title ?? "",
            description: editData.description ?? "",
            eventType: editData.eventType   ?? "hackathon",
            location: editData.location    ?? "",
            duration: editData.duration    ?? "",
            techStack: editData.techStack   ?? [],
            teamSize: editData.teamSize    ?? "",
            level: editData.level       ?? "any",
            rolesNeeded: editData.rolesNeeded ?? [],
            applyLink: editData.applyLink   ?? "",
          }
        : EMPTY_FORM
    );
    setError("");
  }, [editData]);

  // Open the native <dialog> as a modal
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleRole = (role) => {
    set(
      "rolesNeeded",
      form.rolesNeeded.includes(role)
        ? form.rolesNeeded.filter((r) => r !== role)
        : [...form.rolesNeeded, role]
    );
  };

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Title is required");
    if (form.title.trim().length < 5) return setError("Title must be at least 5 characters");
    if (!form.description.trim())  return setError("Description is required");
    if (form.description.trim().length < 20) return setError("Description must be at least 20 characters");
    if (!form.eventType) return setError("Type is required");
    if (!form.location.trim()) return setError("Location is required");

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      teamSize: form.teamSize ? parseInt(form.teamSize) : undefined,
    };

    setSaving(true);
    try {
      const url = isEdit
        ? `${BASE_URL}/collab/opportunity/${editData._id}`
        : `${BASE_URL}/collab/opportunity`;

      const res = await axios({
        method: isEdit ? "put" : "post",
        url,
        data: payload,
        withCredentials: true,
      });

      onSuccess(res.data.data, isEdit);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal backdrop-blur-sm"
      onClose={onClose}
    >
      <div className="modal-box w-11/12 max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-xl border border-base-300 shadow-2xl bg-base-100">
  
        {/* Header */}
        <div className="sticky top-0 z-20 bg-base-100/90 backdrop-blur-md border-b border-base-300 px-7 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-3xl">
              {isEdit ? "Edit Opportunity" : "Create Opportunity"}
            </h3>
  
            <p className="text-sm text-base-content/60 mt-1">
              Find developers, teammates, co-founders, and collaborators
            </p>
          </div>
  
          <button
            className="btn btn-sm btn-circle btn-ghost hover:bg-red-700 hover:text-white"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
  
        {/* Body */}
        <div className="p-7 flex flex-col gap-7">
  
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-base">
                Opportunity Title
              </span>
  
              <span className="label-text-alt text-base-content/40">
                {form.title.length}/100
              </span>
            </label>
  
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Looking for frontend dev for AI SaaS startup..."
              className="input input-bordered w-full rounded-lg h-14 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              maxLength={100}
            />
          </div>
  
          {/* Type + Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Opportunity Type
                </span>
              </label>
  
              <select
                value={form.eventType}
                onChange={(e) => set("eventType", e.target.value)}
                className="select select-bordered rounded-lg h-14 capitalize"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Experience Level
                </span>
              </label>
  
              <select
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                className="select select-bordered rounded-lg h-14 capitalize"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Location + Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Location
                </span>
              </label>
  
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Remote / Delhi / Bangalore"
                className="input input-bordered rounded-lg h-14"
              />
            </div>
  
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Duration
                </span>
              </label>
  
              <input
                type="text"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="48 hours / 2 months"
                className="input input-bordered rounded-lg h-14"
              />
            </div>
          </div>
  
          {/* Team Size */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Team Size
              </span>
            </label>
  
            <input
              type="number"
              value={form.teamSize}
              onChange={(e) => set("teamSize", e.target.value)}
              placeholder="Total members including you"
              className="input input-bordered rounded-lg ml-4 h-14"
              min={1}
              max={100}
            />
          </div>
  
          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Description
              </span>
  
              <span className="label-text-alt text-base-content/40">
                {form.description.length}/1000
              </span>
            </label>
  
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Explain the project, goals, expectations, timeline, and who you're looking for..."
              className="textarea textarea-bordered rounded-lg w-full resize-none min-h-[160px] text-base leading-relaxed"
              maxLength={1000}
            />
          </div>
  
          {/* Tech Stack */}
          <div className="bg-base-200 rounded-lg p-3 border border-base-300">
            <TagInput
              label="Tech Stack"
              placeholder="React, Node.js, MongoDB..."
              values={form.techStack}
              onChange={(v) => set("techStack", v)}
              suggestions={TECH_SUGGESTIONS}
            />
          </div>
  
          {/* Roles Needed */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Roles Needed
              </span>
            </label>
  
            <div className="flex flex-wrap gap-3 mt-1">
              {ROLE_OPTIONS.map((role) => {
                const selected = form.rolesNeeded.includes(role);
  
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`
                      px-5 py-3 rounded-lg border text-sm transition-all duration-300 capitalize font-medium
                      ${
                        selected
                          ? "bg-primary text-primary-content border-primary scale-105 shadow-lg"
                          : "bg-base-200 border-base-300 hover:border-primary hover:cursor-pointer hover:scale-105"
                      }
                    `}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
  
          {/* Apply Link */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Apply Link
              </span>
            </label>
  
            <input
              type="url"
              value={form.applyLink}
              onChange={(e) => set("applyLink", e.target.value)}
              placeholder="https://devfolio.co/..."
              className="input input-bordered rounded-lg ml-2 h-14"
            />
          </div>
  
          {/* Error */}
          {error && (
            <div className="alert rounded-lg bg-red-700 shadow-md">
              <span>{error}</span>
            </div>
          )}
  
          {/* Footer */}
          <div className="sticky bottom-0 bg-base-100 pt-3">
            <button
              className={`
                btn btn-primary w-full h-14 rounded-lg text-base font-bold
                shadow-lg hover:scale-[1.01] transition-all
                ${saving ? "loading" : ""}
              `}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                ? "Update Opportunity"
                : "Post Opportunity"}
            </button>
          </div>
        </div>
      </div>
  
      {/* Backdrop */}
      <div
        className="modal-backdrop bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
    </dialog>
  );
}