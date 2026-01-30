import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

export default function HeaderNavbar() {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${BASE_URL}/active-categories`)
      .then((res) => {
        setCategories(Array.isArray(res?.data?.data) ? res.data.data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleCategoryClick = async (cat) => {
    if (expandedCategory === cat.id) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(cat.id);

    if (subCategories[cat.id]) return;

    setLoadingId(cat.id);
    try {
      const res = await axios.get(
        `${BASE_URL}/categories/${cat.id}/sub-categories`
      );
      setSubCategories((prev) => ({
        ...prev,
        [cat.id]: Array.isArray(res?.data?.data) ? res.data.data : [],
      }));
    } catch {
      setSubCategories((prev) => ({ ...prev, [cat.id]: [] }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
  <>
    {/* Inline CSS */}
    <style>
      {`
        .top-bar {
          background: #f3e6d3;
          font-size: 14px;
          padding: 6px 0;
          text-align: center;
        }
        .category-item { padding: 10px 12px; cursor: pointer; border-radius: 4px; font-weight: 500; }
        .category-item:hover { background: #f3e6d3; }
        .subcategory-list { padding-left: 18px; margin-top: 4px; }
        .subcategory-item { padding: 6px 0; font-size: 14px; cursor: pointer; }
        .subcategory-item:hover { text-decoration: underline; }
        .nav-icon { font-size: 18px; cursor: pointer; }
      `}
    </style>

    {/* Top bar */}
    <div className="top-bar">Welcome to our store</div>

    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid px-3">

        {/* MOBILE: Logo + hamburger */}
        <div className="d-flex d-lg-none justify-content-between align-items-center w-100">
          <a className="navbar-brand fw-bold mb-0" href="/">Sevaram Jewellers</a>
          <button
            className="navbar-toggler p-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* MOBILE: search + icons */}
        <div className="d-flex d-lg-none w-100 mt-2 gap-2 align-items-center">
          <input
            className="form-control rounded-pill flex-grow-1"
            placeholder="Search jewellery..."
          />
          <i className="bi bi-person nav-icon"></i>
          <i className="bi bi-bag nav-icon"></i>
        </div>

        {/* COLLAPSIBLE MENU */}
        <div className="collapse navbar-collapse mt-2 mt-lg-0" id="mainNavbar">

          {/* DESKTOP LOGO */}
          <a className="navbar-brand fw-bold d-none d-lg-block me-4" href="/">
            Sevaram Jewellers
          </a>

          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>

            {/* Shop By Category */}
            <li className="nav-item dropdown" data-bs-auto-close="outside">
              <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                Shop By Category
              </span>
              <div className="dropdown-menu p-3 shadow" style={{ minWidth: 260 }}>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <div className="category-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat); }}>
                      {cat.name}
                    </div>
                    {expandedCategory === cat.id && (
                      <div className="subcategory-list">
                        {loadingId === cat.id && <div className="text-muted small">Loading...</div>}
                        {!loadingId && subCategories[cat.id]?.length === 0 && <div className="text-muted small">No sub-categories</div>}
                        {subCategories[cat.id]?.map((sub) => (
                          <div key={sub.id} className="subcategory-item">{sub.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </li>

            <li className="nav-item"><a className="nav-link" href="/new-arrivals">New Arrival</a></li>
            <li className="nav-item"><a className="nav-link" href="/personalised">Personalised Jewellery</a></li>
            <li className="nav-item"><a className="nav-link" href="/bestsellers">Bestsellers</a></li>
            <li className="nav-item"><a className="nav-link" href="/track-order">Track Your Order</a></li>

            {/* Info */}
            <li className="nav-item dropdown">
              <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Info</span>
              <div className="dropdown-menu shadow">
                <a className="dropdown-item" href="/about-us">About Us</a>
                <a className="dropdown-item" href="/contact-us">Contact Us</a>
              </div>
            </li>

            {/* Our Policy */}
            <li className="nav-item dropdown">
              <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Our Policy</span>
              <div className="dropdown-menu shadow">
                <a className="dropdown-item" href="/privacy-policy">Privacy Policy</a>
                <a className="dropdown-item" href="/refund-policy">Refund Policy</a>
                <a className="dropdown-item" href="/shipping-policy">Shipping Policy</a>
              </div>
            </li>
          </ul>

          {/* DESKTOP: search + icons */}
         <div className="d-none d-lg-flex align-items-center gap-2 ms-3">
  <input className="form-control rounded-pill" style={{ maxWidth: 220 }} placeholder="Search..." />
  <i className="bi bi-person nav-icon"></i>
  <i className="bi bi-bag nav-icon"></i>
</div>
        </div>
      </div>
    </nav>
  </>
);



}
