import { useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";

export default function ProjectSummary() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
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

        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (loading) return <p className="p-10 text-gray-700">Loading...</p>;
  if (!project) return <p className="p-10 text-gray-700">No project found</p>;

  // Open File with Tamper Detection
  const openFile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/files/${project._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("res", res);

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "⚠ FILE INTEGRITY COMPROMISED!");
        return;
      }
      //  Convert response to blob
      const blob = await res.blob();

      // Create temporary URL
      const fileURL = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(fileURL, "_blank");
    } catch (err) {
      alert("Unable to open file");
    }
  };

  return (
    <div className="min-h-screen bg-[#d6e3da] p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Project Summary</h1>
        <div className="flex justify-end m-4">
          <BackButton />
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <span className="font-semibold">Title:</span>{" "}
            {project.piSubmissions?.title}
          </p>
          <p>
            <span className="font-semibold">Project Code:</span>{" "}
            {project.projectCode}
          </p>
          <p>
            <span className="font-semibold">Bank Transaction ID:</span>{" "}
            {project.bankTransactionId}
          </p>
          <p>
            <span className="font-semibold">Department:</span>{" "}
            {project.department}
          </p>
          <p>
            <span className="font-semibold">PI Name:</span> {project.piName}
          </p>
          <p>
            <span className="font-semibold">Total Fund Received:</span> ₹
            {project.totalFundReceived}
          </p>
          <p>
            <span className="font-semibold">Available Fund:</span> ₹
            {project.availableFunds}
          </p>
          <p>
            <span className="font-semibold">Bifurcation Year:</span>{" "}
            {project.year}
          </p>
        </div>
      </div>

      {/* DIVISION HEADS */}
      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Head-wise Fund Allocation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Object.entries(project.piSubmissions?.divisionHeads || {}).map(
            ([key, value]) => (
              <div
                key={key}
                className="border rounded-xl p-4 bg-gray-50 hover:shadow transition"
              >
                <p className="text-gray-600 font-medium">{key}</p>
                <p className="text-xl font-bold text-gray-800">₹{value}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Attachment */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Attached Document
        </h3>

        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg border">
          <div>
            <p className="text-gray-700 font-medium">
              {project.attachmentOriginalName}
            </p>
            <p className="text-sm text-gray-500">Uploaded</p>
          </div>

          <div className="flex gap-3">
            {/* View */}
            <a onClick={openFile} className="btn-primary">
              View Document
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div className="flex items-center bg-green-50 border border-green-300 mt-6 rounded-lg shadow-sm">
        <img
          src="../../assets/signed-badge.jpg"
          alt="Signed Badge"
          className="h-20 object-contain"
        />
        {/* Text */}
        <div className="text-sm">
          <p className="font-semibold text-green-700">
            Signed by : <span className="font-medium">{project.signedBy}</span>
          </p>
          <p className="text-green-600 text-xs">Verified Signature</p>
        </div>
      </div>

      <div className="flex items-center bg-green-50 border border-green-300 mt-6 rounded-lg shadow-sm">
        {/* Image Badge */}
        <img
          src="../../assets/signed-badge.jpg"
          alt="Signed Badge"
          className="h-20 object-contain"
        />

        {/* Text */}
        <div className="text-sm">
          <p className="font-semibold text-green-700">
            Submitted by: <span className="font-medium">{project.piName}</span>
          </p>
          <p className="text-green-600 text-xs">Verified Signature</p>
        </div>
      </div>
    </div>
  );
}
