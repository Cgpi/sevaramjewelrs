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
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===== FETCH ===== */
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/coupons");

      // ✅ FIX: extract paginated data
      setCoupons(res.data?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ===== FORM ===== */
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

  /* ===== SAVE ===== */
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

  /* ===== DELETE ===== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await api.delete(`/admin/coupons/${id}`);
    fetchCoupons();
  };

  /* ===== UI ===== */
  return (
    <div className="container">
      <style>{`
        @media (max-width: 768px) {
          table thead { display: none; }
          table tbody tr {
            display: block;
            border: 1px solid #ddd;
            margin-bottom: 1rem;
            border-radius: 6px;
            padding: 10px;
          }
          table tbody td {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
          }
          table tbody td::before {
            content: attr(data-label);
            font-weight: 600;
          }
        }
      `}</style>

      <div className="d-flex justify-content-between mb-3">
        <h3>Coupons</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Coupon
        </button>
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
                {coupons.map((c, i) => (
                  <tr key={c.id}>
                    <td data-label="#"> {i + 1} </td>
                    <td data-label="Code">{c.code}</td>
                    <td data-label="Type">{c.type}</td>
                    <td data-label="Value">{c.value}</td>
                    <td data-label="Min Amount">{c.min_amount}</td>
                    <td data-label="Expires">{c.expires_at?.split("T")[0]}</td>
                    <td data-label="Status">
                      {c.is_active ? "Active" : "Inactive"}
                    </td>
                    <td data-label="Actions">
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
                ))}
                {!coupons.length && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No coupons found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
