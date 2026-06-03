import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPI from "./landing_page/dashboard_pi/DashboardPI";
import DashboardRND from "./landing_page/dashboard_rnd/DashboardRND";
import DashboardDORD from "./landing_page/dashboard_DORD/DashboardDORD";
import ProjectBifurcationForm from "./landing_page/dashboard_pi/ProjectBifurcationForm";
import ProjectSummary from "./landing_page/dashboard_pi/ProjectSummary";
import FundBookingPage from "./landing_page/FundBookingPage";
import PurchaseRequisitionForm from "./landing_page/process_forms/PurchaseRequisitionForm";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AuthPageWrapper from "./components/AuthPageWrapper";
import GenerateKey from "./landing_page/key_gen/GenerateKey";
import ManpowerHiringForm from "./landing_page/process_forms/ManpowerHiringForms";
import FundBifurcationList from "./landing_page/dashboard_pi/FundBifurcationList";
import PIRequestsList from "./landing_page/dashboard_pi/PIRequestsList";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPageWrapper />
            </PublicRoute>
          }
        />

        <Route path="/generate-key" element={<GenerateKey />} />

        <Route
          path="/pi-dashboard"
          element={
            <ProtectedRoute allowedRole="PI">
              <DashboardPI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rnd-dashboard"
          element={
            <ProtectedRoute allowedRole="RND">
              <DashboardRND />
            </ProtectedRoute>
          }
        />

        <Route
          path="/DORD-dashboard"
          element={
            <ProtectedRoute allowedRole="DORD">
              <DashboardDORD />
            </ProtectedRoute>
          }
        />

        <Route path="/projects/:id" element={<ProjectBifurcationForm />} />
        <Route path="/summary/:id" element={<ProjectSummary />} />
        <Route path="/projects" element={<FundBifurcationList />} />
        <Route path="/pi-fund-requests/:projectId" element={<PIRequestsList />} />
        <Route path="/manpower-hiring" element={<ManpowerHiringForm />} />
        <Route path="/fund-booking/:id" element={<FundBookingPage />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
