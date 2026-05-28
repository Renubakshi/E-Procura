// //--------------------DORD dashboard with (Dummy data)-----------------------

// import { useState } from "react";

// function DashboardDORDPreview() {
//   const [projects, setProjects] = useState([
//     {
//       projectId: "CSE-101",
//       title: "AI Research",
//       piName: "Dr. Sharma",
//       totalFund: 500000,
//       status: "Approved by R&D", // Pending
//     },
//     {
//       projectId: "ECE-202",
//       title: "IoT System",
//       piName: "Dr. Verma",
//       totalFund: 300000,
//       status: "Pending DORD Approval", // Pending
//     },
//     {
//       projectId: "MECH-303",
//       title: "Robotics Lab",
//       piName: "Dr. Singh",
//       totalFund: 800000,
//       status: "Approved by DORD", // Approved
//     },
//     {
//       projectId: "CIVIL-404",
//       title: "Bridge Design",
//       piName: "Dr. Patel",
//       totalFund: 600000,
//       status: "Rejected by DORD", // Rejected
//     },
//     {
//       projectId: "ELEC-505",
//       title: "Smart Grid",
//       piName: "Dr. Rao",
//       totalFund: 750000,
//       status: "Fully Approved", // Approved
//     },
//     {
//       projectId: "CSE-106",
//       title: "Machine Learning Optimization",
//       piName: "Dr. Mehta",
//       totalFund: 450000,
//       status: "Approved by R&D",
//     },
//     {
//       projectId: "ECE-207",
//       title: "Wireless Sensor Networks",
//       piName: "Dr. Iyer",
//       totalFund: 320000,
//       status: "Pending DORD Approval",
//     },
//     {
//       projectId: "MECH-308",
//       title: "Thermal Engineering Study",
//       piName: "Dr. Khan",
//       totalFund: 700000,
//       status: "Approved by DORD",
//     },
//     {
//       projectId: "CIVIL-409",
//       title: "Urban Infrastructure Design",
//       piName: "Dr. Gupta",
//       totalFund: 650000,
//       status: "Rejected by DORD",
//     },
//     {
//       projectId: "ELEC-510",
//       title: "Power Electronics Lab",
//       piName: "Dr. Nair",
//       totalFund: 550000,
//       status: "Fully Approved",
//     },
//     {
//       projectId: "CSE-611",
//       title: "Blockchain Security",
//       piName: "Dr. Roy",
//       totalFund: 480000,
//       status: "Approved by R&D",
//     },
//     {
//       projectId: "ECE-712",
//       title: "Embedded Systems Design",
//       piName: "Dr. Thomas",
//       totalFund: 360000,
//       status: "Pending DORD Approval",
//     },
//     {
//       projectId: "MECH-813",
//       title: "Automobile Innovation",
//       piName: "Dr. Bansal",
//       totalFund: 820000,
//       status: "Approved by DORD",
//     },
//     {
//       projectId: "CIVIL-914",
//       title: "Earthquake Resistant Structures",
//       piName: "Dr. Reddy",
//       totalFund: 900000,
//       status: "Fully Approved",
//     },
//     {
//       projectId: "ELEC-1015",
//       title: "Renewable Energy Systems",
//       piName: "Dr. Chatterjee",
//       totalFund: 770000,
//       status: "Pending DORD Approval",
//     },
//   ]);

//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");

//   // 🔥 Map backend → UI
//   const getDisplayStatus = (status) => {
//     if (status?.includes("DORD")) {
//       if (status.includes("Approved")) return "Approved";
//       if (status.includes("Rejected")) return "Rejected";
//     }
//     return "Pending";
//   };

//   const updateStatus = (projectId, action) => {
//     if (!window.confirm("Are you sure?")) return;

//     setProjects((prev) =>
//       prev.map((p) => {
//         if (p.projectId === projectId) {
//           let newStatus =
//             action === "approve" ? "Approved by DORD" : "Rejected by DORD";

//           if (p.status === "Approved by R&D" && action === "approve")
//             newStatus = "Fully Approved";

//           return { ...p, status: newStatus };
//         }
//         return p;
//       }),
//     );
//   };

//   const getStatusColor = (status) => {
//     if (status === "Approved") return "bg-green-500";
//     if (status === "Rejected") return "bg-red-500";
//     return "bg-yellow-500"; // Pending
//   };

//   const filteredProjects = projects.filter((p) => {
//     const displayStatus = getDisplayStatus(p.status);

//     const matchSearch =
//       p.projectId.toLowerCase().includes(search.toLowerCase()) ||
//       p.piName.toLowerCase().includes(search.toLowerCase());

//     const matchFilter = filter === "All" ? true : displayStatus === filter;

//     return matchSearch && matchFilter;
//   });

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold">DORD Dashboard (Preview)</h2>
//         <p className="text-gray-500">
//           Total Projects: {filteredProjects.length}
//         </p>
//       </div>

//       {/* Search + Filter */}
//       <div className="flex gap-4 mb-4">
//         <input
//           type="text"
//           placeholder="Search by Project ID or PI"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border px-3 py-2 rounded-lg w-1/3"
//         />

//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           className="border px-3 py-2 rounded-lg cursor-pointer"
//         >
//           <option value="All">All</option>
//           <option value="Pending">Pending</option>
//           <option value="Approved">Approved</option>
//           <option value="Rejected">Rejected</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border border-gray-300 rounded-lg">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2">Project ID</th>
//               <th className="p-2">Title</th>
//               <th className="p-2">PI Name</th>
//               <th className="p-2">Amount</th>
//               <th className="p-2">Status</th>
//               <th className="p-2">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredProjects.map((p) => {
//               const displayStatus = getDisplayStatus(p.status);
//               const isFinal =
//                 displayStatus === "Approved" || displayStatus === "Rejected";

//               return (
//                 <tr key={p.projectId} className="text-center border-t">
//                   <td className="p-2">{p.projectId}</td>
//                   <td className="p-2">{p.title}</td>
//                   <td className="p-2">{p.piName}</td>
//                   <td className="p-2">
//                     ₹{Number(p.totalFund).toLocaleString()}
//                   </td>

//                   <td className="p-2">
//                     <span
//                       className={`text-white px-2 py-1 rounded text-xs ${getStatusColor(
//                         displayStatus,
//                       )}`}
//                     >
//                       {displayStatus}
//                     </span>
//                   </td>

//                   <td className="p-2 space-x-2">
//                     <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm cursor-pointer">
//                       View
//                     </button>

//                     <button
//                       disabled={isFinal}
//                       onClick={() => updateStatus(p.projectId, "approve")}
//                       className={`px-2 py-1 rounded text-sm ${
//                         isFinal
//                           ? "bg-gray-300"
//                           : "bg-green-500 text-white cursor-pointer"
//                       }`}
//                     >
//                       Approve
//                     </button>

//                     <button
//                       disabled={isFinal}
//                       onClick={() => updateStatus(p.projectId, "reject")}
//                       className={`px-2 py-1 rounded text-sm ${
//                         isFinal
//                           ? "bg-gray-300"
//                           : "bg-red-500 text-white cursor-pointer"
//                       }`}
//                     >
//                       Reject
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default DashboardDORDPreview;

import { useEffect, useState } from "react";
import axios from "axios";

function DashboardDORDPreview() {
  // ======================================
  // STATES
  // ======================================

  const [projects, setProjects] = useState([]);

  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

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

  const approveRecruitment = async (id) => {
    try {
      const confirmApprove = window.confirm(
        "Approve this recruitment request?",
      );

      if (!confirmApprove) return;

      await axios.put(`/api/recruitment/${id}/approve`);

      fetchRecruitments();
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // REJECT RECRUITMENT
  // ======================================

  const rejectRecruitment = async (id) => {
    try {
      const confirmReject = window.confirm("Reject this recruitment request?");

      if (!confirmReject) return;

      await axios.put(`/api/recruitment/${id}/reject`);

      fetchRecruitments();
    } catch (error) {
      console.log(error);
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

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            {/* ====================================== */}
            {/* TABLE HEAD */}
            {/* ====================================== */}

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
                  PDF
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
                          View PDF
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
                            onClick={() => approveRecruitment(project._id)}
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
                            onClick={() => rejectRecruitment(project._id)}
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
        </div>
      </div>
    </div>
  );
}

export default DashboardDORDPreview;
