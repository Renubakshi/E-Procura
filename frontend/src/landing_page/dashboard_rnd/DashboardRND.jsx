import { useState } from "react";
import RndCodeCreationForm from "./RndCodeCreationForm";

export default function RndDashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              RND Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Initiate and manage project codes
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md transition w-full sm:w-auto"
            >
              + Create Project Code
            </button>
          )}
        </div>

        {/* Form Section */}
        {showForm && (
          <RndCodeCreationForm onClose={() => setShowForm(false)} />
        )}

      </div>
    </div>
  );
}
