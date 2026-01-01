import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminPrivateRoute({ children }) {
  const token = localStorage.getItem("admin_token");

  return token ? children : <Navigate to="/admin/login" />;
}
