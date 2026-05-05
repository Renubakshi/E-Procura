import { useState, useEffect } from "react";
import Select from "react-select";

//  helper functions
function canonicalPayload(data) {
  return JSON.stringify({
    projectCode: data.projectCode,
    department: data.department,
    totalFundReceived: data.totalFundReceived,
    bankTransactionId: data.bankTransactionId,
    piEmpId: data.piEmpId,
    piName: data.piName,
  });
}

// import private key
async function importPrivateKey(pem) {
  const b64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
}

// sign payload
async function signPayload(privateKeyPem, payload) {
  const key = await importPrivateKey(privateKeyPem);

  const encoded = new TextEncoder().encode(payload);

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoded);

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// component
export default function RndCodeCreationForm({ onClose }) {
  const [piList, setPiList] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  const [formData, setFormData] = useState({
    projectCode: "",
    department: "",
    totalFundReceived: "",
    bankTransactionId: "",
    piEmpId: "",
    piName: "",
    sequenceNumber: "",
    year: "",
    privateKeyFile: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // clear field error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "department") {
      setLoadingCode(true);

      try {
        const res = await fetch(
          "http://localhost:5000/api/projects/project-code",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ department: value }),
          },
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          department: value,
          projectCode: data.projectCode,
          sequenceNumber: data.sequenceNumber,
          year: data.year,
        }));
      } catch (err) {
        console.error(err);
        alert("Error generating project code");

        setFormData((prev) => ({
          ...prev,
          projectCode: "",
        }));
      } finally {
        setLoadingCode(false);
      }

      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // pilist for dropdown list
  useEffect(() => {
    fetch("http://localhost:5000/api/projects/pi-list")
      .then((res) => res.json())
      .then((data) => setPiList(data));
  }, []);
  const options = piList.map((pi) => ({
    value: pi.employeeId,
    label: `${pi.employeeId}`,
  }));

  const validate = () => {
    let newErrors = {};

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.totalFundReceived) {
      newErrors.totalFundReceived = "Total fund is required";
    } else if (Number(formData.totalFundReceived) <= 0) {
      newErrors.totalFundReceived = "Amount must be greater than 0";
    }

    if (!formData.bankTransactionId) {
      newErrors.bankTransactionId = "Transaction ID is required";
    }

    if (!formData.piEmpId) {
      newErrors.piEmpId = "Please select a PI";
    }

    if (!formData.privateKeyFile) {
      newErrors.privateKeyFile = "Private key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const privateKeyPem = await formData.privateKeyFile.text();

    const payload = canonicalPayload(formData);

    const signature = await signPayload(privateKeyPem, payload);

    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        payload,
        signature,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
    } else {
      alert("Signature verification failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Create Project Code
        </h2>

        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          ✕
        </button>
      </div>

      {success ? (
        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-lg text-center">
          ✅ Project Successfully Created & Sent to PI
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Department
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ELECTRICAL">ELECTRICAL</option>
              <option value="MECHANICAL">MECHANICAL</option>
              <option value="CIVIL">CIVIL</option>
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm">{errors.department}</p>
            )}
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Project Code
            </label>

            <input
              type="text"
              value={loadingCode ? "Generating..." : formData.projectCode}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {/* Total Fund Received  */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Fund Received
            </label>

            <input
              type="number"
              name="totalFundReceived"
              value={formData.totalFundReceived}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {errors.totalFundReceived && (
              <p className="text-red-500 text-sm">{errors.totalFundReceived}</p>
            )}
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Bank Transaction ID
            </label>

            <input
              type="text"
              name="bankTransactionId"
              value={formData.bankTransactionId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            {errors.bankTransactionId && (
              <p className="text-red-500 text-sm">{errors.bankTransactionId}</p>
            )}
          </div>

          {/* PI Employee ID */}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              PI Employee ID
            </label>

            <Select
              className="w-full rounded-lg text-sm font-medium text-gray-600 focus:ring-blue-500"
              options={options}
              value={options.find((opt) => opt.value === formData.piEmpId)}
              onChange={(selected) => {
                const selectedPI = piList.find(
                  (pi) => pi.employeeId === selected.value,
                );

                setFormData((prev) => ({
                  ...prev,
                  piEmpId: selectedPI.employeeId,
                  piName: selectedPI.fullName,
                }));

                // clear error (important UX improvement)
                setErrors((prev) => ({
                  ...prev,
                  piEmpId: "",
                }));
              }}
              placeholder="Select PI Employee ID"
              maxMenuHeight={120}
            />

            {errors.piEmpId && (
              <p className="text-red-500 text-sm">{errors.piEmpId}</p>
            )}
          </div>

          {/* PI Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              PI Name
            </label>

            <input
              type="text"
              name="piName"
              value={formData.piName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              disabled
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Upload Private Key
              </label>

              <input
                type="file"
                name="privateKeyFile"
                accept=".pem"
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    privateKeyFile: e.target.files[0],
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    privateKeyFile: "",
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
              {errors.privateKeyFile && (
                <p className="text-red-500 text-sm">{errors.privateKeyFile}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loadingCode || !formData.projectCode}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Sign & Send to PI
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
