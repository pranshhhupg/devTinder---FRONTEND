import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import ResumeParser from "./ResumeParser";
import ImageUploader from "./ImageUploader";
import BioAssistant from "./BioAssistant";

// ── Static option lists ────────────────────────────────────────────────────────

const SKILL_SUGGESTIONS = [
  ".NET", ".NET (dotnet)", "A/B Testing", "Accessibility", "Adobe XD",
  "Advisory", "Agentic AI", "Agents", "Agile", "Airflow", "Amazon ECS",
  "Amazon EKS", "Amazon SQS", "Amplitude", "Analytics", "Android", "Angular",
  "Ansible", "Ant Design", "Anthropic", "Apache", "Apache Spark", "API Design",
  "API Integration", "API Testing", "App Store Deployment", "Appium", "ArgoCD",
  "ASP.NET", "Astro", "Authentication", "Authorization", "AutoGen",
  "Automation Testing", "Avalanche", "AWS", "Axios", "Azure", "Babel", "Bash",
  "Blockchain Architecture", "Bootstrap", "Bug Tracking", "Business Analysis",
  "Business Intelligence", "Business Strategy", "C#", "Caching", "Cassandra",
  "CatBoost", "Chain of Thought", "Chain of Thought (CoT)", "Chakra UI",
  "ChromaDB", "CI/CD", "CircleCI", "Claude", "Client Management",
  "CloudFormation", "Computer Vision", "Consulting", "Context API", "CrewAI",
  "Cron Jobs", "CSS", "CSS3", "CUDA", "Cypress", "DAO", "Dart", "Dashboarding",
  "Data Analysis", "Data Cleaning", "Data Mining", "Data Visualization",
  "Datadog", "Deep Learning", "DeFi", "Design", "Design System", "Django",
  "Docker", "DynamoDB", "ELK Stack", "Embeddings", "ES6", "ES7", "Ethereum",
  "Ethers.js", "ETL", "Evaluation", "Event Driven Architecture",
  "Event-Driven Architecture", "Excel", "Expo", "Express", "FAISS", "FastAPI",
  "Fastify", "Feature Engineering", "Few-Shot Prompting", "Figma",
  "Financial Modeling", "Fine Tuning", "Fine-tuning", "Firebase", "Flask",
  "Flutter", "Framer", "Framer Motion", "Frontend Architecture", "Gatsby",
  "GCP", "Gemini", "Generative AI", "GitHub Actions", "GitLab CI", "Go",
  "Google Analytics", "Google Sheets", "GPT", "Grafana", "GraphQL", "gRPC",
  "Hadoop", "Hapi", "Hardhat", "Helm", "HTML", "HTML5", "HuggingFace",
  "Hypothesis Testing", "IaC (Infrastructure as Code)",
  "Information Architecture", "Integration Testing", "Interaction Design",
  "InVision", "Ionic", "iOS", "IPFS", "Java", "JavaScript", "JAX", "Jenkins",
  "Jest", "Jetpack Compose", "Jira", "jQuery", "JUnit", "Jupyter", "JWT",
  "Kafka", "Kanban", "Keras", "Kotlin", "Kubernetes", "Kubernetes (K8s)",
  "LangChain", "LangGraph", "Laravel", "Less", "LightGBM", "Linear", "Linux",
  "LlamaIndex", "LLM", "Load Testing", "Logging", "Looker", "Looker Studio",
  "LoRA", "Machine Learning", "Manual Testing", "Market Research",
  "Material UI", "Material UI (MUI)", "Matplotlib", "Microservices", "Milvus",
  "Mixpanel", "MLflow", "MLOps", "Mobile Architecture", "Mobile UI", "MobX",
  "Model Deployment", "MongoDB", "Mongoose", "Monitoring", "Motion Design",
  "Multi-Agent", "MySQL", "NestJS", "Next.js", "Next.js (Nextjs)", "NFT",
  "Nginx", "NLP", "Node.js", "Node.js (Nodejs)", "Notion", "NumPy", "Nuxt",
  "Nuxt.js", "OAuth", "OKRs", "ONNX", "OpenAI", "OpenCV", "Pandas", "Parcel",
  "Performance Testing", "PHP", "Pinecone", "Play Store Deployment",
  "Playwright", "Plotly", "Polygon", "PostgreSQL", "Postman", "Power BI",
  "PowerPoint", "Predictive Modeling", "Presentations", "Prioritization",
  "Prisma", "Probability", "Problem Solving", "Product Management",
  "Product Strategy", "Project Management", "Prometheus", "Prompt Engineering",
  "Prompt Optimization", "Prompt Testing", "Prototyping", "Pulumi", "PWA",
  "Python", "PyTorch", "QLoRA", "RabbitMQ", "RAG", "React", "React Native",
  "React Query", "Realm", "Recoil", "Redis", "Redux", "Regression Testing",
  "Reinforcement Learning", "Remix", "Reporting", "Requirement Gathering",
  "Responsive Design", "REST API", "Roadmap", "Ruby", "Ruby on Rails", "Rust",
  "Sass", "Scikit-learn", "Scikit-learn (sklearn)", "Scrum", "SCSS", "Seaborn",
  "Selenium", "SEO", "Sequelize", "Serverless", "shadcn/ui", "Shell Scripting",
  "Sketch", "Smart Contracts", "Solana", "Solidity", "SolidJS",
  "Speech Recognition", "Spring", "Spring Boot", "Sprint Planning", "SQL",
  "SQLite", "Stakeholder Management", "Statistics", "Storybook", "Strategy",
  "Supabase", "Supervised Learning", "Svelte", "Swagger", "Swift", "SwiftUI",
  "SWR", "Symfony", "System Design", "Tableau", "Tailwind CSS",
  "TanStack Query", "TensorFlow", "Terraform", "Test Cases", "Testing",
  "TestNG", "Tokenomics", "Transformers", "Trello", "Truffle", "TypeORM",
  "TypeScript", "Unit Testing", "Unsupervised Learning", "Usability Testing",
  "User Research", "User Stories", "Vector Database", "Vector DB",
  "Visual Design", "Vite", "Vitest", "Vue", "Weaviate", "Web Accessibility",
  "Web3", "Web3.js", "Webpack", "WebSocket", "Weights & Biases",
  "Weights & Biases (wandb)", "Wireframing", "Xamarin", "XGBoost", "Zeplin",
  "Zero-Shot Prompting", "Zustand",
];

const ROLE_OPTIONS = [
  { value: "frontend dev",    label: "Frontend Dev"    },
  { value: "backend dev",     label: "Backend Dev"     },
  { value: "full stack",      label: "Full Stack"      },
  { value: "ml engineer",     label: "ML Engineer"     },
  { value: "ai engineer",     label: "AI Engineer"     },
  { value: "prompt engineer", label: "Prompt Engineer" },
  { value: "data scientist",  label: "Data Scientist"  },
  { value: "data analyst",    label: "Data Analyst"    },
  { value: "designer",        label: "Designer"        },
  { value: "product manager", label: "Product Manager" },
  { value: "devops",          label: "DevOps"          },
  { value: "mobile dev",      label: "Mobile Dev"      },
  { value: "qa engineer",     label: "QA Engineer"     },
  { value: "blockchain dev",  label: "Blockchain Dev"  },
  { value: "consultant",      label: "Consultant"      },
  { value: "any",             label: "Anyone"          },
];

const GOALS_OPTIONS = [
  { value: "build a startup", label: "Build a Startup" },
  { value: "win hackathons",  label: "Win Hackathons"  },
  { value: "learn new tech",  label: "Learn New Tech"  },
  { value: "open source",     label: "Open Source"     },
  { value: "freelance",       label: "Freelance"       },
  { value: "get a job",       label: "Get a Job"       },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekends",  label: "Weekends"  },
  { value: "evenings",  label: "Evenings"  },
  { value: "full-time", label: "Full-Time" },
  { value: "flexible",  label: "Flexible"  },
];

const AVAILABILITY_OPTIONS_WITH_ANY = [
  { value: "any",       label: "Any"       },
  ...AVAILABILITY_OPTIONS,
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner",     label: "Beginner (< 1 yr)"     },
  { value: "intermediate", label: "Intermediate (1–3 yrs)" },
  { value: "advanced",     label: "Advanced (3+ yrs)"      },
];

const EXPERIENCE_OPTIONS_WITH_ANY = [
  { value: "any",          label: "Any Level"              },
  ...EXPERIENCE_OPTIONS,
];

const INTEREST_OPTIONS = [
  { value: "open source", label: "Open Source"   },
  { value: "hackathons",  label: "Hackathons"    },
  { value: "startups",    label: "Startups"      },
  { value: "freelance",   label: "Freelance"     },
  { value: "learning",    label: "Learning"      },
  { value: "research",    label: "Research"      },
];

const COMMON_TIMEZONES = [
  "Asia/Kolkata", "Asia/Tokyo", "Asia/Singapore", "Asia/Dubai",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Australia/Sydney", "Pacific/Auckland",
];

// ── Helper: tag input ─────────────────────────────────────────────────────────

function TagInput({ label, placeholder, values, onChange, suggestions = [] }) {
  const [input, setInput] = useState("");
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  );

  const add = (val) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };
  const remove = (val) => onChange(values.filter((v) => v !== val));

  return (
    <div className="flex flex-col gap-1">
      <label className="label-text font-medium">{label}</label>
      <div className="flex flex-wrap gap-1 min-h-8">
        {values.map((v) => (
          <span key={v} className="badge badge-primary gap-1">
            {v}
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-primary-content/60 hover:text-primary-content font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-1">
          <input
            type="text"
            inputMode="text"
            enterKeyHint="done"
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              if (val.endsWith(",") || val.endsWith("\n")) {
                add(val.replace(/[,\n]+$/, ""));
              } else {
                setInput(val);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.keyCode === 13 || e.key === ",") {
                e.preventDefault();
                add(input);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.keyCode === 13) {
                e.preventDefault();
                add(input);
              }
            }}
            placeholder={placeholder}
            className="input input-bordered input-sm flex-1"
          />
          <button
            type="button"
            onClick={() => add(input)}
            className="btn btn-primary btn-sm px-3"
          >
            +
          </button>
        </div>
        {input && filtered.length > 0 && (
          <ul className="absolute z-10 bg-base-100 border border-base-300 rounded-box w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
            {filtered.slice(0, 6).map((s) => (
              <li
                key={s}
                className="px-3 py-1.5 text-sm hover:bg-base-200 cursor-pointer"
                onMouseDown={() => add(s)}
                onTouchEnd={(e) => { e.preventDefault(); add(s); }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-base-content/40">Type and press + or Enter to add · comma also works</p>
    </div>
  );
}

// ── Helper: badge multi-select ────────────────────────────────────────────────

function BadgeMultiSelect({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => (
        <label
          key={value}
          className={`badge cursor-pointer select-none transition-all ${
            selected.includes(value)
              ? "badge-primary"
              : "outline outline-primary hover:badge-primary"
          }`}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

// ── Helper: radio group ───────────────────────────────────────────────────────

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map(({ value: v, label }) => (
        <label key={v} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="radio radio-primary radio-sm"
          />
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>
  );
}

// ── Helper: section header ────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-1">
      <h2 className="font-semibold text-base-content/70 text-md uppercase tracking-wider flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="text-xs text-base-content/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EditProfile() {
  const user     = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // ── basic ──
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    photoUrl:  user?.photoUrl  || "",
    age:       user?.age       || "",
    gender:    user?.gender    || "",
    about:     user?.about     || "",
    // ── my tech profile ──
    skills:           user?.skills           || [],
    experienceLevel:  user?.experienceLevel  || "intermediate",
    // ── my looking for (what I want to be found for / what I seek by role) ──
    lookingFor:       user?.lookingFor       || ["any"],
    // ── my own preferences / goals ──
    goals:            user?.goals            || [],
    availability:     user?.availability     || "flexible",
    timezone:         user?.timezone         || "Asia/Kolkata",
    hackathonInterest: user?.hackathonInterest || false,
    startupInterest:   user?.startupInterest   || false,
    learningGoals:    user?.learningGoals    || [],
    projectIdeas:     user?.projectIdeas     || [],
    // ── desired developer preferences (NEW) ──
    preferredRoles:           user?.preferredRoles           || ["any"],
    preferredTimezones:       user?.preferredTimezones       || [],
    preferredInterests:       user?.preferredInterests       || [],
    preferredExperienceLevel: user?.preferredExperienceLevel || "any",
    preferredAvailability:    user?.preferredAvailability    || "any",
  });

  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);
  const [showResumeParser, setShowResumeParser] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [photoPreview,   setPhotoPreview]   = useState(user?.photoUrl || "");

  // ── helpers ──────────────────────────────────────────────────────────────────
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleArray = (key, value) => {
    const arr = form[key];
    if (arr.includes(value)) {
      // Deselect — never leave preferredRoles or lookingFor completely empty
      const next = arr.filter((v) => v !== value);
      if ((key === "preferredRoles" || key === "lookingFor") && next.length === 0) {
        set(key, ["any"]);
      } else {
        set(key, next);
      }
    } else {
      // Select
      if ((key === "preferredRoles" || key === "lookingFor") && value === "any") {
        // Choosing "any" clears all specific selections
        set(key, ["any"]);
      } else if (key === "preferredRoles" || key === "lookingFor") {
        // Choosing a real role removes "any" from the array
        set(key, [...arr.filter((v) => v !== "any"), value]);
      } else {
        set(key, [...arr, value]);
      }
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── resume parser apply ───────────────────────────────────────────────────────
  const handleResumeApply = (parsedData) => {
    setForm((prev) => ({
      ...prev,
      ...(parsedData.firstName        && { firstName:        parsedData.firstName        }),
      ...(parsedData.lastName         && { lastName:         parsedData.lastName         }),
      ...(parsedData.age              && { age:              parsedData.age              }),
      ...(parsedData.gender           && { gender:           parsedData.gender           }),
      ...(parsedData.about            && { about:            parsedData.about            }),
      ...(parsedData.skills?.length   && { skills:           parsedData.skills           }),
      ...(parsedData.lookingFor?.length && { lookingFor:     parsedData.lookingFor       }),
      ...(parsedData.goals?.length    && { goals:            parsedData.goals            }),
      ...(parsedData.availability     && { availability:     parsedData.availability     }),
      ...(parsedData.experienceLevel  && { experienceLevel:  parsedData.experienceLevel  }),
      ...(parsedData.timezone         && { timezone:         parsedData.timezone         }),
      ...(parsedData.learningGoals?.length && { learningGoals: parsedData.learningGoals }),
      ...(parsedData.projectIdeas?.length  && { projectIdeas:  parsedData.projectIdeas  }),
      hackathonInterest: parsedData.hackathonInterest ?? prev.hackathonInterest,
      startupInterest:   parsedData.startupInterest   ?? prev.startupInterest,
    }));
    setShowResumeParser(false);
    showToast("success", "Profile filled from your resume! Review and save.");
  };

  // ── photo ────────────────────────────────────────────────────────────────────
  const handlePhotoSelect = (file) => {
    setPendingPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.firstName?.trim())
      return showToast("error", "Name is required");
    if (form.lookingFor.length === 0)
      return showToast("error", "Select at least one role you're looking for");
    if (form.preferredRoles.length === 0)
      return showToast("error", "Select at least one preferred developer role (or 'Anyone')");

    setSaving(true);
    try {
      let finalPhotoUrl = form.photoUrl;
      if (pendingPhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append("photo", pendingPhotoFile);
        const uploadRes = await axios.post(
          `${BASE_URL}/upload/profile-photo`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        finalPhotoUrl = uploadRes.data.photoUrl;
        setUploadingPhoto(false);
      }

      const res = await axios.put(
        `${BASE_URL}/profile/edit`,
        { ...form, photoUrl: finalPhotoUrl },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.data));
      showToast("success", "Profile saved successfully!");
      navigate("/feed");
    } catch (err) {
      setUploadingPhoto(false);
      showToast("error", err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert alert-${toast.type}`}>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Resume parser modal */}
      {showResumeParser && (
        <ResumeParser
          onApply={handleResumeApply}
          onClose={() => setShowResumeParser(false)}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 ml-2">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <button
          type="button"
          className="btn outline outline-primary shadow-primary hover:bg-primary btn-sm gap-2"
          onClick={() => setShowResumeParser(true)}
        >
          ✨ Import from Resume
        </button>
      </div>

      <div className="flex flex-col gap-8">

        {/* ── Section 1: Basic Info ─────────────────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <SectionHeader title="Basic Info" />

          <div className="form-control">
            <label className="label"><span className="label-text">Name</span></label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className="input input-bordered w-full"
              placeholder="Your First Name"
            />
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className="input input-bordered w-full mt-2"
              placeholder="Your Last Name"
            />
          </div>

          <div className="form-control">
            <ImageUploader
              label="Profile Photo"
              currentImage={photoPreview}
              onUpload={handlePhotoSelect}
              shape="circle"
              uploading={uploadingPhoto}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Age</span></label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set("age", parseInt(e.target.value) || "")}
                className="input input-bordered w-full"
                min={16} max={80}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Gender</span></label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">About</span>
              <span className="label-text-alt text-base-content/40">{form.about.length}/300</span>
            </label>
            <textarea
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              className="textarea textarea-bordered w-full resize-none"
              rows={3}
              maxLength={300}
              placeholder="Tell others about yourself..."
            />
            <div className="mt-2">
              <BioAssistant
                currentBio={form.about}
                formContext={form}
                onApply={(bio) => set("about", bio)}
              />
            </div>
          </div>
        </section>

        {/* ── Section 2: My Tech Profile ────────────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <SectionHeader
            title="My Tech Profile"
            subtitle="Your own skills, experience, and what role you identify as"
          />

          <TagInput
            label="Skills"
            placeholder="e.g. React, Node.js..."
            values={form.skills}
            onChange={(v) => set("skills", v)}
            suggestions={SKILL_SUGGESTIONS}
          />

          <div className="form-control">
            <label className="label"><span className="label-text">My Experience Level</span></label>
            <RadioGroup
              name="experienceLevel"
              options={EXPERIENCE_OPTIONS}
              value={form.experienceLevel}
              onChange={(v) => set("experienceLevel", v)}
            />
          </div>

          <div className="form-control">
            <label className="span">
              <span className="opacity-60 font-semibold text-md uppercase">I identify as / I'm looking for collaborators who need</span>
            </label>
            <p className="text-xs text-base-content/40 mb-2">
              Others looking for this role will find you.
              <span className="text-red-700 text-xs pl-1">
                 Ensure your Selected Skills are Relevant to your Role.
              </span>
            </p>
            <BadgeMultiSelect
              options={ROLE_OPTIONS}
              selected={form.lookingFor}
              onToggle={(v) => toggleArray("lookingFor", v)}
            />
          </div>
        </section>

        {/* ── Section 3: My Availability & Interests ────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <SectionHeader
            title="My Availability & Interests"
            subtitle="When you're free and what you're passionate about"
          />

          <div className="form-control">
            <label className="label"><span className="label-text">My Availability</span></label>
            <RadioGroup
              name="availability"
              options={AVAILABILITY_OPTIONS}
              value={form.availability}
              onChange={(v) => set("availability", v)}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">My Timezone</span></label>
            <select
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className="select select-bordered w-full"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">My Goals</span>
              <span className="label-text-alt text-base-content/40">What are you building towards?</span>
            </label>
            <BadgeMultiSelect
              options={GOALS_OPTIONS}
              selected={form.goals}
              onToggle={(v) => toggleArray("goals", v)}
            />
          </div>

          {/* Hackathon & Startup toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-md">Hackathon Interest</p>
                <p className="text-xs text-base-content/40">I'm keen to join hackathons</p>
              </div>
              <input
                type="checkbox"
                checked={form.hackathonInterest}
                onChange={(e) => set("hackathonInterest", e.target.checked)}
                className="toggle toggle-primary"
              />
            </label>
            <div className="divider my-0" />
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-md">Startup Interest</p>
                <p className="text-xs text-base-content/40">I'm open to building a startup</p>
              </div>
              <input
                type="checkbox"
                checked={form.startupInterest}
                onChange={(e) => set("startupInterest", e.target.checked)}
                className="toggle toggle-primary"
              />
            </label>
          </div>
        </section>

        {/* ── Section 4: Looking For (Desired Developer) ────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(0,0,0,0.25)] shadow-primary border-2 border-primary/30">
          <SectionHeader
            title="Looking For"
            subtitle="Describe your ideal collaborator, these preferences tune your feed."
          />

          {/* Preferred Roles */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Desired Developer Role</span>
            </label>
            <p className="text-xs text-base-content/40 mb-2">
              What kind of developer do you want to collaborate with?
            </p>
            <BadgeMultiSelect
              options={ROLE_OPTIONS}
              selected={form.preferredRoles}
              onToggle={(v) => toggleArray("preferredRoles", v)}
            />
          </div>

          <div className="divider my-0" />

          {/* Preferred Timezone */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Preferred Timezone(s)</span>
            </label>
            <p className="text-xs text-base-content/40 mb-2">
              Which timezone(s) should your ideal match be in? Leave empty for any.
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TIMEZONES.map((tz) => (
                <label
                  key={tz}
                  className={`badge cursor-pointer select-none transition-all text-sm ${
                    form.preferredTimezones.includes(tz)
                      ? "badge-primary"
                      : "outline outline-primary hover:badge-primary"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.preferredTimezones.includes(tz)}
                    onChange={() => toggleArray("preferredTimezones", tz)}
                  />
                  {tz}
                </label>
              ))}
            </div>
            {form.preferredTimezones.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-xs self-start mt-1 text-base-content/40"
                onClick={() => set("preferredTimezones", [])}
              >
                Clear (any timezone)
              </button>
            )}
          </div>

          <div className="divider my-0" />

          {/* Preferred Interests */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Desired Interests</span>
            </label>
            <p className="text-xs text-base-content/40 mb-2">
              What should your ideal match be passionate about?
            </p>
            <BadgeMultiSelect
              options={INTEREST_OPTIONS}
              selected={form.preferredInterests}
              onToggle={(v) => toggleArray("preferredInterests", v)}
            />
          </div>

          <div className="divider my-0" />

          {/* Preferred Experience Level */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Desired Experience Level</span>
            </label>
            <RadioGroup
              name="preferredExperienceLevel"
              options={EXPERIENCE_OPTIONS_WITH_ANY}
              value={form.preferredExperienceLevel}
              onChange={(v) => set("preferredExperienceLevel", v)}
            />
          </div>

          <div className="divider my-0" />

          {/* Preferred Availability */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Desired Availability</span>
            </label>
            <RadioGroup
              name="preferredAvailability"
              options={AVAILABILITY_OPTIONS_WITH_ANY}
              value={form.preferredAvailability}
              onChange={(v) => set("preferredAvailability", v)}
            />
          </div>
        </section>

        {/* ── Section 5: Projects & Learning ───────────────────── */}
        <section className="card bg-base-200 p-5 flex flex-col gap-4">
          <SectionHeader title="Projects & Learning" />

          <TagInput
            label="Learning Goals"
            placeholder="e.g. System Design, Machine Learning..."
            values={form.learningGoals}
            onChange={(v) => set("learningGoals", v)}
          />

          <TagInput
            label="Project Ideas"
            placeholder="e.g. AI code reviewer, Dev networking app..."
            values={form.projectIdeas}
            onChange={(v) => set("projectIdeas", v)}
          />
        </section>

        {/* ── Save button ───────────────────────────────────────── */}
        <button
          className="btn btn-primary w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <span className="loading loading-spinner loading-sm" />}
          {saving ? "Saving…" : "Save Profile"}
        </button>

      </div>
    </div>
  );
}