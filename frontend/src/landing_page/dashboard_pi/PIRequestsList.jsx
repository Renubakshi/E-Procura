import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function PIRequestsList() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const projectCode = searchParams.get("code");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [fbRes, recRes] = await Promise.all([
        fetch("/api/fund-booking", { headers }),
        fetch("/api/recruitment/my-requests", { headers }),
      ]);

      const [fbData, recData] = await Promise.all([
        fbRes.json(),
        recRes.json(),
      ]);

      const combined = [];

      // Fund Booking rows — filter by projectId ObjectId
      if (fbRes.ok && Array.isArray(fbData)) {
        fbData
          .filter((r) => (r.projectId?._id ?? r.projectId) === projectId)
          .forEach((r) => {
            const headBalance =
              r.projectId?.piSubmissions?.divisionHeads?.[r.head] ?? 0;
            combined.push({
              _id: r._id,
              type: "Fund Booking",
              projectCode: r.projectCode,
              projectTitle: r.projectId?.piSubmissions?.title || "—",
              head: r.head,
              requestedAmount: r.requestedAmount,
              headBalance,
              balanceAfterApproval: headBalance - (r.requestedAmount || 0),
              process: r.process?.replace(/_/g, " ") || "—",
              status: r.status,
              remark: r.remarkByDean || "",
              pdf: r.signedApprovalPdf || "",
            });
          });
      }

      // Recruitment rows — filter by projectCode string
      if (recRes.ok) {
        const recruitments = Array.isArray(recData)
          ? recData
          : recData.requests || [];

        recruitments
          .filter((r) => r.projectCode === projectCode)
          .forEach((r) => {
            combined.push({
              _id: r._id,
              type: "Manpower Hiring",
              projectCode: r.projectCode,
              projectTitle: r.projectTitle || "—",
              head: r.fundHead || "—",
              requestedAmount: r.requestedAmount,
              headBalance: r.fundHeadAmount ?? null,
              balanceAfterApproval:
                r.fundHeadAmount != null
                  ? r.fundHeadAmount - (r.requestedAmount || 0)
                  : null,
              process: "Manpower Hiring",
              status: r.status,
              remark: r.deanRemarks || r.deanDecision?.reason || "",
              pdf: r.signedApprovalPdf || "",
            });
          });
      }

      // Sort newest first (ObjectId has embedded timestamp)
      combined.sort((a, b) => (a._id < b._id ? 1 : -1));
      setRows(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "Approved") return "text-green-600";
    if (status === "Rejected") return "text-red-600";
    return "text-yellow-600";
  };

  const statusLabel = (status) => {
    if (status === "Approved") return "✅ Approved";
    if (status === "Rejected") return "❌ Rejected";
    return "⏳ Pending";
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <BackButton />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
          Fund Booking Status
        </h2>
        {projectCode && (
          <p className="text-sm text-gray-500 mb-4">
            Project: <span className="font-semibold text-gray-700">{projectCode}</span>
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Project Code</th>
                <th className="p-3 border text-left">Project Title</th>
                <th className="p-3 border text-left">Budget Head</th>
                <th className="p-3 border text-right">Requested Amount</th>
                <th className="p-3 border text-right">Head Balance</th>
                <th className="p-3 border text-right">Balance After Approval</th>
                <th className="p-3 border text-left">Process</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-left">Remark by Dean</th>
                <th className="p-3 border text-center">PDF</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No requests found for this project.
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="p-3 border font-semibold text-gray-800">
                    {row.projectCode}
                  </td>

                  <td className="p-3 border text-gray-700 max-w-[180px]">
                    {row.projectTitle}
                  </td>

                  <td className="p-3 border text-gray-700">{row.head}</td>

                  <td className="p-3 border text-right font-semibold text-orange-600">
                    ₹ {row.requestedAmount?.toLocaleString() ?? "—"}
                  </td>

                  <td className="p-3 border text-right font-semibold text-blue-700">
                    {row.headBalance !== null
                      ? `₹ ${row.headBalance.toLocaleString()}`
                      : "—"}
                  </td>

                  <td className="p-3 border text-right font-semibold text-green-700">
                    {row.balanceAfterApproval !== null
                      ? `₹ ${row.balanceAfterApproval.toLocaleString()}`
                      : "—"}
                  </td>

                  <td className="p-3 border capitalize text-gray-700">
                    {row.process}
                  </td>

                  <td className={`p-3 border text-center font-semibold ${statusStyle(row.status)}`}>
                    {statusLabel(row.status)}
                  </td>

                  <td className="p-3 border">
                    {row.remark ? (
                      <div className={`rounded p-2 text-sm border ${row.status === "Rejected" ? "bg-red-50 border-red-200 text-red-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                        {row.remark}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-3 border text-center">
                    {row.status === "Approved" && row.pdf ? (
                      <button
                        onClick={() => window.open(row.pdf, "_blank")}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        View PDF
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
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
