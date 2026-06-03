import { useEffect, useState } from "react";
import axios from "axios";
import {
  readPem,
  importPrivateKey,
  signData,
  canonicalPayload,
} from "../../utils/digitalSignature";

function DashboardDORD() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [privateKeyFile, setPrivateKeyFile] = useState(null);

  // ======================================
  // FETCH RECRUITMENTS
  // ======================================

  useEffect(() => {
    fetchRecruitments();
  }, []);

  const fetchRecruitments = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/recruitment");

      setProjects(res.data.recruitments);

      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
    }
  };

  // ======================================
  // APPROVE RECRUITMENT
  // ======================================

  const approveRecruitment = async (project) => {
    try {
      if (!privateKeyFile) {
        alert("Please upload Dean signing key");
        return;
      }

      const confirmApprove = window.confirm(
        "Approve this recruitment request?",
      );

      if (!confirmApprove) return;

      // ======================================
      // PAYLOAD
      // ======================================

      const payload = canonicalPayload({
        recruitmentId: project._id,
        projectCode: project.projectCode,
        action: "APPROVED",
        signedBy: "Dean",
        timestamp: new Date().toISOString(),
      });

      // ======================================
      // SIGNATURE
      // ======================================

      const pem = await readPem(privateKeyFile);

      const privateKey = await importPrivateKey(pem);

      const signatureDean = await signData(privateKey, payload);

      // ======================================
      // API CALL
      // ======================================

      await axios.put(
        `http://localhost:5000/api/recruitment/${project._id}/approve`,
        {
          payload,
          signatureDean,
        },
      );

      alert("Recruitment Approved Successfully");

      setShowApproveModal(false);
      setPrivateKeyFile(null);
      setSelectedProject(null);
      await axios.put(`/api/recruitment/${id}/approve`);

      fetchRecruitments();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Approval failed");
    }
  };

  // ======================================
  // REJECT RECRUITMENT
  // ======================================

  const rejectRecruitment = async (project) => {
    try {
      if (!rejectReason.trim()) {
        alert("Please enter rejection reason");
        return;
      }
      if (!privateKeyFile) {
        alert("Please upload Dean signing key");
        return;
      }
      const confirmReject = window.confirm("Reject this recruitment request?");

      if (!confirmReject) return;

      // ======================================
      // PAYLOAD
      // ======================================
      await axios.put(`/api/recruitment/${id}/reject`);

      const payload = canonicalPayload({
        recruitmentId: project._id,
        projectCode: project.projectCode,
        action: "REJECTED",
        reason: rejectReason,
        signedBy: "Dean",
        timestamp: new Date().toISOString(),
      });

      // ======================================
      // SIGNATURE
      // ======================================

      const pem = await readPem(privateKeyFile);

      const privateKey = await importPrivateKey(pem);

      const signatureDean = await signData(privateKey, payload);

      // ======================================
      // API CALL
      // ======================================

      await axios.put(
        `http://localhost:5000/api/recruitment/${project._id}/reject`,
        {
          payload,
          signatureDean,
        },
      );

      alert("Recruitment Rejected");
      setShowRejectModal(false);
      setRejectReason("");
      setPrivateKeyFile(null);
      setSelectedProject(null);
      fetchRecruitments();
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Rejection failed");
    }
  };

  // ======================================
  // STATUS COLOR
  // ======================================

  const getStatusColor = (status) => {
    if (status === "Approved") {
      return "bg-green-500";
    }

    if (status === "Rejected") {
      return "bg-red-500";
    }

    return "bg-yellow-500";
  };

  // ======================================
  // FILTER + SEARCH
  // ======================================

  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
      project.piName?.toLowerCase().includes(search.toLowerCase()) ||
      project.projectTitle?.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "All" ? true : project.status === filter;

    return matchSearch && matchFilter;
  });

  // ======================================
  // VIEW PDF
  // ======================================

  const viewPDF = (pdfName) => {
    if (!pdfName) {
      alert("PDF not found");
      return;
    }

    window.open(`/generated-pdfs/${pdfName}`, "_blank");
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Dean Recruitment Dashboard
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Review and manage recruitment approval requests
          </p>
        </div>

        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-sm border border-gray-200 w-full lg:w-auto">
          <p className="text-sm text-gray-500">Total Requests</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
            {filteredProjects.length}
          </h2>
        </div>
      </div>

      {/* ====================================== */}
      {/* SEARCH + FILTER */}
      {/* ====================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Project Code, PI Name, or Project Title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
          >
            <option value="All">All Requests</option>

            <option value="Pending">Pending</option>

            <option value="Approved">Approved</option>

            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Project Code
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Project Title
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  PI Name
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Fund Head
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Current Balance
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Requested Amount
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Balance After Approval
                </th>

                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                  Department
                </th>

                <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  Status
                </th>

                <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  Advertisement
                </th>

                <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  Approval Letter
                </th>

                <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            {/* ====================================== */}
            {/* TABLE BODY */}
            {/* ====================================== */}

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center p-10 text-gray-500">
                    Loading recruitment requests...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center p-10 text-gray-500">
                    No recruitment requests found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const isFinal =
                    project.status === "Approved" ||
                    project.status === "Rejected";

                  const currentBalance =
                    project.status === "Pending"
                      ? (project.fundHeadAmount || 0) +
                        (project.requestedAmount || 0)
                      : project.fundHeadAmount || 0;
                  const remainingFund = project.fundHeadAmount || 0;

                  return (
                    <tr
                      key={project._id}
                      className="border-b border-gray-100 hover:bg-blue-50/40 transition duration-200"
                    >
                      {/* PROJECT CODE */}

                      <td className="px-6 py-6 font-semibold text-gray-800">
                        {project.projectCode}
                      </td>

                      {/* PROJECT TITLE */}

                      <td className="px-6 py-6">
                        <div className="font-semibold text-gray-800">
                          {project.projectTitle}
                        </div>
                      </td>

                      {/* PI NAME */}

                      <td className="px-6 py-6">
                        <div className="font-medium">{project.piName}</div>
                      </td>

                      {/* FUND HEAD */}

                      <td className="px-6 py-6">
                        <div className="max-w-[180px] text-gray-700">
                          {project.fundHead || "-"}
                        </div>
                      </td>

                      {/* Current Balance */}

                      <td className="px-6 py-6">
                        <div className="font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl inline-block">
                          ₹
                          {currentBalance?.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          }) || 0}
                        </div>
                      </td>

                      {/* REQUESTED Amount */}

                      <td className="px-6 py-6">
                        <div className="font-semibold text-orange-600 bg-orange-50 px-3 py-2 rounded-xl inline-block">
                          ₹
                          {project.requestedAmount?.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          }) || 0}
                        </div>
                      </td>

                      {/* Balance After Approval */}
                      <td className="px-6 py-6">
                        <div className="font-bold px-3 py-2 rounded-xl inline-block bg-green-50 text-green-700">
                          ₹
                          {remainingFund.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}
                        </div>
                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-6 py-6">
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {project.piDepartment}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-6 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(
                            project.status,
                          )}`}
                        >
                          {project.status}
                        </span>
                      </td>

                      {/* VIEW PDF */}

                      <td className="px-6 py-6 text-center">
                        <button
                          onClick={() => viewPDF(project.pdfPath)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition"
                        >
                          View Ad
                        </button>
                      </td>

                      {/* APPROVAL LETTER PDF */}

                      <td className="px-6 py-6 text-center">
                        {project.approvalLetterPath ? (
                          <button
                            onClick={() =>
                              viewPDF(
                                project.approvalLetterPath.replace(
                                  "/generated-pdfs/",
                                  "",
                                ),
                              )
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition"
                          >
                            View Letter
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not Available
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <button
                            disabled={isFinal}
                            onClick={() => {
                              setSelectedProject(project);
                              setShowApproveModal(true);
                            }}
                            className={`w-24 px-4 py-2 rounded-xl font-medium transition shadow-sm ${
                              isFinal
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            }`}
                          >
                            Approve
                          </button>

                          <button
                            disabled={isFinal}
                            onClick={() => {
                              setSelectedProject(project);
                              setShowRejectModal(true);
                            }}
                            className={`w-24 px-4 py-2 rounded-xl font-medium transition shadow-sm ${
                              isFinal
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {showApproveModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Approve Recruitment</h2>

                <p className="text-sm text-gray-600 mb-4">
                  Upload Dean's signing key to digitally sign approval
                </p>

                <input
                  type="file"
                  accept=".pem"
                  onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                  className="w-full border rounded-xl p-3 mb-5"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowApproveModal(false);
                      setPrivateKeyFile(null);
                    }}
                    className="px-4 py-2 rounded-xl border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => approveRecruitment(selectedProject)}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl"
                  >
                    Confirm Approve
                  </button>
                </div>
              </div>
            </div>
          )}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-[450px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-red-600">
                  Reject Recruitment
                </h2>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border rounded-xl p-3 h-28 mb-4 resize-none"
                />

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Dean Signing Key (.pem) *
                </label>
                <input
                  type="file"
                  accept=".pem"
                  onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                  className="w-full border rounded-xl p-3 mb-5"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                      setPrivateKeyFile(null);
                    }}
                    className="px-4 py-2 rounded-xl border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => rejectRecruitment(selectedProject)}
                    className="px-5 py-2 bg-red-600 text-white rounded-xl"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardDORD;
