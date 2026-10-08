import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeProfile from "./pages/EmployeeProfile";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminDraftingWork from "./pages/admin/AdminDraftingWork";
import InvoiceReport from "./pages/admin/InvoiceReport";
import EmployeeExpensesModule from "./pages/EmployeeExpensesModule";
import AdminWhatsappSettings from "./pages/admin/AdminWhatsappSettings";
import AdminLoginReport from "./pages/admin/AdminLoginReport";
import CompanyMaster from "./pages/admin/CompanyMaster";
import UniqueLabInstrumentsPage from "./pages/UniqueLabInstrumentsPage";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dedicated Standalone Unique Lab Instruments Console */}
        <Route path="/unique-lab-instruments" element={<UniqueLabInstrumentsPage />} />
        <Route path="/unique-lab-instrument" element={<Navigate to="/unique-lab-instruments" replace />} />
        <Route path="/lab-instruments" element={<Navigate to="/unique-lab-instruments" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="our-company" element={<CompanyMaster />} />
          <Route path="company-master" element={<CompanyMaster />} />
          <Route path="unique-lab-instruments" element={<Navigate to="/unique-lab-instruments" replace />} />
          <Route path="unique-lab-instrument" element={<Navigate to="/unique-lab-instruments" replace />} />
          <Route path="lab-instruments" element={<Navigate to="/unique-lab-instruments" replace />} />
          <Route path="products" element={<Navigate to="/unique-lab-instruments?tab=products" replace />} />
          <Route path="enquiries" element={<Navigate to="/unique-lab-instruments?tab=enquiries" replace />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="employee-expenses" element={<EmployeeExpensesModule />} />
          <Route path="drafting-work" element={<AdminDraftingWork />} />
          <Route path="invoice-report" element={<InvoiceReport />} />
          <Route path="whatsapp-settings" element={<AdminWhatsappSettings />} />
          <Route path="login-report" element={<AdminLoginReport />} />
        </Route>

        {/* Employee Portal — standalone (no Layout) */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />

        {/* Login */}
        <Route path="/login" element={<Layout><Login /></Layout>} />

        {/* User Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
