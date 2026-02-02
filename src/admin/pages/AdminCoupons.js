import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

/* ===== LOADER ===== */
const Loader = ({ text }) => (
  <div className="text-center py-3">
    <div className="spinner-border me-2" />
    <strong>{text}</strong>
  </div>
);

export default function AdminCoupons() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ===== STATES ===== */
  const emptyForm = {
    code: "",
    type: "percent",
    value: "",
    min_amount: "",
    expires_at: "",
    is_active: true,
  };

  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===== SEARCH & PAGINATION ===== */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.ceil(filteredCoupons.length / perPage);

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  /* ===== FETCH ===== */
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/coupons");
      setCoupons(res.data?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ===== FILTER EFFECT ===== */
  useEffect(() => {
    const filtered = coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(searchText.toLowerCase()) ||
        String(c.value).includes(searchText) ||
        String(c.min_amount).includes(searchText),
    );
    setFilteredCoupons(filtered);
    setCurrentPage(1);
  }, [searchText, coupons]);

  /* ===== FORM HANDLERS ===== */
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      min_amount: c.min_amount,
      expires_at: c.expires_at?.split("T")[0],
      is_active: Boolean(c.is_active),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (editId) {
        await api.put(`/admin/coupons/${editId}`, form);
      } else {
        await api.post("/admin/coupons", form);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchCoupons();
    } catch {
      alert("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await api.delete(`/admin/coupons/${id}`);
    fetchCoupons();
  };

  /* ===== PAGINATION UI ===== */
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
          </li>
          {pages.map((p) => (
            <li
              key={p}
              className={`page-item ${currentPage === p ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => setCurrentPage(p)}>
                {p}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  /* ===== UI ===== */
  return (
    <div className="container">
      <div className="d-flex justify-content-between mb-3">
        <h3>Coupons</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Coupon
        </button>
      </div>

      {/* ===== SEARCH & PER PAGE ===== */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search coupons..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== FORM ===== */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit Coupon" : "Create Coupon"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Code</label>
                  <input
                    className="form-control"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    disabled={editId}
                  />
                </div>
                <div className="col-md-3">
                  <label>Type</label>
                  <select
                    className="form-control"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="percent">Percent</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label>Value</label>
                  <input
                    type="number"
                    className="form-control"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label>Min Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="min_amount"
                    value={form.min_amount}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label>Expires At</label>
                  <input
                    type="date"
                    className="form-control"
                    name="expires_at"
                    value={form.expires_at}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
              </div>

              <button className="btn btn-success mt-3" disabled={saving}>
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading coupons..." />
          ) : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Amount</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCoupons.length > 0 ? (
                    paginatedCoupons.map((c, i) => (
                      <tr key={c.id}>
                        <td> {(currentPage - 1) * perPage + i + 1} </td>
                        <td>{c.code}</td>
                        <td>{c.type}</td>
                        <td>{c.value}</td>
                        <td>{c.min_amount}</td>
                        <td>{c.expires_at?.split("T")[0]}</td>
                        <td>{c.is_active ? "Active" : "Inactive"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        No coupons found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ===== PAGINATION ===== */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
