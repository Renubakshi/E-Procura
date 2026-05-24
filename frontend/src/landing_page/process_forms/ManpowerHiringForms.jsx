import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function ManpowerHiringForms({
  projectData,
  process,
  selectedHead,
  selectedHeadAmount,
}) {
  const navigate = useNavigate();
  const [adPdf, setAdPdf] = useState("");
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
      const posts = Number(position.numberOfPosts) || 0;

      const salary = Number(position.salaryEnd) || 0;

      // duration months extract
      const months = getDurationInMonths(position.duration) || 0;

      total += posts * salary * months;
    });

    return total;
  };
  const isBudgetExceeded = calculateTotalManpowerCost() > selectedHeadAmount;

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
    window.open(
      `http://localhost:5000/api/files/download-pdf/${fileName}`,
      "_blank",
    );
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

    try {
      if (isBudgetExceeded) {
        alert("Requested manpower cost exceeds available budget");
        return;
      }
      // =========================
      // CREATE FORMDATA
      // =========================

      const sendData = new FormData();

      // pura formData object
      sendData.append("data", JSON.stringify(formData));

      // uploaded pdf file
      sendData.append("attachment", formData.attachment);
      // =========================
      // RECRUITMENT PDF
      // =========================

      const res = await fetch(
        "http://localhost:5000/api/recruitment/create-advertisement",
        {
          method: "POST",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          body: sendData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      alert("Recruitment Advertisement Generated Successfully");
      setAdPdf(data.pdf);

      // Recruitment PDF open
      window.open(
        `http://localhost:5000/api/files/download-pdf/${data.pdf}`,
        "_blank",
      );

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
        "http://localhost:5000/api/recruitment/generate-approval-letter",
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
        window.open(
          `http://localhost:5000/api/files/download-pdf/${approvalData.pdf}`,
          "_blank",
        );

        alert("✅ PDFs downloaded successfully & form submitted");

        setTimeout(() => {
          navigate("/pi-dashboard");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      alert("Server Error");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center ">
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
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-blue-200 rounded-full"
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
                  placeholder="Enter your Website name"
                  value={formData.piWebsite}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Positions</h2>

              <button
                type="button"
                onClick={addPosition}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                + Add Position
              </button>
            </div>

            {formData.positions.map((position, positionIndex) => (
              <div
                key={positionIndex}
                className="border rounded-xl p-6 mb-8 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-0.5 text-gray-700">
                      Enter position Name
                    </p>
                    <input
                      type="text"
                      name="positionName"
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
                      name="numberOfPosts"
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
                        name="salaryStart"
                        placeholder="Start Range"
                        value={position.salaryStart || ""}
                        onChange={(e) => handlePositionChange(positionIndex, e)}
                        className={inputClass}
                      />

                      <input
                        type="number"
                        name="salaryEnd"
                        placeholder="End Range"
                        value={position.salaryEnd || ""}
                        onChange={(e) => handlePositionChange(positionIndex, e)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1 text-gray-700">
                      Duration
                    </p>

                    <input
                      type="text"
                      name="duration"
                      placeholder="Enter Duration"
                      value={position.duration}
                      onChange={(e) => handlePositionChange(positionIndex, e)}
                      className={inputClass}
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "89 Days (Extandable)",
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
                  name="submissionDeadline"
                  placeholder="Submission Deadline"
                  value={formData.submissionDeadline}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-gray-700">
                  Submission Deadline
                </p>
                <input
                  type="date"
                  name="interviewDate"
                  placeholder="Interview Date"
                  value={formData.interviewDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <select
                name="interviewMode"
                value={formData.interviewMode}
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
                  placeholder="Reporting Time"
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
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">Committee Members</h2>

              <button
                type="button"
                onClick={addCommitteeMember}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                + Add Member
              </button>
            </div>

            {formData.committeeMembers.map((member, index) => (
              <input
                key={index}
                type="text"
                value={member}
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachment: e.target.files[0],
                })
              }
              className="w-full mt-2 p-2 border rounded"
            />
          </div>

          {/* ========================= */}
          {/* SUBMIT */}
          {/* ========================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl text-lg font-semibold"
            >
              Submit to Dean
            </button>
            {adPdf && (
              <button
                type="button"
                onClick={() => handleDownload(adPdf)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
              >
                Download Recruitment Advertisement
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
