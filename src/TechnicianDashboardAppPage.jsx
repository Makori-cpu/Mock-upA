import { useState } from "react";

/*
  HOW THE AUTOMATIC SWITCH WORKS
  --------------------------------
  This component decides which view to show based on ONE thing: the `jobs` array.

  - jobs.length === 0  -> shows the "new technician" empty state
  - jobs.length > 0    -> shows the full working dashboard

  Right now `jobs` starts empty, simulating a brand-new technician with nothing assigned.
  There's a small "Simulate: assign a job" button below for demo purposes only —
  delete that button once a real backend exists.

  When you build the backend, replace the `useState([])` below with a real data fetch,
  e.g.:

    const [jobs, setJobs] = useState([]);
    useEffect(() => {
      fetch("/api/technician/me/jobs")
        .then(res => res.json())
        .then(data => setJobs(data));
    }, []);

  And when the backend assigns a new job (via a WebSocket push, or the technician
  refetching), you just call setJobs([...jobs, newJob]). The moment `jobs` goes from
  empty to non-empty, this component re-renders and automatically shows the full
  dashboard instead of the empty state — no extra switching logic needed anywhere else.
*/

const demoJob = {
  id: 0,
  title: "Fix printer, Floor 3",
  ticket: "Ticket #204 — from Grace A.",
  staffName: "Grace",
  description:
    "The printer on floor 3 keeps jamming on every third page, tried restarting it twice.",
  fileName: "printer_error.jpg",
  aiAnswer: "Similar tickets were fixed by replacing the fuser unit — bring a spare.",
  initialMessages: [
    { from: "staff", text: "Any update? Floor 3 printer is down again." },
    { from: "me", text: "On my way now, bringing a spare part." },
  ],
  feedback: '"Fixed in 20 minutes, thank you!"',
};

const initialSolved = [
  { title: "Replaced fuser unit, 2nd floor", when: "Yesterday" },
  { title: "Fixed VPN certificate error", when: "2 days ago" },
];

const leaderboard = [
  { name: "Brian K.", count: 42 },
  { name: "Amina R.", count: 33 },
];

function StatusToggle() {
  const [active, setActive] = useState(false);

  return (
    <button
      onClick={() => setActive((a) => !a)}
      aria-pressed={active}
      className="flex items-center gap-2 border border-[var(--color-ink)] px-3.5 py-2 text-[13px] font-semibold cursor-pointer transition-colors"
    >
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors ${
          active ? "bg-[var(--color-ink)]" : "bg-[var(--color-muted)]"
        }`}
      />
      {active ? "Active" : "Away"}
    </button>
  );
}

function SkillsPanel({ skills, onAddSkill, highlighted }) {
  const [showInput, setShowInput] = useState(false);
  const [value, setValue] = useState("");

  const addSkill = () => {
    if (!value.trim()) return;
    onAddSkill(value.trim());
    setValue("");
    setShowInput(false);
  };

  return (
    <div
      className={`border p-4 ${
        highlighted
          ? "border-[var(--color-ink)] bg-[#f1efe8]"
          : "border-[var(--color-line)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold">Your skills</p>
        <button
          onClick={() => setShowInput(true)}
          className="text-[12px] font-semibold underline underline-offset-2"
        >
          + Add skill
        </button>
      </div>

      <div className="mt-2.5">
        {skills.length === 0 ? (
          <p className="text-[12px] text-[var(--color-muted)]">
            No skills added yet. Add at least one to start receiving jobs.
          </p>
        ) : (
          <table className="w-full text-[12px]">
            <tbody>
              {skills.map((s, i) => (
                <tr key={i}>
                  <td className="border-t border-[var(--color-line)] py-1.5">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInput && (
        <div className="mt-2.5 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="e.g. Networking"
            className="flex-1 border border-[var(--color-line)] px-2.5 py-1.5 text-[12px]"
          />
          <button
            onClick={addSkill}
            className="border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 text-[12px] font-semibold text-[var(--color-bg)]"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function JobDetail({ job }) {
  const [stage, setStage] = useState("pending");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(job.initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [aiAsked, setAiAsked] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [kbText, setKbText] = useState("");
  const [kbSubmitted, setKbSubmitted] = useState(false);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [...m, { from: "me", text: chatInput.trim() }]);
    setChatInput("");
  };

  const statusLabel =
    stage === "pending"
      ? "Awaiting response"
      : stage === "rejected"
      ? "Rejected — reassigning"
      : stage === "escalated"
      ? "Escalated"
      : stage === "solved"
      ? "Solved"
      : "In progress";

  const statusClasses =
    stage === "rejected"
      ? "bg-[#fbeaea] text-[#a32d2d]"
      : stage === "escalated"
      ? "bg-[#faeeda] text-[#854f0b]"
      : stage === "solved"
      ? "bg-[#eaf3de] text-[#27500a]"
      : stage === "working"
      ? "bg-[#e6f1fb] text-[#185fa5]"
      : "bg-[#faeeda] text-[#854f0b]";

  return (
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[16px] font-semibold">{job.title}</p>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">{job.ticket}</p>
        </div>
        <span className={`px-3 py-1 text-[12px] font-medium ${statusClasses}`}>{statusLabel}</span>
      </div>

      {stage === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setStage("working")}
            className="flex-1 border border-[var(--color-ink)] bg-[var(--color-ink)] py-2.5 text-[13px] font-semibold text-[var(--color-bg)]"
          >
            Accept
          </button>
          <button
            onClick={() => setStage("rejected")}
            className="flex-1 border border-[var(--color-ink)] py-2.5 text-[13px] font-semibold"
          >
            Reject
          </button>
        </div>
      )}

      {(stage === "working" || stage === "solved" || stage === "escalated") && (
        <div className="mt-4 space-y-3">
          {stage === "escalated" && (
            <div className="bg-[#faeeda] p-3">
              <p className="text-[13px] font-semibold text-[#854f0b]">Escalated to a supervisor</p>
              <p className="mt-1 text-[12px] text-[#854f0b]">
                This job has been flagged for extra support. You can keep working on it while you
                wait for a response.
              </p>
            </div>
          )}

          <div className="bg-[#f7f7f7] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-muted)]">
              What {job.staffName} said
            </p>
            <p className="mt-1.5 text-[13px] text-[var(--color-muted)]">"{job.description}"</p>
            {job.fileName && (
              <div className="mt-2 flex w-fit items-center gap-2 border border-[var(--color-line)] px-2.5 py-1.5">
                <span className="text-[11px] text-[var(--color-muted)]">📎 {job.fileName}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setChatOpen((o) => !o)}
            className="flex w-full items-center gap-2 bg-[#e6f1fb] px-3 py-2.5 text-left"
          >
            <span className="flex-1 text-[12px] text-[#185fa5]">
              {job.staffName} has opened a live chat with you
            </span>
            <span className="text-[12px] text-[#185fa5]">{chatOpen ? "▲" : "▼"}</span>
          </button>

          {chatOpen && (
            <div className="border border-[var(--color-line)] p-3">
              <div className="flex max-h-[150px] flex-col gap-1.5 overflow-y-auto">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[75%] px-2.5 py-2 text-[12px] ${
                      m.from === "me"
                        ? "self-end bg-[var(--color-ink)] text-[var(--color-bg)]"
                        : "self-start bg-[#f1efe8]"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Reply to ${job.staffName}…`}
                  className="flex-1 border border-[var(--color-line)] px-2.5 py-1.5 text-[12px]"
                />
                <button
                  onClick={sendMessage}
                  className="border border-[var(--color-ink)] px-3 text-[12px] font-semibold"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          <div className="border border-dashed border-[var(--color-line)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-muted)]">
              Ask Tatua Sasa AI
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g. what usually fixes this?"
                className="flex-1 border border-[var(--color-line)] px-2.5 py-1.5 text-[12px]"
              />
              <button
                onClick={() => setAiAsked(true)}
                className="border border-[var(--color-ink)] px-3 text-[12px] font-semibold"
              >
                Ask
              </button>
            </div>
            {aiAsked && <p className="mt-2 text-[12px] text-[var(--color-muted)]">{job.aiAnswer}</p>}
          </div>

          {(stage === "working" || stage === "escalated") && (
            <div className="flex gap-2">
              {stage === "working" && (
                <button
                  onClick={() => setStage("escalated")}
                  className="flex-1 border border-[#854f0b] text-[#854f0b] py-2.5 text-[13px] font-semibold"
                >
                  Escalate issue
                </button>
              )}
              <button
                onClick={() => setStage("solved")}
                className="flex-1 border border-[var(--color-ink)] py-2.5 text-[13px] font-semibold"
              >
                Mark as solved
              </button>
            </div>
          )}

          {stage === "solved" && (
            <>
              <div className="bg-[#f7f7f7] p-3">
                <p className="text-[13px] font-semibold">Add this to the knowledge base</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">
                  What did you do to fix it?
                </p>
                <textarea
                  value={kbText}
                  onChange={(e) => setKbText(e.target.value)}
                  rows={3}
                  placeholder="Replaced the fuser unit and cleared the tray 2 jam..."
                  className="mt-2 w-full border border-[var(--color-line)] p-2 text-[12px]"
                />
                <button
                  onClick={() => kbText.trim() && setKbSubmitted(true)}
                  className="mt-2 border border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-1.5 text-[12px] font-semibold text-[var(--color-bg)]"
                >
                  Publish article
                </button>
                {kbSubmitted && (
                  <p className="mt-2 text-[12px] text-[#27500a]">
                    Article added to the knowledge base.
                  </p>
                )}
              </div>

              <div className="bg-[#eaf3de] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#27500a]">
                  Feedback from {job.staffName}
                </p>
                <p className="mt-1.5 text-[13px] text-[#27500a]">{job.feedback}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TechnicianDashboardAppPage() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const hasJobs = jobs.length > 0;
  const selectedJob = jobs.find((j) => j.id === selectedId) || jobs[0];

  return (
    <article className="mx-auto max-w-[1000px] px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">
            {hasJobs ? "Technician's dashboard" : "Welcome, Daniel"}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            {hasJobs
              ? "One flawless view, from the first message to the fix."
              : "Let's get you set up — add your skills below so jobs can start coming your way."}
          </p>
        </div>
        <StatusToggle />
      </div>

      {!hasJobs && (
        <div className="border border-[var(--color-line)] p-8 text-center">
          <p className="text-[14px] font-semibold">No jobs assigned yet</p>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">
            Jobs will show up here once your skills are added and you go active.
          </p>
        </div>
      )}

      {hasJobs && (
        <div className="grid grid-cols-1 border border-[var(--color-ink)] md:grid-cols-[200px_1fr]">
          <div className="border-b border-[var(--color-ink)] md:border-b-0 md:border-r">
            <p className="px-3.5 pb-2 pt-3 text-[12px] text-[var(--color-muted)]">Today's queue</p>
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedId(job.id)}
                className={`block w-full border-t border-[var(--color-line)] px-3.5 py-3 text-left text-[13px] font-semibold ${
                  job.id === selectedJob?.id ? "bg-[#f1efe8]" : "bg-transparent"
                }`}
              >
                {job.title}
              </button>
            ))}
          </div>
          <JobDetail key={selectedJob.id} job={selectedJob} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <SkillsPanel
          skills={skills}
          highlighted={!hasJobs}
          onAddSkill={(s) => setSkills((prev) => [...prev, s])}
        />
        <div className="border border-[var(--color-line)] p-4">
          <p className="text-[14px] font-semibold">Problems you've solved</p>
          {initialSolved.length === 0 || !hasJobs ? (
            <p className="mt-2.5 text-[12px] text-[var(--color-muted)]">
              You haven't resolved anything yet — this fills in as you go.
            </p>
          ) : (
            <div className="mt-2.5 flex flex-col gap-2">
              {initialSolved.map((s) => (
                <div key={s.title} className="flex justify-between text-[12px]">
                  <span>{s.title}</span>
                  <span className="text-[var(--color-muted)]">{s.when}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 border border-[var(--color-line)] p-4">
        <p className="text-[14px] font-semibold">Leaderboard, this month</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {leaderboard.map((l, i) => (
            <div key={l.name} className="flex justify-between bg-[#f7f7f7] px-2.5 py-2 text-[13px]">
              <span>
                {i + 1}. {l.name}
              </span>
              <span className="text-[var(--color-muted)]">{l.count} resolved</span>
            </div>
          ))}
          <div className="flex justify-between bg-[#f7f7f7] px-2.5 py-2 text-[13px] text-[var(--color-muted)]">
            <span>— You</span>
            <span>{hasJobs ? "1 resolved" : "Not enough activity yet"}</span>
          </div>
        </div>
      </div>

      {!hasJobs && (
        <div className="mt-6 border border-dashed border-[var(--color-line)] p-4 text-center">
          <p className="text-[12px] text-[var(--color-muted)]">
            Demo only — remove this button once a real backend assigns jobs automatically.
          </p>
          <button
            onClick={() => setJobs([demoJob])}
            className="mt-2 border border-[var(--color-ink)] px-4 py-2 text-[12px] font-semibold"
          >
            Simulate: assign a job
          </button>
        </div>
      )}
    </article>
  );
}
