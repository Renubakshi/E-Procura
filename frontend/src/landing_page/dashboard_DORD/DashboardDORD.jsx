import { useEffect, useState } from "react";
import axios from "axios";
import {
  readPem,
  importPrivateKey,
  signData,
  canonicalPayload,
} from "../../utils/digitalSignature";

function DashboardDORD() {
  // ── tab ──
  const [activeTab, setActiveTab] = useState("recruitment");

  // ── recruitment state (unchanged) ──
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [privateKeyFile, setPrivateKeyFile] = useState(null);
  const [signedPdfFile, setSignedPdfFile] = useState(null);
  const [errors, setErrors] = useState({ privateKey: "", signedPdf: "" });
  const [rejectErrors, setRejectErrors] = useState({ reason: "", privateKey: "" });

  // ── fund booking state ──
  const [fundBookings, setFundBookings] = useState([]);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbFilter, setFbFilter] = useState("All");
  const [fbSearch, setFbSearch] = useState("");
  const [fbSelectedBooking, setFbSelectedBooking] = useState(null);
  const [fbShowApproveModal, setFbShowApproveModal] = useState(false);
  const [fbShowRejectModal, setFbShowRejectModal] = useState(false);
  const [fbSignedPdfFile, setFbSignedPdfFile] = useState(null);
  const [fbRejectRemark, setFbRejectRemark] = useState("");
  const [fbApproveError, setFbApproveError] = useState("");
  const [fbRejectError, setFbRejectError] = useState("");

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
      const newErrors = {};
      if (!privateKeyFile) {
        newErrors.privateKey = "Please upload Dean Signing key";
      }

      if (!signedPdfFile) {
        newErrors.signedPdf = "Please upload signed approval PDF";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});

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

      const formData = new FormData();

      formData.append("signedPdf", signedPdfFile);

      formData.append("payload", JSON.stringify(payload));

      formData.append("signatureDean", signatureDean);

      await axios.put(
        `http://localhost:5001/api/recruitment/${project._id}/approve`,
        formData,
      );

      alert("Recruitment Approved Successfully");

      setShowApproveModal(false);
      setPrivateKeyFile(null);
      setSelectedProject(null);
      // await axios.put(`/api/recruitment/${id}/approve`);

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
      // await axios.put(`/api/recruitment/${id}/reject`);

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
        `http://localhost:5001/api/recruitment/${project._id}/reject`,
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
  // FUND BOOKING — fetch all
  // ======================================

  const fetchFundBookings = async () => {
    try {
      setFbLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/fund-booking/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFundBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFbLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "fundBooking") fetchFundBookings();
  }, [activeTab]);

  // ======================================
  // FUND BOOKING — approve (with PDF)
  // ======================================

  const approveFundBooking = async () => {
    if (!fbSignedPdfFile) {
      setFbApproveError("Please upload the signed approval PDF");
      return;
    }
    if (!window.confirm("Approve this fund booking request?")) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("signedPdf", fbSignedPdfFile);
      const res = await fetch(`/api/fund-booking/${fbSelectedBooking._id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Fund booking approved");
      setFbShowApproveModal(false);
      setFbSignedPdfFile(null);
      setFbSelectedBooking(null);
      setFbApproveError("");
      fetchFundBookings();
    } catch (err) {
      alert(err.message || "Approval failed");
    }
  };

  // ======================================
  // FUND BOOKING — reject (with remark)
  // ======================================

  const rejectFundBooking = async () => {
    if (!fbRejectRemark.trim()) {
      setFbRejectError("Please enter a rejection reason");
      return;
    }
    if (!window.confirm("Reject this fund booking request?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/fund-booking/${fbSelectedBooking._id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remarkByDean: fbRejectRemark }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Fund booking rejected");
      setFbShowRejectModal(false);
      setFbRejectRemark("");
      setFbSelectedBooking(null);
      setFbRejectError("");
      fetchFundBookings();
    } catch (err) {
      alert(err.message || "Rejection failed");
    }
  };

  // ======================================
  // FUND BOOKING — filtered list
  // ======================================

  const filteredFundBookings = fundBookings.filter((b) => {
    const matchSearch =
      b.projectCode?.toLowerCase().includes(fbSearch.toLowerCase()) ||
      b.requestedBy?.toLowerCase().includes(fbSearch.toLowerCase()) ||
      b.head?.toLowerCase().includes(fbSearch.toLowerCase());
    const matchFilter = fbFilter === "All" ? true : b.status === fbFilter;
    return matchSearch && matchFilter;
  });

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
            {activeTab === "recruitment" ? filteredProjects.length : filteredFundBookings.length}
          </h2>
        </div>
      </div>

      {/* ====================================== */}
      {/* TAB SWITCHER */}
      {/* ====================================== */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("recruitment")}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
            activeTab === "recruitment"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Recruitment Requests
        </button>
        <button
          onClick={() => setActiveTab("fundBooking")}
          className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
            activeTab === "fundBooking"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Fund Booking Requests
        </button>
      </div>

      {/* ====================================== */}
      {/* FUND BOOKING TAB */}
      {/* ====================================== */}
      {activeTab === "fundBooking" && (
        <div>
          {/* Search + Filter */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by Project Code, PI Email, or Budget Head"
                value={fbSearch}
                onChange={(e) => setFbSearch(e.target.value)}
                className="flex-1 border border-gray-300 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <select
                value={fbFilter}
                onChange={(e) => setFbFilter(e.target.value)}
                className="border border-gray-300 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                  <tr>
                    {["Project Code", "Project Title", "Budget Head", "Requested Amount", "Current Balance", "Balance After Approval", "Process", "Requested By", "Status", "Signed PDF", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fbLoading ? (
                    <tr><td colSpan="11" className="text-center p-10 text-gray-500">Loading fund booking requests...</td></tr>
                  ) : filteredFundBookings.length === 0 ? (
                    <tr><td colSpan="11" className="text-center p-10 text-gray-500">No fund booking requests found</td></tr>
                  ) : (
                    filteredFundBookings.map((booking) => {
                      const isFinal = booking.status === "Approved" || booking.status === "Rejected";
                      return (
                        <tr key={booking._id} className="border-b border-gray-100 hover:bg-blue-50/40 transition">
                          <td className="px-6 py-5 font-semibold text-gray-800">{booking.projectCode}</td>
                          <td className="px-6 py-5 text-gray-700 text-sm max-w-[180px]">
                            {booking.projectId?.piSubmissions?.title || "—"}
                          </td>
                          <td className="px-6 py-5">{booking.head}</td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-xl">
                              ₹{booking.requestedAmount?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
                              ₹{(booking.projectId?.piSubmissions?.divisionHeads?.[booking.head] ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-xl">
                              ₹{((booking.projectId?.piSubmissions?.divisionHeads?.[booking.head] ?? 0) - (booking.requestedAmount || 0)).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                          </td>
                          <td className="px-6 py-5 capitalize">{booking.process?.replace(/_/g, " ") || "-"}</td>
                          <td className="px-6 py-5 text-gray-600 text-xs">{booking.requestedBy}</td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            {booking.status === "Rejected" && booking.remarkByDean && (
                              <p className="text-xs text-red-600 mt-1 max-w-[160px]">"{booking.remarkByDean}"</p>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {booking.signedApprovalPdf ? (
                              <button
                                onClick={() => window.open(booking.signedApprovalPdf, "_blank")}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition"
                              >
                                View PDF
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">Not uploaded</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <button
                                disabled={isFinal}
                                onClick={() => { setFbSelectedBooking(booking); setFbSignedPdfFile(null); setFbApproveError(""); setFbShowApproveModal(true); }}
                                className={`px-4 py-2 rounded-xl text-xs font-medium transition ${isFinal ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                              >
                                Approve
                              </button>
                              <button
                                disabled={isFinal}
                                onClick={() => { setFbSelectedBooking(booking); setFbRejectRemark(""); setFbRejectError(""); setFbShowRejectModal(true); }}
                                className={`px-4 py-2 rounded-xl text-xs font-medium transition ${isFinal ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
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
            </div>
          </div>

          {/* Approve Modal */}
          {fbShowApproveModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
                <h2 className="text-xl font-bold mb-1">Approve Fund Booking</h2>
                <p className="text-sm text-gray-500 mb-1">Project: <span className="font-semibold text-gray-700">{fbSelectedBooking?.projectCode}</span></p>
                <p className="text-sm text-gray-500 mb-4">Head: <span className="font-semibold text-gray-700">{fbSelectedBooking?.head}</span></p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Signed Approval PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => { setFbSignedPdfFile(e.target.files[0]); setFbApproveError(""); }}
                  className="w-full border rounded-xl p-3 mb-1"
                />
                {fbApproveError && <p className="text-red-500 text-sm mb-3">{fbApproveError}</p>}
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { setFbShowApproveModal(false); setFbSignedPdfFile(null); }} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">Cancel</button>
                  <button onClick={approveFundBooking} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Confirm Approve</button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {fbShowRejectModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
                <h2 className="text-xl font-bold mb-1 text-red-600">Reject Fund Booking</h2>
                <p className="text-sm text-gray-500 mb-4">Project: <span className="font-semibold text-gray-700">{fbSelectedBooking?.projectCode}</span> — {fbSelectedBooking?.head}</p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter reason for rejection..."
                  value={fbRejectRemark}
                  onChange={(e) => { setFbRejectRemark(e.target.value); setFbRejectError(""); }}
                  className="w-full border rounded-xl p-3 h-28 resize-none outline-none focus:ring-2 focus:ring-red-400"
                />
                {fbRejectError && <p className="text-red-500 text-sm mt-1">{fbRejectError}</p>}
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { setFbShowRejectModal(false); setFbRejectRemark(""); }} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">Cancel</button>
                  <button onClick={rejectFundBooking} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">Confirm Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================== */}
      {/* RECRUITMENT TAB (existing) */}
      {/* ====================================== */}
      {activeTab === "recruitment" && <>

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

                              setPrivateKeyFile(null);
                              setSignedPdfFile(null);

                              setErrors({
                                privateKey: "",
                                signedPdf: "",
                              });

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
              <div className="bg-white rounded-2xl p-6 w-[450px] shadow-2xl">
                <h2 className="text-2xl font-bold mb-2">Approve Recruitment</h2>

                <p className="text-sm text-gray-600 mb-4">
                  Upload Dean's signing key to digitally sign approval
                </p>

                {/* ====================================== */}
                {/* PRIVATE KEY */}
                {/* ====================================== */}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Dean Private Key (.pem) *
                  </label>

                  <input
                    type="file"
                    accept=".pem"
                    onChange={(e) => {
                      setPrivateKeyFile(e.target.files[0]);

                      setErrors((prev) => ({
                        ...prev,
                        privateKey: "",
                      }));
                    }}
                    className="w-full border rounded-xl p-3"
                  />

                  {errors.privateKey && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.privateKey}
                    </p>
                  )}
                </div>

                {/* ====================================== */}
                {/* SIGNED PDF */}
                {/* ====================================== */}

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Signed Approval PDF (.pdf) *
                  </label>

                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      setSignedPdfFile(e.target.files[0]);

                      setErrors((prev) => ({
                        ...prev,
                        signedPdf: "",
                      }));
                    }}
                    className="w-full border rounded-xl p-3"
                  />

                  {errors.signedPdf && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.signedPdf}
                    </p>
                  )}
                </div>

                {/* ====================================== */}
                {/* ACTION BUTTONS */}
                {/* ====================================== */}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowApproveModal(false);

                      setPrivateKeyFile(null);
                      setSignedPdfFile(null);

                      setErrors({
                        privateKey: "",
                        signedPdf: "",
                      });
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => approveRecruitment(selectedProject)}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
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
                <h2 className="text-2xl font-bold mb-2 text-red-600">
                  Reject Recruitment
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  Provide rejection reason and digitally sign the decision
                </p>

                {/* ====================================== */}
                {/* REJECTION REASON */}
                {/* ====================================== */}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason *
                  </label>

                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);

                      setRejectErrors((prev) => ({
                        ...prev,
                        reason: "",
                      }));
                    }}
                    className="w-full border rounded-xl p-3 h-28 resize-none"
                  />

                  {rejectErrors.reason && (
                    <p className="text-red-500 text-sm mt-1">
                      {rejectErrors.reason}
                    </p>
                  )}
                </div>

                {/* ====================================== */}
                {/* PRIVATE KEY */}
                {/* ====================================== */}

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Dean Private Key (.pem) *
                  </label>

                  <input
                    type="file"
                    accept=".pem"
                    onChange={(e) => {
                      setPrivateKeyFile(e.target.files[0]);

                      setRejectErrors((prev) => ({
                        ...prev,
                        privateKey: "",
                      }));
                    }}
                    className="w-full border rounded-xl p-3"
                  />

                  {rejectErrors.privateKey && (
                    <p className="text-red-500 text-sm mt-1">
                      {rejectErrors.privateKey}
                    </p>
                  )}
                </div>

                {/* ====================================== */}
                {/* ACTION BUTTONS */}
                {/* ====================================== */}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);

                      setRejectReason("");
                      setPrivateKeyFile(null);

                      setRejectErrors({
                        reason: "",
                        privateKey: "",
                      });
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => rejectRecruitment(selectedProject)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </> }
    </div>
  );
}

export default DashboardDORD;
