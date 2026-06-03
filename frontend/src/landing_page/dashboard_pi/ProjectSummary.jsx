import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";

export default function ProjectSummary() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { alert("Unable to fetch project"); return; }
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

  const openFile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/files/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "⚠ FILE INTEGRITY COMPROMISED!");
        return;
      }
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (err) {
      alert("Unable to open file");
    }
  };

  const infoFields = [
    { label: "Title", value: project.piSubmissions?.title },
    { label: "Project Code", value: project.projectCode },
    { label: "Bank Transaction ID", value: project.bankTransactionId },
    { label: "Department", value: project.department },
    { label: "PI Name", value: project.piName },
    { label: "Total Fund Received", value: `₹${project.totalFundReceived?.toLocaleString()}` },
    { label: "Available Fund", value: `₹${project.piSubmissions?.availableFunds?.toLocaleString() ?? project.availableFunds?.toLocaleString()}` },
    { label: "Bifurcation Year", value: project.year },
  ];

  return (
    <div className="min-h-screen bg-[#d6e3da] p-4 sm:p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          Project Summary
        </h1>
        <BackButton />
      </div>

      {/* BASIC INFO */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-base text-gray-700">
          {infoFields.map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-semibold text-gray-500 shrink-0">{label}:</span>
              <span className="text-gray-800 break-words">{value ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DIVISION HEADS */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Head-wise Fund Allocation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(project.piSubmissions?.divisionHeads || {}).map(([key, value]) => (
            <div
              key={key}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow transition"
            >
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1">{key}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                ₹{Number(value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ATTACHED DOCUMENT */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">
          Attached Document
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div>
            <p className="text-gray-800 font-medium text-sm sm:text-base break-words">
              {project.piSubmissions?.attachmentOriginalName || project.attachmentOriginalName || "Document"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Uploaded file</p>
          </div>
          <button
            onClick={openFile}
            className="shrink-0 px-4 py-2 bg-[#124559] hover:bg-[#01161e] text-white text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            View Document
          </button>
        </div>
      </div>

      {/* SIGNATURE BADGES */}
      <div className="flex flex-col gap-3">
        {[
          { label: "Signed by", name: project.signedBy },
          { label: "Submitted by", name: project.piName },
        ].map(({ label, name }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl shadow-sm p-3 sm:p-4"
          >
            <img
              src="/assets/signed-badge.jpg"
              alt="Signed Badge"
              className="h-12 sm:h-16 w-auto object-contain shrink-0"
            />
            <div>
              <p className="font-semibold text-green-700 text-sm sm:text-base">
                {label}: <span className="font-medium">{name || "—"}</span>
              </p>
              <p className="text-green-600 text-xs mt-0.5">Verified Signature</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
