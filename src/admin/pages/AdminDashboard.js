import React, { useEffect, useState } from "react";
import {
  Link,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import AdminCategories from "./AdminCategories";
import AdminSubCategories from "./AdminSubCategories";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCatalog, setShowCatalog] = useState(false);

  // 🔹 Keep Catalog active on category & sub-category pages
  useEffect(() => {
    if (
      location.pathname.includes("/admin/categories") ||
      location.pathname.includes("/admin/sub-categories")
    ) {
      setShowCatalog(true);
    } else {
      setShowCatalog(false);
    }
  }, [location.pathname]);

  // 🔴 LOGOUT FUNCTION
  const logout = async () => {
    try {
      await axios.post(
        "https://sevaramjewellers.com/api/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );
    } catch {
      // ignore API error
    }

    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* 🔹 SIDEBAR */}
        <nav
          className="col-md-2 bg-dark text-white p-3"
          style={{ position: "sticky", top: 0, height: "100vh" }}
        >
          <h5 className="mb-4 text-center">Admin Panel</h5>

          <ul className="nav flex-column">
            {/* Dashboard */}
            <li className="nav-item">
              <Link
                to="/admin/dashboard"
                className={`nav-link text-white ${
                  location.pathname === "/admin/dashboard"
                    ? "fw-bold text-warning"
                    : ""
                }`}
              >
                Dashboard
              </Link>
            </li>

            {/* Categories */}
            <li className="nav-item">
              <Link
                to="/admin/categories"
                className={`nav-link text-white ${
                  location.pathname.includes("/admin/categories")
                    ? "fw-bold text-warning"
                    : ""
                }`}
              >
                Categories
              </Link>
            </li>

            {/* Sub Categories */}
            <li className="nav-item">
              <Link
                to="/admin/sub-categories"
                className={`nav-link text-white ${
                  location.pathname.includes("/admin/sub-categories")
                    ? "fw-bold text-warning"
                    : ""
                }`}
              >
                Sub Categories
              </Link>
            </li>

            {/* 🔴 LOGOUT BUTTON */}
            <li className="nav-item mt-4">
              <button onClick={logout} className="btn btn-danger w-100">
                Logout
              </button>
            </li>
          </ul>
        </nav>

        {/* 🔹 CONTENT AREA */}
        <div className="col-md-10 p-4 bg-light">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <>
                  <h1>Welcome Admin</h1>
                  <p>Manage products, orders, and users here.</p>
                </>
              }
            />

            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/sub-categories" element={<AdminSubCategories />} />

            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
