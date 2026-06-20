const features = [
    {
      title: "Smart Matching",
      desc: "A weighted recommendation engine ranks developers based on desired roles, desired skills, interests, timezone, availability, shared goals, and profile compatibility—helping you discover collaborators who truly match your requirements."},
    {
      title: "CollabHub",
      desc: "Post and discover collaboration opportunities: hackathons, open-source projects, and early-stage startups. Find teammates before the deadline.",
    },
    {
      title: "Real-time Messenger",
      desc: "Socket.IO-powered chat with unread badges, message history, and personal rooms, so conversations never get lost.",
    },
    {
      title: "Developer Search",
      desc: "Semantic search that understands roles and skills. Type 'fullstack' or 'RAG' and get developers who actually know what that means.",
    },
    {
      title: "Communities",
      desc: "Join topic-based groups to share ideas, ask questions, and stay in the loop with developers who share your interests.",
    },
    {
      title: "Status and Connections",
      desc: "Track your connections, monitor pending requests, and see who has accepted or declined your collaboration requests."
    },
  ];
  
  const stack = [
    { label: "React 19" },
    { label: "Redux Toolkit"},
    { label: "Tailwind v4" },
    { label: "DaisyUI v5" },
    { label: "Node.js"},
    { label: "Express 5" },
    { label: "MongoDB Atlas" },
    { label: "Socket.IO" },
    { label: "JWT Auth" },
    { label: "PM2 + Nginx" },
    { label: "AWS EC2" },
    { label: "Vite" },
    {label : "Gemini APIs"}
  ];
  
  const timeline = [
    {
      phase: "Foundation",
      items: ["User auth & JWT sessions", "Profile system with photo upload", "feed with weighted recommendations"],
    },
    {
      phase: "Connection Layer",
      items: ["Send / accept / ignore connection requests", "Mutual connection graph", "Request notifications"],
    },
    {
      phase: "Collaboration",
      items: ["CollabHub with role-filtered posts", "Communities with group chat", "Status updates & feed"],
    },
    {
      phase: "Communication",
      items: ["Socket.IO real-time messenger", "Unread badge system in navbar", "Per-room message history"],
    },
    {
      phase: "Discovery",
      items: ["Semantic developer search", "Role & availability filters", "Skill-aware query expansion"],
    },
  ];
  
  export default function About() {
    return (
      <div className="min-h-screen bg-base-200">
  
        {/* ── Hero ─────────────────────────────────────────────────────────────── */}
        <section className="bg-base-100 border-b border-base-300">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              MERN Stack Powered with AI
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4">
              Dev<span className="text-primary">Match</span>
            </h1>
            <p className="text-2xl font-semibold text-base-content/60 mb-6 tracking-tight">
              Match • Connect • Build.
            </p>
            <p className="text-base text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              DevMatch is a full-stack developer networking platform that helps programmers
              find collaborators, teammates, and friends matched by their desired skills,
              roles and goals, not follower counts.
            </p>
          </div>
        </section>
  
        {/* ── Why DevMatch ─────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-bold mb-2 text-primary text-3xl">Why DevMatch?</h2>
          <p className="text-base-content/60 mb-10 text-sm">
            LinkedIn is for resumes. Twitter is for hot takes. DevMatch is for building things.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="card bg-base-100 border border-base-300 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="card-body p-5 gap-3">
                  <h3 className="font-bold text-xl">{f.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  
        {/* ── How it works ─────────────────────────────────────────────────────── */}
        <section className="bg-base-100 border-y border-base-300">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-bold mb-2 text-primary text-3xl">How it works</h2>
            <p className="text-base-content/60 mb-10 text-sm">Three steps from signup to collaboration.</p>
            <div className="flex flex-col md:flex-row gap-0 md:gap-0 relative">
              {/* connector line on desktop */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+8px)] right-[calc(16.67%+8px)] h-px bg-base-300 z-0" />
              {[
                { step: "01", title: "Build your profile", body: "Add your skills, experience level, timezone, and what you're open to hackathons, startups, open source, or just learning together." },
                { step: "02", title: "Get matched", body: "The smart feed ranks developers based on desired roles, skills, interests, timezone, availability, shared goals, and mutual interests helping you connect with the most compatible collaborators. Connect or Skip with a single click." },
                { step: "03", title: "Start building", body: "Chat in real time, post a collab opportunity, join a community, or find a teammate for your next project." },
              ].map((s) => (
                <div key={s.step} className="flex-1 flex flex-col items-center text-center px-4 py-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-content text-lg font-bold flex items-center justify-center mb-4 ring-4 ring-base-100">
                    {s.step}
                  </div>
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* ── Tech stack ───────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl text-primary font-bold mb-2">Built with</h2>
          <p className="text-base-content/60 mb-8 text-sm">
            A modern MERN stack, deployed on AWS EC2 behind Nginx, managed with PM2.
          </p>
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span key={s.label} className={`badge badge-primary badge-lg font-semibold`}>
                {s.label}
              </span>
            ))}
          </div>
          {/* Architecture pill blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { label: "Frontend", detail: "React 19 + Vite, Redux Toolkit, DaisyUI v5, Socket.IO client, React Router v6" },
              { label: "Backend", detail: "Express 5, Mongoose 9, JWT + cookie auth, Socket.IO server, REST API" },
              { label: "Infra", detail: "MongoDB Atlas, AWS EC2, PM2 process manager, Nginx reverse proxy, HTTPS" },
            ].map((a) => (
              <div key={a.label} className="card bg-base-100 border border-base-300 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{a.label}</p>
                <p className="text-sm text-base-content/70 leading-relaxed">{a.detail}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* ── Build timeline ───────────────────────────────────────────────────── */}
        <section className="bg-base-100 border-y border-base-300">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-bold mb-2 text-primary text-3xl ">Development journey</h2>
            <p className="text-base-content/60 mb-10 text-sm">
              Built incrementally, each phase shipped end-to-end before the next began.
            </p>
            <ul className="timeline timeline-vertical">
              {timeline.map((t, i) => (
                <li key={t.phase}>
                  {i !== 0 && <hr className="bg-base-300" />}
                  <div className={`timeline-${i % 2 === 0 ? "start" : "end"} timeline-box bg-base-200 border border-base-300 `}>
                    <p className="font-bold text-sm text-primary mb-1">{t.phase}</p>
                    <ul className="text-xs text-base-content/70 space-y-0.5 list-disc list-inside">
                      {t.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="timeline-middle">
                    <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-base-100" />
                  </div>
                  {i !== timeline.length - 1 && <hr className="bg-base-300" />}
                </li>
              ))}
            </ul>
          </div>
        </section>
  
        {/* ── About the creator ────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl text-primary font-bold mb-8">About the creator</h2>
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body md:p-8 p-6 flex-col sm:flex-row gap-8 items-start">
              {/* Avatar placeholder */}
              <div className="hidden md:flex w-20 h-20 rounded-full bg-primary/15 items-center justify-center text-3xl font-extrabold text-primary flex-shrink-0 ring-4 ring-base-100 shadow">
                PG
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-primary font-bold mb-0.5">Pranshu Gupta</h3>
                <p className="text-sm text-base-content/50 mb-4">
                  Full Stack Developer · MAIT Rohini, New Delhi
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed mb-5">
                  DevMatch is a personal project born out of one frustration, finding serious
                  collaborators for hackathons and side projects is way harder than it should be.
                  The platform is designed, built, and maintained entirely as a solo effort,
                  from the weighted feed algorithm and real-time messenger to the EC2 deployment
                  pipeline and semantic search engine.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["MERN Stack Developer", "GenAI Engineer", "Problem Solver", "LLMs", "AWS"].map((tag) => (
                    <span key={tag} className="badge badge-ghost badge-sm">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section className="bg-primary text-primary-content">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-extrabold mb-3">Ready to find your team?</h2>
            <p className="text-primary-content/70 mb-8 text-base max-w-xl mx-auto">
            Join DevMatch and Connect with developers who match your desired skills, roles, and interests..
            </p>
            <a href="/feed" className="btn btn-neutral btn-lg rounded-full px-10 font-bold shadow-md">
              Go to Feed
            </a>
          </div>
        </section>
  
      </div>
    );
  }