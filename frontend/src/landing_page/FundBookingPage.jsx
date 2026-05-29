import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ManpowerHiringForm from "./process_forms/ManpowerHiringForms";

export default function FundBookingPage() {
  const { id } = useParams(); // id from route
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState("");
  const [selectedHead, setSelectedHead] = useState("");

  // process option
  const processOptions = [
    {
      label: "Purchase of Material Procurement > 1 Lakh",
      value: "purchase_gt_1L",
    },
    {
      label: "Purchase of Material Procurement < 1 Lakh",
      value: "purchase_lt_1L",
    },
    {
      label: "Project Staff recruitment (Man power Hiring)",
      value: "manpower_hiring",
    },
    {
      label: "Chair Person",
      value: "chair_person",
    },
    {
      label: "Event Budget Approval",
      value: "event_budget",
    },
    {
      label: "Participants Accommodation Approval",
      value: "accommodation",
    },
    {
      label: "Internship Approval",
      value: "internship",
    },
    {
      label: "TA/DA Approval",
      value: "tada",
    },
    {
      label: "Travel Booking / Cab Requisition",
      value: "travel",
    },
    {
      label: "NOC issue / Attendance",
      value: "noc_attendance",
    },
    {
      label: "Advance taking",
      value: "advance_take",
    },
    {
      label: "Advance Settlement",
      value: "advance_settlement",
    },
    {
      label: "Tenure Extension",
      value: "tenure_extension",
    },
    {
      label: "Direct Purchase",
      value: "direct_purchase",
    },
    {
      label: "Reimbursement",
      value: "reimbursement",
    },
    {
      label: "Event / Workshop Expenses",
      value: "event_expense",
    },
  ];

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Unable to fetch project");
        return;
      }

      const data = await res.json();
      console.log("code creation data", data);

      setProjectData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  if (loading) return <p className="p-10 text-gray-700">Loading...</p>;
  if (!projectData)
    return <p className="p-10 text-gray-700">No project found</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {/* HEADER */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Complete the Processes
        </h2>

        {/* Project Code */}
        <p className="mb-6 text-gray-600">
          <span className="font-semibold">Project Code:</span>{" "}
          {projectData.projectCode}
        </p>
        {/* Project title */}
        <p className="mb-6 text-gray-600">
          <span className="font-semibold">Project Title:</span>{" "}
          {projectData.piSubmissions?.title}
        </p>

        {/* Select Head */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Select Fund Head</label>

          <select
            value={selectedHead}
            onChange={(e) => setSelectedHead(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Head</option>

            {Object.entries(projectData.piSubmissions?.divisionHeads || {}).map(
              ([key, value]) => (
                <option key={key} value={key}>
                  {key} ( ₹
                  {value.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                  )
                </option>
              ),
            )}
          </select>

          {selectedHead && (
            <p className="mt-2 text-sm text-gray-600">
              Available Fund: ₹
              {projectData.piSubmissions?.divisionHeads[
                selectedHead
              ]?.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}
            </p>
          )}
        </div>

        {/* Select Process */}
        <div className="mb-6">
          <label className="block text-gray-600 mb-1">Select Process</label>

          <select
            value={process}
            onChange={(e) => setProcess(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Process</option>
            {processOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* MANPOWER FORM */}
        {process === "manpower_hiring" && selectedHead && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Manpower Hiring Details
            </h3>

            <ManpowerHiringForm
              projectData={projectData}
              process={process}
              selectedHead={selectedHead}
              selectedHeadAmount={
                projectData.piSubmissions?.divisionHeads[selectedHead]
              }
              refreshProject={fetchProject}
            />
          </div>
        )}
        {process && process !== "manpower_hiring" &&(
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          🚧 Coming Soon
        </h1>

        <p className="text-gray-600 text-lg">
          This process module is currently under development.
        </p>

        <p className="text-gray-500 mt-2">
          Please check back later.
        </p>
      </div>
    </div>
  )
}
      </div>
    </div>
  );
}
