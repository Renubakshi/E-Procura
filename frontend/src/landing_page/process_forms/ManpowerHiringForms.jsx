import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  readPem,
  importPrivateKey,
  signData,
  canonicalPayload,
} from "../../utils/digitalSignature";

export default function ManpowerHiringForms({
  projectData,
  process,
  selectedHead,
  selectedHeadAmount,
  refreshProject,
}) {
  const navigate = useNavigate();
  const [adPdf, setAdPdf] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectCode: "",
    sponsoringAgency: "",
    piName: "",
    piDesignation: "",
    piDepartment: "",
    officeAddress: "",
    piEmail: "",
    piWebsite: "",

    positions: [
      {
        positionName: "",
        numberOfPosts: "",
        ageLimit: "",
        salaryStart: "",
        salaryEnd: "",
        duration: "",

        essentialQualifications: [""],
        desirableQualifications: [""],
      },
    ],
    process: "",
    fundHead: "",
    fundHeadAmount: "",
    requestedAmount: "",

    submissionEmail: "",
    emailSubject: "",
    submissionDeadline: "",
    interviewDate: "",
    interviewMode: "",
    venue: "",
    reportingTime: "",

    committeeMembers: [""],
    attachment: null,
    privateKeyFile: null,
  });
  console.log("head", selectedHead);
  console.log("process", process);

  const getDurationInMonths = (durationValue) => {
    if (!durationValue) return 0;

    const text = String(durationValue.toLowerCase()) || 0;

    const value = parseInt(text) || 0;

    // Days → Months
    if (text.includes("day")) {
      return value / 30;
    }

    // Months → Months
    if (text.includes("month")) {
      return value;
    }

    // Years → Months
    if (text.includes("year")) {
      return value * 12;
    }

    return 0;
  };

  const calculateTotalManpowerCost = () => {
    let total = 0;

    formData.positions.forEach((position) => {
      const posts = Math.abs(Number(position.numberOfPosts) || 0);

      const salary = Math.abs(Number(position.salaryEnd) || 0);

      // duration months extract
      const months = Math.abs(getDurationInMonths(position.duration) || 0);

      total += posts * salary * months;
    });

    return Math.abs(total);
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      requestedAmount: calculateTotalManpowerCost(),
    }));
  }, [formData.positions]);

  useEffect(() => {
    if (projectData) {
      setFormData((prev) => ({
        ...prev,

        projectTitle: projectData.piSubmissions?.title || "",
        projectCode: projectData.projectCode || "",
        piName: projectData.piName || "",
        piDepartment: projectData.department || "",
        piEmail: projectData.piSubmissions?.submittedBy || "",
        process: process,
        fundHead: selectedHead,
        fundHeadAmount: selectedHeadAmount,
      }));
    }
  }, [projectData, process, selectedHead, selectedHeadAmount]);

  // for Email Subject
  useEffect(() => {
    const agency = formData.sponsoringAgency?.replace(/\s+/g, "");
    const position = formData.positions[0]?.positionName?.replace(/\s+/g, "");

    if (agency && position) {
      setFormData((prev) => ({
        ...prev,
        emailSubject: `${agency}-${position}`,
      }));
    }
  }, [formData.sponsoringAgency, formData.positions]);
  // =========================
  // HANDLE MAIN INPUT
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDownload = (fileName) => {
    if (!fileName) {
      alert("PDF not generated yet");
      return;
    }
    window.open(`/api/files/download-pdf/${fileName}`, "_blank");
  };
  // =========================
  // HANDLE POSITION CHANGE
  // =========================

  const handlePositionChange = (index, e) => {
    const updated = [...formData.positions];

    updated[index][e.target.name] = e.target.value;

    setFormData({
      ...formData,
      positions: updated,
    });
  };

  // =========================
  // HANDLE ARRAY FIELDS
  // =========================

  const handleArrayChange = (positionIndex, field, valueIndex, value) => {
    const updated = [...formData.positions];

    updated[positionIndex][field][valueIndex] = value;

    setFormData({
      ...formData,
      positions: updated,
    });
  };

  // =========================
  // ADD ARRAY ITEM
  // =========================

  const addArrayField = (positionIndex, field) => {
    const updated = [...formData.positions];

    updated[positionIndex][field].push("");

    setFormData({
      ...formData,
      positions: updated,
    });
  };

  // =========================
  // ADD POSITION
  // =========================

  const addPosition = () => {
    setFormData({
      ...formData,
      positions: [
        ...formData.positions,
        {
          positionName: "",
          numberOfPosts: "",
          ageLimit: "",
          salaryStart: "",
          salaryEnd: "",
          duration: "",

          essentialQualifications: [""],
          desirableQualifications: [""],
        },
      ],
    });
  };

  const handleKeyFileChange = (e) => {
    setFormData({
      ...formData,
      privateKeyFile: e.target.files[0],
    });
  };

  // =========================
  // COMMITTEE MEMBERS
  // =========================

  const handleCommitteeChange = (index, value) => {
    const updated = [...formData.committeeMembers];

    updated[index] = value;

    setFormData({
      ...formData,
      committeeMembers: updated,
    });
  };

  const addCommitteeMember = () => {
    setFormData({
      ...formData,
      committeeMembers: [...formData.committeeMembers, ""],
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      if (formData.interviewDate && formData.submissionDeadline) {
        const interview = new Date(formData.interviewDate);

        const submission = new Date(formData.submissionDeadline);

        submission.setHours(0, 0, 0, 0);

        if (interview < submission) {
          alert("Interview date cannot be before submission deadline");
          return;
        }
      }

      if (!formData.attachment) {
        alert("Please upload application form PDF");
        return;
      }

      const validCommitteeMembers = formData.committeeMembers.filter(
        (member) => member.trim() !== "",
      );

      if (validCommitteeMembers.length === 0) {
        alert("At least one committee member is required");
        return;
      }

      if (isBudgetExceeded) {
        alert("Requested manpower cost exceeds available budget");
        return;
      }

      if (!formData.privateKeyFile) {
        alert("Please upload private key");
        return;
      }

      // =========================
      // CREATE DIGITAL SIGNATURE
      // =========================

      const payload = canonicalPayload({
        ...formData,
        // file object remove
        attachment: undefined,
        privateKeyFile: undefined,
      });

      const pem = await readPem(formData.privateKeyFile);

      const privateKey = await importPrivateKey(pem);

      const signature = await signData(privateKey, payload);
      // =========================
      // CREATE FORMDATA
      // =========================

      const sendData = new FormData();

      sendData.append("data", JSON.stringify(formData));

      sendData.append("payload", JSON.stringify(payload));

      sendData.append("signature", signature);

      // uploaded pdf file
      sendData.append("attachment", formData.attachment);
      // =========================
      // RECRUITMENT PDF
      // =========================

      const token = localStorage.getItem("token");
      const res = await fetch("/api/recruitment/create-advertisement", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: sendData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert("Recruitment Advertisement Generated Successfully");
      setAdPdf(data.pdf);

      // Recruitment PDF open
      window.open(`/api/files/download-pdf/${data.pdf}`, "_blank");

      // =========================
      // APPROVAL LETTER PDF
      // =========================

      const approvalPayload = {
        projects: [
          {
            projectTitle: formData.projectTitle,
            projectCode: formData.projectCode,
          },
        ],
        piName: formData.piName,
        committeeMembers: formData.committeeMembers,
      };

      const approvalRes = await fetch(
        "/api/recruitment/generate-approval-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(approvalPayload),
        },
      );

      const approvalData = await approvalRes.json();

      if (approvalRes.ok) {
        // Approval PDF open
        window.open(`/api/files/download-pdf/${approvalData.pdf}`, "_blank");

        await fetch(
          `/api/recruitment/${data.recruitment._id}/approval-letter`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              approvalLetterPath: `/generated-pdfs/${approvalData.pdf}`,
            }),
          },
        );

        alert("✅ PDFs downloaded successfully & form submitted");

        await refreshProject();
        navigate("/pi-dashboard");
      }
    } catch (err) {
      console.log(err);
      alert("Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500";

  const requestedAmount = calculateTotalManpowerCost();

  const remainingBalance = selectedHeadAmount - requestedAmount;

  const isBudgetExceeded = requestedAmount > selectedHeadAmount;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center ">
          Recruitment Staff Member Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Project Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  Date of Request
                </p>

                <input
                  type="date"
                  name="date"
                  value={new Date().toISOString().split("T")[0]}
                  readOnly
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  Project Title
                </p>

                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  readOnly
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  Project Code
                </p>

                <input
                  type="text"
                  name="projectCode"
                  value={formData.projectCode}
                  readOnly
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Sponsoring Agency
                </p>

                <input
                  type="text"
                  name="sponsoringAgency"
                  value={formData.sponsoringAgency}
                  required
                  onChange={handleChange}
                  placeholder="Enter Sponsoring Agency"
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-2 mb-1">
                  Suggested Agencies
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "MeitY",
                    "IBITF",
                    "C3iHub (IIT Kanpur)",
                    "DST",
                    "SERB",
                    "CSIR",
                    "DRDO",
                    "Education Ministry",
                    "ICMR",
                    "MoE",
                  ].map((agency) => (
                    <button
                      key={agency}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sponsoringAgency: agency,
                        })
                      }
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-full transition"
                    >
                      {agency}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              PI Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  PI Name
                </p>
                <input
                  type="text"
                  name="piName"
                  value={formData.piName}
                  onChange={handleChange}
                  readOnly
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  PI Designation
                </p>
                <input
                  type="text"
                  name="piDesignation"
                  required
                  placeholder="e.g. Associate Professor"
                  value={formData.piDesignation}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  Office Address
                </p>
                <input
                  type="text"
                  name="officeAddress"
                  required
                  placeholder="Enter office Address"
                  value={formData.officeAddress}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  PI Department
                </p>
                <input
                  type="text"
                  name="piDepartment"
                  placeholder="PI Department"
                  value={formData.piDepartment}
                  onChange={handleChange}
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  PI Email
                </p>
                <input
                  type="email"
                  name="piEmail"
                  value={formData.piEmail}
                  onChange={handleChange}
                  className={inputClass + " bg-gray-100 cursor-not-allowed"}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-0.5 text-gray-700">
                  PI Website
                </p>
                <input
                  type="text"
                  name="piWebsite"
                  required
                  placeholder="Enter PI Website url"
                  value={formData.piWebsite}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 border-b pb-2">
              <h2 className="text-lg sm:text-xl font-semibold">Positions</h2>

              <button
                type="button"
                onClick={addPosition}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                + Add Position
              </button>
            </div>

            {formData.positions.map((position, positionIndex) => (
              <div
                key={positionIndex}
                className="border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-0.5 text-gray-700">
                      Enter position Name
                    </p>
                    <input
                      type="text"
                      name="positionName"
                      required
                      placeholder="Enter Position Name"
                      value={position.positionName}
                      onChange={(e) => handlePositionChange(positionIndex, e)}
                      className={inputClass}
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "Junior Research Fellow (JRF)",
                        "Senior Research Fellow (SRF)",
                        "Project Associate",
                        "Project Assistant",
                        "Project Manager",
                        "Project Engineer",
                        "Intern",
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            const updated = [...formData.positions];

                            updated[positionIndex].positionName = item;

                            setFormData({
                              ...formData,
                              positions: updated,
                            });
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 hover:bg-blue-200 rounded-full"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-0.5 text-gray-700">
                      Number of posts
                    </p>
                    <input
                      type="number"
                      min="1"
                      name="numberOfPosts"
                      required
                      placeholder="Enter Number of Posts"
                      value={position.numberOfPosts}
                      onChange={(e) => handlePositionChange(positionIndex, e)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-0.5 text-gray-700">
                      Age Limit
                    </p>
                    <input
                      type="text"
                      name="ageLimit"
                      required
                      placeholder="Enter Age Limit"
                      value={position.ageLimit}
                      onChange={(e) => handlePositionChange(positionIndex, e)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-0.5 text-gray-700">
                      Enter Salary Range
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        min="0"
                        required
                        name="salaryStart"
                        placeholder="Start Range"
                        value={position.salaryStart || ""}
                        onChange={(e) => handlePositionChange(positionIndex, e)}
                        className={inputClass}
                      />

                      <input
                        type="number"
                        min="0"
                        name="salaryEnd"
                        required
                        placeholder="End Range"
                        value={position.salaryEnd || ""}
                        onChange={(e) => handlePositionChange(positionIndex, e)}
                        className={inputClass}
                      />
                    </div>
                    {position.salaryStart &&
                      position.salaryEnd &&
                      Number(position.salaryStart) >
                        Number(position.salaryEnd) && (
                        <p className="text-red-600 text-sm mt-2">
                          Minimum salary cannot be greater than maximum salary
                        </p>
                      )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1 text-gray-700">
                      Duration
                    </p>

                    <input
                      type="text"
                      name="duration"
                      placeholder="Enter Duration"
                      required
                      value={position.duration}
                      onChange={(e) => handlePositionChange(positionIndex, e)}
                      className={inputClass}
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "89 Days (Extendable)",
                        "6 Months",
                        "12 Months",
                        "18 Months",
                        "24 Months",
                      ].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => {
                            const updated = [...formData.positions];

                            updated[positionIndex].duration = duration;

                            setFormData({
                              ...formData,
                              positions: updated,
                            });
                          }}
                          className="px-3 py-1 text-sm bg-gray-200 hover:bg-blue-200 rounded-full"
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ESSENTIAL QUALIFICATIONS */}

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">
                    Essential Qualifications
                  </h3>

                  {position.essentialQualifications.map((item, index) => (
                    <input
                      key={index}
                      type="text"
                      value={item}
                      required
                      placeholder="Essential Qualification"
                      onChange={(e) =>
                        handleArrayChange(
                          positionIndex,
                          "essentialQualifications",
                          index,
                          e.target.value,
                        )
                      }
                      className={inputClass + " mb-2"}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      addArrayField(positionIndex, "essentialQualifications")
                    }
                    className="text-blue-600 text-sm"
                  >
                    + Add Essential Qualification
                  </button>
                </div>

                {/* DESIRABLE QUALIFICATIONS */}

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">
                    Desirable Qualifications
                  </h3>

                  {position.desirableQualifications.map((item, index) => (
                    <input
                      key={index}
                      type="text"
                      required
                      value={item}
                      placeholder="Desirable Qualification"
                      onChange={(e) =>
                        handleArrayChange(
                          positionIndex,
                          "desirableQualifications",
                          index,
                          e.target.value,
                        )
                      }
                      className={inputClass + " mb-2"}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      addArrayField(positionIndex, "desirableQualifications")
                    }
                    className="text-blue-600 text-sm"
                  >
                    + Add Desirable Qualification
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 border rounded-2xl p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">Fund Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Available Fund</p>

                <p className="text-xl font-bold text-blue-600">
                  ₹
                  {selectedHeadAmount?.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Requested Amount</p>

                <p className="text-xl font-bold text-orange-500">
                  ₹
                  {requestedAmount?.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <p className="text-sm text-gray-500">Remaining Balance</p>

                <p
                  className={`text-xl font-bold ${
                    remainingBalance < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  ₹
                  {remainingBalance?.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>
            </div>

            {isBudgetExceeded && (
              <p className="mt-4 text-red-500 font-medium">
                Requested amount exceeds available fund balance
              </p>
            )}
          </div>

          {/* ========================= */}
          {/* SUBMISSION DETAILS */}
          {/* ========================= */}

          <div>
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Submission & Interview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Submission Email
                </p>
                <input
                  type="email"
                  name="submissionEmail"
                  placeholder="Submission Email"
                  value={formData.piEmail}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Subject-line of the email
                </p>
                <input
                  type="text"
                  name="emailSubject"
                  placeholder="Email Subject"
                  value={formData.emailSubject}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Submission Deadline
                </p>
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  name="submissionDeadline"
                  required
                  onFocus={(e) => e.target.showPicker?.()}
                  value={formData.submissionDeadline}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Interview Date
                </p>
                <input
                  type="date"
                  name="interviewDate"
                  required
                  onFocus={(e) => e.target.showPicker?.()}
                  value={formData.interviewDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <select
                name="interviewMode"
                value={formData.interviewMode}
                required
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Interview Mode</option>

                <option value="Online">Online</option>

                <option value="Offline">Offline</option>

                <option value="Hybrid">Hybrid</option>
              </select>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Enter Venue
                </p>
                <input
                  type="text"
                  name="venue"
                  required
                  placeholder="Venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Reporting Time
                </p>
                <input
                  type="time"
                  name="reportingTime"
                  required
                  onFocus={(e) => e.target.showPicker?.()}
                  value={formData.reportingTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* COMMITTEE MEMBERS */}
          {/* ========================= */}

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 border-b pb-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                Committee Members
              </h2>

              <button
                type="button"
                onClick={addCommitteeMember}
                className="bg-green-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                + Add Member
              </button>
            </div>

            {formData.committeeMembers.map((member, index) => (
              <input
                key={index}
                type="text"
                value={member}
                required
                placeholder="Committee Member Name"
                onChange={(e) => handleCommitteeChange(index, e.target.value)}
                className={inputClass + " mb-3"}
              />
            ))}
          </div>
          {/* Attachment */}
          <div>
            <label>Upload Application Form</label>

            <input
              type="file"
              accept=".pdf"
              required
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                if (file.type !== "application/pdf") {
                  alert("Only PDF files are allowed");
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  alert("File size should be less than 5MB");
                  return;
                }

                setFormData({
                  ...formData,
                  attachment: file,
                });
              }}
              className="w-full mt-2 p-2 border rounded"
            />
          </div>

          {/* Private Key Upload */}
          <div>
            <label className="font-medium">
              Upload Your Signing Key (.pem)
            </label>

            <input
              type="file"
              accept=".pem"
              required
              onChange={handleKeyFileChange}
              className="w-full mt-2 p-2 border rounded"
            />

            <p className="text-xs text-gray-500 mt-1">
              Required for digital signature verification
            </p>
          </div>

          {/* SUBMIT */}

          <div className="flex">
            <button
              type="submit"
              disabled={submitting || isBudgetExceeded}
              className={`px-6 py-2.5 rounded-xl font-semibold text-white transition w-full sm:w-auto ${
                submitting || isBudgetExceeded
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {submitting ? "Submitting..." : "Submit to Dean"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
