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
import dashboardImage from "../images/dashboard.jpg";
import AdminProducts from "./AdminProducts";
import AdminCollections from "./AdminCollections";
import AdminBanners from "./AdminBanners";
import AdminCmsPages from "./AdminCmsPages";
import AdminCoupons from "./AdminCoupons";
import AdminOrders from "./AdminOrders";
import AdminFinance from "./AdminFinance";
import AdminBlogs from "./AdminBlogs";
import AdminReports from "./AdminReports";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  /* MOBILE SIDEBAR */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* AUTO CLOSE SIDEBAR ON ROUTE CHANGE */
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  /* LOGOUT */
  const logout = async () => {
    try {
      await axios.post(
        "https://sevaramjewellers.com/sevaramjwellers/api/admin/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        },
      );
    } catch {}

    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="container-fluid p-0 jewelry-admin">
      <style>{`
        /* GLOBAL */
        .jewelry-admin {
          font-family: "Georgia", serif;
          background: #ffffffff;
        }

        /* SIDEBAR */
        .jewelry-sidebar {
          background: #000;
          color: #fff3cd;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 220px;
          z-index: 1000;
          padding: 18px;
        }

        .jewelry-sidebar h5 {
          text-align: center;
          font-weight: bold;
          margin-bottom: 25px;
        }

        .nav-link {
          color: #f5f5f5;
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 6px;
          transition: 0.3s;
        }

        .nav-link:hover {
          background: #fff3cd;
          color: #000;
        }

        .active-link {
          background: #fff3cd;
          color: #000 !important;
          font-weight: bold;
        }

        /* LOGOUT */
        .logout-btn {
          background: linear-gradient(135deg, #b71c1c, #7f0000);
          border: none;
          font-weight: bold;
        }

        /* CONTENT */
        .jewelry-content {
          margin-left: 220px;
          min-height: 100vh;
          padding: 30px;
          
        }

        /* HAMBURGER */
        .hamburger-btn {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          z-index: 1100;
          background: #000;
          color: #fff3cd;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 20px;
        }

        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 900;
        }

        /* DASHBOARD WRAPPER */
        .dashboard-wrapper {
          max-width: 1200px;
          margin: auto;
          background: #fffaf2;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        /* HERO */
        .dashboard-hero {
          position: relative;
          height: 320px;
        }

        .dashboard-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.55),
            rgba(0,0,0,0.25)
          );
        }

        .dashboard-hero-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .dashboard-hero-content h1 {
          color: #fff3cd;
          font-weight: bold;
          font-size: 36px;
          letter-spacing: 1px;
        }

        .dashboard-hero-content p {
          color: #f5e6c8;
          margin-top: 10px;
          font-size: 16px;
        }

        /* DASHBOARD CONTENT */
        .dashboard-content {
          padding: 40px;
          text-align: center;
        }

        .dashboard-content h3 {
          color: #7a5c1e;
          font-weight: bold;
        }

        .dashboard-content p {
          color: #555;
          max-width: 650px;
          margin: 12px auto 0;
          line-height: 1.6;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hamburger-btn {
            display: block;
          }

          .jewelry-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .jewelry-sidebar.show {
            transform: translateX(0);
          }

          .overlay.show {
            display: block;
          }

          .jewelry-content {
            margin-left: 0;
            padding-top: 70px;
          }

          .dashboard-hero {
            height: 220px;
          }

          .dashboard-hero-content h1 {
            font-size: 26px;
          }
        }
      `}</style>

      {/* HAMBURGER */}
      <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
        ☰
      </button>

      {/* OVERLAY */}
      <div
        className={`overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <nav className={`jewelry-sidebar ${isSidebarOpen ? "show" : ""}`}>
        <h5>Admin Panel</h5>

        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              to="/admin/dashboard"
              className={`nav-link ${
                location.pathname === "/admin/dashboard" ? "active-link" : ""
              }`}
            >
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/categories"
              className={`nav-link ${
                location.pathname === "/admin/categories" ? "active-link" : ""
              }`}
            >
              Categories
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/sub-categories"
              className={`nav-link ${
                location.pathname === "/admin/sub-categories"
                  ? "active-link"
                  : ""
              }`}
            >
              Sub-Categories
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/products"
              className={`nav-link ${
                location.pathname === "/admin/products" ? "active-link" : ""
              }`}
            >
              Add Products
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/collections"
              className={`nav-link ${
                location.pathname === "/admin/collections" ? "active-link" : ""
              }`}
            >
              Collections
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/banners"
              className={`nav-link ${
                location.pathname === "/admin/banners" ? "active-link" : ""
              }`}
            >
              Banners
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/cms-pages"
              className={`nav-link ${
                location.pathname === "/admin/cms-pages" ? "active-link" : ""
              }`}
            >
              CMS Pages
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/coupons"
              className={`nav-link ${
                location.pathname === "/admin/coupons" ? "active-link" : ""
              }`}
            >
              Coupons
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/orders"
              className={`nav-link ${
                location.pathname === "/admin/orders" ? "active-link" : ""
              }`}
            >
              Orders
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/payments"
              className={`nav-link ${
                location.pathname === "/admin/payments" ? "active-link" : ""
              }`}
            >
              Payments
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin/blog-posts"
              className={`nav-link ${
                location.pathname === "/admin/blog-posts" ? "active-link" : ""
              }`}
            >
              Blog Posts
            </Link>
          </li>

          <li className="nav-item mt-4">
            <button onClick={logout} className="btn logout-btn w-100">
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* CONTENT */}
      <div className="jewelry-content">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <div className="dashboard-wrapper">
                <div
                  className="dashboard-hero"
                  style={{
                    backgroundImage: `url(${dashboardImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="dashboard-overlay"></div>
                  <div className="dashboard-hero-content">
                    <div>
                      <h1>Sevaram Jewellers</h1>
                      <p>Crafting Elegance in Gold, Silver & Diamonds</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-content">
                  <h3>Welcome Admin</h3>
                  <p>
                    Manage your jewelry categories and sub-categories with a
                    refined, secure, and elegant admin panel.
                  </p>
                </div>
              </div>
            }
          />

          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/sub-categories" element={<AdminSubCategories />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/collections" element={<AdminCollections />} />
          <Route path="/banners" element={<AdminBanners />} />
          <Route path="/cms-pages" element={<AdminCmsPages />} />
          <Route path="/coupons" element={<AdminCoupons />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/payments" element={<AdminFinance />} />
          <Route path="/blog-posts" element={<AdminBlogs />} />

          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}
