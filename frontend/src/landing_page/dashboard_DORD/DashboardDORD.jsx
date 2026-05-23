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

      const res = await axios.get("http://localhost:5000/api/recruitment");

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

      await axios.put(`http://localhost:5000/api/recruitment/${id}/approve`);

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

      await axios.put(`http://localhost:5000/api/recruitment/${id}/reject`);

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

    window.open(`http://localhost:5000/generated-pdfs/${pdfName}`, "_blank");
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="p-6">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Dean Recruitment Dashboard</h2>

        <p className="text-gray-500">
          Total Requests: {filteredProjects.length}
        </p>
      </div>

      {/* ====================================== */}
      {/* SEARCH + FILTER */}
      {/* ====================================== */}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Project Code, PI Name, or Project Title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/2 outline-none"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg cursor-pointer outline-none"
        >
          <option value="All">All</option>

          <option value="Pending">Pending</option>

          <option value="Approved">Approved</option>

          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Project Code</th>

              <th className="p-4 text-left">Project Title</th>

              <th className="p-4 text-left">PI Name</th>

              <th className="p-4 text-left">Department</th>

              <th className="p-4 text-center">Status</th>

              <th className="p-4 text-center">PDF</th>

              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  No recruitment requests found
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                const isFinal =
                  project.status === "Approved" ||
                  project.status === "Rejected";

                return (
                  <tr key={project._id} className="border-t hover:bg-gray-50">
                    {/* PROJECT CODE */}

                    <td className="p-4">{project.projectCode}</td>

                    {/* PROJECT TITLE */}

                    <td className="p-4">{project.projectTitle}</td>

                    {/* PI NAME */}

                    <td className="p-4">{project.piName}</td>

                    {/* DEPARTMENT */}

                    <td className="p-4">{project.piDepartment}</td>

                    {/* STATUS */}

                    <td className="p-4 text-center">
                      <span
                        className={`text-white px-3 py-1 rounded-full text-xs ${getStatusColor(
                          project.status,
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>

                    {/* VIEW PDF */}

                    <td className="p-4 text-center">
                      <button
                        onClick={() => viewPDF(project.pdfPath)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        View PDF
                      </button>
                    </td>

                    {/* ACTIONS */}

                    <td className="p-4 text-center space-x-2">
                      <button
                        disabled={isFinal}
                        onClick={() => approveRecruitment(project._id)}
                        className={`px-3 py-1 rounded text-sm ${
                          isFinal
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        }`}
                      >
                        Approve
                      </button>

                      <button
                        disabled={isFinal}
                        onClick={() => rejectRecruitment(project._id)}
                        className={`px-3 py-1 rounded text-sm ${
                          isFinal
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        }`}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardDORDPreview;
