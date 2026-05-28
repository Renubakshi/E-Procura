import { useState } from "react";

const POSITION_TYPES = [
  { value: "postdoc", label: "Post Doctoral Fellow" },
  { value: "associate", label: "Project Associate/SRF" },
  { value: "jrf", label: "Project Assistant / JRF" },
  { value: "manager", label: "Project Manager" },
  { value: "engineer", label: "Project Engineer" },
  { value: "internship", label: "Internship" },
];

const AGENCIES = [
  "MeitY",
  "DST",
  "SERB",
  "DRDO",
  "ISRO",
  "DBT",
  "CSIR",
  "ICAR",
];
const DURATIONS = [
  "3 months (extendable)",
  "6 months",
  "12 months",
  "24 months",
  "36 months",
];

const ESSENTIAL_QUALS = {
  postdoc: [
    "PhD in CSE or a related discipline",
    "PhD in Mathematics / Statistics with strong computing background",
    "PhD in Electronics / Communication Engineering",
  ],
  associate: [
    "A 3-year diploma in CS/IT plus 2 years of job experience in CS/IT",
    "BE/BTech in CS/IT",
    "MSc in CS/IT",
    "MCA from a recognized university",
    "ME/MTech in CS/IT",
  ],
  jrf: [
    "A 3-year diploma in CS/IT plus 2 years of job experience in CS/IT",
    "BE/BTech in CS/IT",
    "MSc in CS/IT",
    "MCA from a recognized university",
  ],
  manager: [
    "ME/MTech in CS/IT or relevant discipline",
    "BE/BTech in CS/IT with 3+ years experience",
    "MSc/MCA with 3+ years relevant experience",
  ],
  engineer: [
    "BE/BTech in CS/IT or relevant discipline",
    "Diploma in CS/IT with 3+ years experience",
  ],
  internship: [
    "Currently pursuing BE/BTech, MSc, or MCA in relevant discipline",
    "Currently pursuing PhD in relevant discipline",
  ],
};

const DESIRABLE_QUALS = [
  "Android app development (Java, Kotlin, etc.)",
  "Android app security tools (MobSF, ADB, Frida, etc.)",
  "Full-Stack web development (ReactJS, NodeJS, Express, PHP, MongoDB)",
  "Blockchain (Ethereum (Quorum/Besu), Hyperledger Fabric)",
  "Smart contracts (Solidity, Chaincode)",
  "Advanced Cryptography (ZKP, MPC, Advanced signature schemes, etc.)",
  "Web3 security tools (Slither, MythX, zk-SNARKs, etc.)",
  "Penetration testing (e.g. Burp suite)",
  "APK testing (e.g. Frida)",
  "Scalable backends (Node.js, Python)",
  "Network security issues (VLAN, MAC, DHCP, etc.)",
  "Machine Learning / Deep Learning",
  "Data Science and Analytics",
  "Cloud computing (AWS, GCP, Azure)",
];

const SALARY_MAP = {
  postdoc: {
    min: "55,000",
    max: "55,000",
    note: "consolidated + ₹2,00,000 research grant/year",
  },
  associate: { min: "35,000", max: "50,000", note: "consolidated" },
  jrf: { min: "28,000", max: "41,000", note: "consolidated" },
  manager: { min: "50,000", max: "75,000", note: "consolidated" },
  engineer: { min: "35,000", max: "55,000", note: "consolidated" },
  internship: { min: "10,000", max: "20,000", note: "consolidated" },
};

const AGE_MAP = {
  postdoc: "50",
  associate: "45",
  jrf: "35",
  manager: "45",
  engineer: "40",
  internship: "30",
};
const SUBJECT_MAP = {
  postdoc: "MeiTy-PostDoc",
  associate: "MeiTy-ProjectAssociate/SRF",
  jrf: "MeiTy-ProjectAssistant/JRF",
  manager: "MeiTy-ProjectManager",
  engineer: "MeiTy-ProjectEngineer",
  internship: "MeiTy-Internship",
};

const STANDARD_TERMS = [
  "No TA/DA will be provided to the candidate for the interview.",
  "The decision of the selection committee will be final.",
  "If the number of candidates appearing for the interview is large, the selection committee may decide to restrict the number of candidates to a reasonable limit after considering qualifications and experience over and above the minimum prescribed.",
  "The appointment will be governed by the terms and conditions of the Institute/Funding agency applicable to the said project.",
  "The selected candidate will have to join duty immediately on receipt of the offer.",
  "The fellowship may be terminated with a 30-day notice before completion of the tenure if performance is not deemed satisfactory.",
  "IIT Bhilai reserves the right to fill or not to fill any or all the posts.",
];

const TODAY = new Date().toISOString().split("T")[0];

const inputCls =
  "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white";
const readonlyCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 bg-gray-50 cursor-not-allowed";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1";
const sectionTitle =
  "text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200";

function Field({ label, required, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function StepBar({ step }) {
  const steps = [
    "Project & PI",
    "Position & Qualifications",
    "Review & Submit",
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all
                ${done || active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium text-center w-16 sm:w-24 leading-tight
                ${active ? "text-blue-600 font-bold" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 mb-4 transition-all ${step > n ? "bg-blue-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ManpowerHiringForm({
  projectId = "",
  projectCode: initProjCode = "",
  projectTitle: initProjTitle = "",
  piName: initPiName = "",
  piEmail: initPiEmail = "",
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [reqDate, setReqDate] = useState(TODAY);
  const [projTitle, setProjTitle] = useState(initProjTitle);
  const [projCode, setProjCode] = useState(initProjCode);
  const [agency, setAgency] = useState("");
  const [piName, setPiName] = useState(initPiName);
  const [piDesig, setPiDesig] = useState("");
  const [piAddr, setPiAddr] = useState("");
  const [piEmail, setPiEmail] = useState(initPiEmail);
  const [piWeb, setPiWeb] = useState("");

  const [posType, setPosType] = useState("");
  const [numPosts, setNumPosts] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [salMin, setSalMin] = useState("");
  const [salMax, setSalMax] = useState("");
  const [salNote, setSalNote] = useState("");
  const [duration, setDuration] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [emailSub, setEmailSub] = useState("");
  const [essentials, setEssentials] = useState([]);
  const [customEss, setCustomEss] = useState("");
  const [desirables, setDesirables] = useState([]);
  const [customDes, setCustomDes] = useState("");

  const [committee, setCommittee] = useState([""]);
  const [customTerms, setCustomTerms] = useState([""]);
  const [appFormFile, setAppFormFile] = useState(null);

  const setMem = (i, v) =>
    setCommittee((p) => {
      const c = [...p];
      c[i] = v;
      return c;
    });
  const delMem = (i) => setCommittee((p) => p.filter((_, j) => j !== i));

  const setTermLine = (i, v) =>
    setCustomTerms((p) => {
      const c = [...p];
      c[i] = v;
      return c;
    });
  const delTermLine = (i) => setCustomTerms((p) => p.filter((_, j) => j !== i));

  const pickPos = (v) => {
    setPosType(v);
    setEssentials([]);
    const s = SALARY_MAP[v];
    if (s) {
      setSalMin(s.min);
      setSalMax(s.max);
      setSalNote(s.note);
    }
    setAgeLimit(AGE_MAP[v] || "");
    setEmailSub(SUBJECT_MAP[v] || "");
  };

  const togEss = (q) =>
    setEssentials((p) =>
      p.includes(q) ? p.filter((x) => x !== q) : [...p, q],
    );
  const togDes = (q) =>
    setDesirables((p) =>
      p.includes(q) ? p.filter((x) => x !== q) : [...p, q],
    );

  const essBase = posType ? ESSENTIAL_QUALS[posType] : [];
  const customEssItems = essentials.filter((q) => !essBase.includes(q));
  const customDesItems = desirables.filter((q) => !DESIRABLE_QUALS.includes(q));
  const posLabel =
    POSITION_TYPES.find((p) => p.value === posType)?.label || "—";

  const handleSubmit = async () => {
    if (!agency) {
      alert("Please enter the sponsoring agency");
      return;
    }
    if (!posType) {
      alert("Please select a position type");
      return;
    }
    if (!numPosts) {
      alert("Please enter number of posts");
      return;
    }
    if (!duration) {
      alert("Please enter duration");
      return;
    }
    if (!deadline) {
      alert("Please enter submission deadline");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        projectId,
        projectCode: projCode,
        projectTitle: projTitle,
        reqDate,
        agency,
        piName,
        piDesig,
        piAddr,
        piEmail,
        piWeb,
        posType,
        posLabel,
        numPosts,
        ageLimit,
        salMin,
        salMax,
        salNote,
        duration,
        deadline,
        notifDate,
        emailSub,
        essentials,
        desirables,
        committee,
        customTerms,
      };

      const res = await fetch(
        "/api/recruitment/create-advertisement",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error — check if backend is running");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Step bar */}
      <StepBar step={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Date of Request" required>
                <input
                  type="date"
                  value={reqDate}
                  readOnly
                  className={readonlyCls}
                />
              </Field>
              <Field label="Project Code">
                <input
                  value={projCode}
                  readOnly
                  placeholder="Auto-fetched from project"
                  className={readonlyCls}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Project Title" required>
                  <textarea
                    value={projTitle}
                    readOnly
                    rows={2}
                    placeholder="Auto-fetched from project"
                    className={readonlyCls + " resize-none"}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Sponsoring Agency" required>
                  <input
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="e.g. MeitY"
                    className={inputCls}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AGENCIES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAgency(a)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* PI Info */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Principal Investigator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input
                  value={piName}
                  readOnly
                  placeholder="Auto-fetched from profile"
                  className={readonlyCls}
                />
              </Field>
              <Field label="Email ID" required>
                <input
                  type="email"
                  value={piEmail}
                  readOnly
                  placeholder="Auto-fetched from profile"
                  className={readonlyCls}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Designation">
                  <input
                    value={piDesig}
                    onChange={(e) => setPiDesig(e.target.value)}
                    placeholder="e.g. Associate Professor in Department of CSE"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Office Address">
                  <textarea
                    value={piAddr}
                    onChange={(e) => setPiAddr(e.target.value)}
                    rows={2}
                    placeholder="Room, Building, IIT Bhilai, ..."
                    className={inputCls + " resize-none"}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Website / GitHub">
                  <input
                    value={piWeb}
                    onChange={(e) => setPiWeb(e.target.value)}
                    placeholder="e.g. yourname.github.io"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Position type */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Position Type</h3>
            <p className="text-sm text-gray-500 mb-3">
              Salary, age limit and email subject will auto-fill once you pick
              one.
            </p>
            <div className="flex flex-wrap gap-2">
              {POSITION_TYPES.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition
                  ${posType === p.value ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  <input
                    type="radio"
                    name="postype"
                    checked={posType === p.value}
                    onChange={() => pickPos(p.value)}
                    className="accent-blue-600"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          {/* Position details */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Number of Posts" required>
                <input
                  type="number"
                  value={numPosts}
                  onChange={(e) => setNumPosts(e.target.value)}
                  placeholder="e.g. 1"
                  className={inputCls}
                />
              </Field>
              <Field label="Age Limit (years)" required>
                <input
                  value={ageLimit}
                  onChange={(e) => setAgeLimit(e.target.value)}
                  placeholder="e.g. 35"
                  className={inputCls}
                />
              </Field>
              <Field label="Duration" required>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 months"
                  className={inputCls}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Salary Range (₹/month)" required>
                <div className="flex items-center gap-2">
                  <input
                    value={salMin}
                    onChange={(e) => setSalMin(e.target.value)}
                    placeholder="Min"
                    className={inputCls}
                  />
                  <span className="text-gray-400 shrink-0">–</span>
                  <input
                    value={salMax}
                    onChange={(e) => setSalMax(e.target.value)}
                    placeholder="Max"
                    className={inputCls}
                  />
                </div>
                <input
                  value={salNote}
                  onChange={(e) => setSalNote(e.target.value)}
                  placeholder="e.g. consolidated"
                  className={inputCls + " mt-2 text-xs text-gray-500"}
                />
              </Field>
              <Field label="Email Subject (for applications)" required>
                <input
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  placeholder="MeiTy-OCT25-ProjectAssistant/JRF"
                  className={inputCls}
                />
              </Field>
              <Field label="Submission Deadline" required>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Notification Date">
                <input
                  type="date"
                  value={notifDate}
                  onChange={(e) => setNotifDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Essential */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className={sectionTitle}>Essential Qualifications</h3>
              {!posType ? (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  Select a position type first.
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-3">
                    At least one must be satisfied:
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {essBase.map((q, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-sm transition
                        ${essentials.includes(q) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={essentials.includes(q)}
                          onChange={() => togEss(q)}
                          className="mt-0.5 accent-blue-600 shrink-0"
                        />
                        <span className="text-gray-700">{q}</span>
                      </label>
                    ))}
                    {customEssItems.map((q, i) => (
                      <label
                        key={"c" + i}
                        className="flex items-start gap-2 p-2 rounded-lg cursor-pointer text-sm bg-blue-50 border border-blue-200"
                      >
                        <input
                          type="checkbox"
                          checked
                          onChange={() => togEss(q)}
                          className="mt-0.5 accent-blue-600 shrink-0"
                        />
                        <span className="text-gray-700">{q}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      value={customEss}
                      onChange={(e) => setCustomEss(e.target.value)}
                      placeholder="Add custom…"
                      className={inputCls + " text-xs"}
                    />
                    <button
                      onClick={() => {
                        if (customEss.trim()) {
                          setEssentials((p) => [...p, customEss.trim()]);
                          setCustomEss("");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shrink-0"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Desirable */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className={sectionTitle}>Desirable Qualifications</h3>
              <p className="text-xs text-gray-400 mb-3">
                Select all that apply:
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {DESIRABLE_QUALS.map((q, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-sm transition
                    ${desirables.includes(q) ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={desirables.includes(q)}
                      onChange={() => togDes(q)}
                      className="mt-0.5 accent-green-600 shrink-0"
                    />
                    <span className="text-gray-700">{q}</span>
                  </label>
                ))}
                {customDesItems.map((q, i) => (
                  <label
                    key={"c" + i}
                    className="flex items-start gap-2 p-2 rounded-lg cursor-pointer text-sm bg-green-50 border border-green-200"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() => togDes(q)}
                      className="mt-0.5 accent-green-600 shrink-0"
                    />
                    <span className="text-gray-700">{q}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  value={customDes}
                  onChange={(e) => setCustomDes(e.target.value)}
                  placeholder="Add custom…"
                  className={inputCls + " text-xs"}
                />
                <button
                  onClick={() => {
                    if (customDes.trim()) {
                      setDesirables((p) => [...p, customDes.trim()]);
                      setCustomDes("");
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 shrink-0"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Selection Committee */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Selection Committee</h3>
            <div className="space-y-2 mb-3">
              {committee.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-center font-bold shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    value={m}
                    onChange={(e) => setMem(i, e.target.value)}
                    placeholder={i === 0 ? "Dr. Name (Chairman)" : "Dr. Name"}
                    className={inputCls}
                  />
                  {i === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold shrink-0">
                      CHAIR
                    </span>
                  )}
                  {i > 0 && (
                    <button
                      onClick={() => delMem(i)}
                      className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setCommittee((p) => [...p, ""])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
            >
              + Add member
            </button>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Terms & Conditions</h3>
            <p className="text-xs text-gray-400 mb-4">
              These terms are mandatory and will be included in the hiring
              notice.
            </p>
            <ol className="list-decimal list-outside ml-4 space-y-2 mb-6">
              {STANDARD_TERMS.map((term, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed">
                  {term}
                </li>
              ))}
            </ol>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 font-semibold mb-2">
                Additional Terms (optional)
              </p>
              <div className="space-y-2">
                {customTerms.map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={line}
                      onChange={(e) => setTermLine(i, e.target.value)}
                      placeholder={`Additional term ${i + 1}...`}
                      className={inputCls + " text-sm"}
                    />
                    {customTerms.length > 1 && (
                      <button
                        onClick={() => delTermLine(i)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCustomTerms((p) => [...p, ""])}
                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
              >
                + Add term
              </button>
            </div>
          </div>

          {/* Application Form Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Application Form</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload the application form template that candidates will fill and
              submit.
            </p>
            <label
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition
              ${appFormFile ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setAppFormFile(e.target.files[0] || null)}
              />
              {appFormFile ? (
                <>
                  <span className="text-2xl">📄</span>
                  <p className="text-sm font-semibold text-blue-700">
                    {appFormFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(appFormFile.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl text-gray-300">📁</span>
                  <p className="text-sm font-semibold text-gray-600">
                    Click to upload PDF
                  </p>
                  <p className="text-xs text-gray-400">
                    Only .pdf files accepted
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className={sectionTitle}>Summary — verify before generating</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {[
                ["Date", reqDate || "—"],
                ["Project Title", projTitle || "—"],
                ["Project Code", projCode || "—"],
                ["Sponsoring Agency", agency || "—"],
                ["PI Name", piName || "—"],
                ["PI Designation", piDesig || "—"],
                ["PI Email", piEmail || "—"],
                ["PI Address", piAddr || "—"],
                ["PI Website", piWeb || "—"],
                ["Position", posLabel],
                ["No. of Posts", numPosts || "—"],
                ["Age Limit", ageLimit || "—"],
                [
                  "Salary",
                  salMin && salMax
                    ? `₹${salMin} – ₹${salMax}/month (${salNote})`
                    : "—",
                ],
                ["Duration", duration || "—"],
                ["Email Subject", emailSub || "—"],
                ["Submission Deadline", deadline || "—"],
                ["Notification Date", notifDate || "—"],
                [
                  "Application Form",
                  appFormFile ? appFormFile.name : "Not uploaded",
                ],
              ].map(([k, v], i) => (
                <div
                  key={i}
                  className="flex gap-3 py-2 border-b border-gray-100 text-sm"
                >
                  <span className="w-36 text-gray-500 font-semibold shrink-0">
                    {k}
                  </span>
                  <span className="text-gray-800 break-words">{v}</span>
                </div>
              ))}
            </div>

            {(essentials.length > 0 ||
              desirables.length > 0 ||
              committee.filter(Boolean).length > 0) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {essentials.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                      Essential Quals
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {essentials.map((q, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {desirables.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                      Desirable Quals
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {desirables.map((q, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {committee.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                      Committee
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {committee.filter(Boolean).map((m, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit / Success */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-green-700 font-semibold text-lg">
                Request submitted successfully
              </p>
              <p className="text-sm text-gray-500 mt-1">
                The hiring request has been saved and is pending review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`py-3 rounded-lg font-semibold transition text-white
                  ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
              <button
                disabled
                className="py-3 border-2 border-gray-300 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Generate PDF (coming soon)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg border font-semibold text-sm transition
            ${step === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              onClick={() => setStep(n)}
              className={`h-2 rounded-full cursor-pointer transition-all
              ${step === n ? "w-6 bg-blue-600" : n < step ? "w-2 bg-blue-400" : "w-2 bg-gray-300"}`}
            />
          ))}
        </div>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
          >
            Next →
          </button>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </div>
  );
}
