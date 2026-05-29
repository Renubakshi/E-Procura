import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PIRequestsList() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/fund-booking", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRequests(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "";
    }
  };

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">My Fund Requests</h2>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Project Code</th>
              <th className="p-3 border">Budget Head</th>
              <th className="p-3 border">Requested Amount</th>
              <th className="p-3 border">Process</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Remark By Dean</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="text-center">
                <td className="p-3 border">{req.projectCode}</td>

                <td className="p-3 border">{req.head}</td>

                <td className="p-3 border">
                  ₹ {req.requestedAmount?.toLocaleString()}
                </td>

                <td className="p-3 border capitalize">{req.process}</td>

                <td
                  className={`p-3 border font-semibold ${getStatusStyle(
                    req.status,
                  )}`}
                >
                  {req.status === "Pending" && "⏳ Pending"}

                  {req.status === "Approved" && "✅ Approved"}

                  {req.status === "Rejected" && "❌ Rejected"}
                </td>

                <td className="p-3 border text-sm text-gray-700">
                  {req.remarkByDean || "-"}
                </td>

                <td className="p-3 border">
                  {/* Rejected */}
                  {req.status === "Rejected" && (
                    <button
                      onClick={() => navigate(`/fund-booking/${req.projectId}`)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reapply
                    </button>
                  )}

                  {/* Approved manpower */}
                  {req.status === "Approved" && req.process === "manpower" && (
                    <button
                      onClick={() => navigate(`/manpower-hiring`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Fill Recruitment Form
                    </button>
                  )}

                  {/* Pending */}
                  {req.status === "Pending" && (
                    <span className="text-gray-500">No Action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
