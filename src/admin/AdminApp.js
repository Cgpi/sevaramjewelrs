import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPrivateRoute from "./routes/AdminPrivateRoute";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 🔹 ALL admin pages go through AdminDashboard */}
      <Route
        path="/admin/*"
        element={
          <AdminPrivateRoute>
            <AdminDashboard />
          </AdminPrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}
