import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL, axiosInstance } from "../../config/api";

export default function DashboardPI() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("name");

  const [projects, setProjects] = useState([]);
  const [searchCode, setSearchCode] = useState("");

  // Fetch PI projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {

        const res = await axiosInstance.get(`/api/projects/bifurcated`, {
        });

        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  // Search by project code
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const filteredProject = projects.filter((p) =>
    normalize(p.projectCode).includes(normalize(searchCode)),
  );

  return (
    <div className="min-h-screen bg-[#d6e3da] p-4 sm:p-6 md:p-8 ">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        {/* LEFT: Welcome */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{fullName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your projects and fund processes efficiently
          </p>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-center bg-white shadow rounded-full px-3 py-2 w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Project by Code...🔍"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1 outline-none text-sm px-2"
            />
          </div>

          <button
            className="btn-primary "
            onClick={() => navigate("/projects")}
          >
            + Add Fund Bifurcation
          </button>
        </div>
      </div>

      {/* BIFURCATED PROJECT LIST */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-gray-800">
        Bifurcated Projects for Fund Booking
      </h2>

      {filteredProject.length === 0 ? (
        <p className="text-gray-500">
          {searchCode ? "No matching projects found" : "No projects available"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {filteredProject.map((proj) => (
            <div
              key={proj._id}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {proj.piSubmissions?.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{proj.projectCode}</p>
              {/* STATUS BADGE */}
              <span className="inline-block mb-4 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                Bifurcated ✔
              </span>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
                <button
                  onClick={() => navigate(`/summary/${proj._id}`)}
                  className="border border-[#aec3b0] px-4 py-2 rounded-lg hover:bg-[#aec3b0] hover:text-black transition w-full sm:w-auto"
                >
                  View Summary
                </button>

                <button
                  onClick={() => navigate(`/fund-booking/${proj._id}`)}
                  className="btn-primary w-full sm:w-auto"
                >
                  Fund Booking
                </button>

                <button
                  className="btn-primary w-full sm:w-auto flex flex-col items-center"
                  onClick={() => navigate("/pi-fund-requests")}
                >
                  <span>Fund Booking Status</span>
                  <span className="text-xs text-gray-600">
                    Track pending, approved and rejected requests
                  </span>
                </button>
              </div>{" "}
            </div>
          ))}
        </div>
      )}

      {/* GENERAL PROCESSES */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 m-6">
          General Processes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* PROCESS CARD */}
          {[
            "No Dues Process",
            "Leave Approval",
            "NOC",
            "Reimbursement",
            "Advance",
            "Attendance",
          ].map((process) => (
            <div
              key={process}
              className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-lg cursor-pointer transition hover:bg-blue-50"
              onClick={() =>
                navigate(`/independent-process?process=${process}`)
              }
            >
              <p className="font-semibold text-gray-700">{process}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
