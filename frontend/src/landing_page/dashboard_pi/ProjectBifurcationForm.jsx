import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import {
  readPem,
  importPrivateKey,
  signData,
  hashPdf,
  canonicalPayload,
} from "../../utils/digitalSignature";

export default function ProjectBifurcationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    divisionHeads: {
      "Manpower (including Interns)": "",
      Equipment: "",
      "Consumables/Contingency/Travel": "",
      "Bootcamps/Events": "",
      Overhead: "",
    },
    attachment: null,
    privateKeyFile: null,
  });
  // Populate auto-fields from selected project
  const { id } = useParams();

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      console.log("rndData", data);

      setFormData((prev) => ({
        ...prev,
        projectCode: data.projectCode,
        department: data.department,
        piName: data.piName,
        piEmpId: data.piEmpId,
        status: data.status,
        bankTransactionId: data.bankTransactionId,
        totalFundReceived: data.totalFundReceived || "",
        bifurcationYear: data.year || "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    if (formData.divisionHeads.hasOwnProperty(name)) {
      setFormData({
        ...formData,
        divisionHeads: { ...formData.divisionHeads, [name]: Number(value) },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  function handleFileChange(e) {
    setFormData({ ...formData, attachment: e.target.files[0] });
  }

  function handleKeyFileChange(e) {
    setFormData({ ...formData, privateKeyFile: e.target.files[0] });
  }

  const totalAllocated = Object.values(formData.divisionHeads).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  const remainingAmount =
    Number(formData.totalFundReceived || 0) - totalAllocated;

  const isExceeded = remainingAmount < 0;
  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.privateKeyFile) {
      alert("Upload private key");
      return;
    }
    if (!formData.attachment) {
      alert("Upload PDF");
      return;
    }

    const pdfHash = await hashPdf(formData.attachment);
    console.log("pdfHash", pdfHash);

    const payload = canonicalPayload({
      title: formData.title,
      divisionHeads: formData.divisionHeads,
      pdfHash: pdfHash,
      role: "PI",
      timestamp: new Date().toISOString(),
    });

    const pem = await readPem(formData.privateKeyFile);
    const privateKey = await importPrivateKey(pem);
    const signature = await signData(privateKey, payload);

    // sending data to backend
    const sendData = new FormData();
    sendData.append("formData", JSON.stringify(payload));
    sendData.append("signature", signature);
    sendData.append("attachment", formData.attachment);

    const token = localStorage.getItem("token");

    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: sendData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Submitted");
      navigate("/pi-dashboard");
    } else {
      console.log(data);

      alert(data.msg);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-gray-100 to-gray-50">
      <div className="glass-card w-full max-w-4xl p-4 sm:p-6 md:p-8 shadow-lg fade-in">
        <div className="flex justify-end mb-4">
          <BackButton />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary text-center mb-6">
          Project Bifurcation Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Project Code</label>
              <input
                type="text"
                name="projectCode"
                value={formData.projectCode}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
                disabled
              />
            </div>
            <div>
              <label>Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>PI Name</label>
              <input
                disabled
                type="text"
                name="piName"
                value={formData.piName}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
              />
            </div>
            <div>
              <label>Department</label>
              <input
                disabled
                type="text"
                name="department"
                value={formData.department}
                readOnly
                className="w-full p-3 border bg-gray-200 rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Bank Transaction ID</label>
              <input
                disabled
                type="text"
                name="bankTransactionId"
                value={formData.bankTransactionId}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>PI Employee ID</label>
              <input
                disabled
                type="text"
                name="piName"
                value={formData.piEmpId}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
              />
            </div>
            <div>
              <label>Project Status</label>
              <input
                disabled
                type="text"
                name="department"
                value={formData.status}
                readOnly
                className="w-full p-3 border bg-gray-100 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Total Fund Received (₹)</label>
              <input
                disabled
                type="number"
                name="totalFundReceived"
                value={formData.totalFundReceived}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
              />
            </div>
            <div>
              <label>Funding Year</label>
              <input
                disabled
                type="number"
                name="bifurcationYear"
                value={formData.bifurcationYear}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded bg-gray-200"
              />
            </div>
          </div>

          {/* Division Heads */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <h3 className="text-xl font-semibold text-gray-700">
                Fund Bifurcation
              </h3>

              <div className="flex gap-4 mt-3 md:mt-0">
                <div className="bg-blue-50 px-4 py-2 rounded-xl border">
                  <p className="text-xs text-gray-500">Allocated</p>
                  <p className="font-bold text-blue-700">
                    ₹ {totalAllocated.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border ${
                    isExceeded
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className="text-xs text-gray-500">Remaining</p>

                  <p
                    className={`font-bold ${
                      isExceeded ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    ₹ {remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {isExceeded && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                ⚠ Total bifurcation exceeds available funds
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.keys(formData.divisionHeads).map((head, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {head}
                  </label>

                  <input
                    type="number"
                    name={head}
                    value={formData.divisionHeads[head]}
                    onChange={handleChange}
                    required
                    placeholder="Enter amount"
                    className={`w-full p-3 rounded-xl border outline-none transition-all
            ${
              isExceeded
                ? "border-red-300 focus:ring-2 focus:ring-red-300"
                : "border-gray-300 focus:ring-2 focus:ring-blue-300"
            }`}
                  />
                  {head === "Overhead" && remainingAmount !== 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      Suggested Overhead Amount: ₹{" "}
                      {remainingAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label>Sanction Order (PDF Only)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
              className="w-full mt-2 p-2 border rounded"
            />
          </div>

          {/* Private Key */}
          <div>
            <label>Enter Your Signing Key (.pem)</label>
            <input
              type="file"
              accept=".pem"
              onChange={handleKeyFileChange}
              required
              className="w-full mt-2 p-2 border rounded"
            />
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto">
            Sign & Submit
          </button>
        </form>
      </div>
    </div>
  );
}
