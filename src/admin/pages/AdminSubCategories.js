import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" />
    <strong>{text}</strong>
  </div>
);

export default function AdminSubCategories() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  /* ================= STATES ================= */
  const emptyForm = {
    name: "",
    category_id: "",
    image: null,
    preview: null,
  };

  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ============ SEARCH & PAGINATION ============ */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.ceil(filteredSubCategories.length / perPage);

  const paginatedSubCategories = filteredSubCategories.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  /* ================= FETCH ================= */
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sub-categories");
      setSubCategories(res.data?.data || []);
    } catch {
      alert("Failed to load sub-categories");
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data?.data || []);
    } catch {
      alert("Failed to load categories");
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  /* ============ FILTER & SEARCH EFFECT ============ */
  useEffect(() => {
    const filtered = subCategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchText.toLowerCase()) ||
        sub.category?.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    setFilteredSubCategories(filtered);
    setCurrentPage(1);
  }, [searchText, subCategories]);

  /* ================= FORM ================= */
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (sub) => {
    setEditId(sub.id);
    setForm({
      name: sub.name || "",
      category_id: sub.category_id || "",
      image: null,
      preview: sub.image_url || null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image must be less than 2 MB");
      e.target.value = "";
      return;
    }

    setForm({
      ...form,
      image: file,
      preview: URL.createObjectURL(file),
    });
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.name || !form.category_id || (!editId && !form.image)) {
      alert("All fields are required");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category_id", form.category_id);
      if (form.image) formData.append("image", form.image);

      if (editId) {
        await api.post(`/admin/sub-categories/${editId}`, formData);
      } else {
        await api.post("/admin/sub-categories", formData);
      }

      await fetchSubCategories();
      setShowForm(false);
      resetForm();
    } catch {
      alert("Failed to save sub-category");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;

    try {
      await api.delete(`/admin/sub-categories/${id}`);
      fetchSubCategories();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= STATUS ================= */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/sub-categories/${id}/toggle-status`);
      fetchSubCategories();
    } catch {
      alert("Status update failed");
    }
  };

  /* ================= PAGINATION UI ================= */
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

  /* ================= UI ================= */
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sub-Categories</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Sub-Category
        </button>
      </div>

      {/* ================= SEARCH & PER PAGE ================= */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search sub-categories..."
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">
              {editId ? "Edit Sub-Category" : "Create Sub-Category"}
            </h5>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Sub-Category Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  required={!editId}
                  onChange={handleImageChange}
                />
              </div>

              {form.preview && (
                <div className="col-md-6 d-flex align-items-end">
                  <img
                    src={form.preview}
                    alt="Preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                </div>
              )}

              <div className="col-12">
                <button className="btn btn-success" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading sub-categories..." />
          ) : (
            <>
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th width="200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubCategories.length > 0 ? (
                    paginatedSubCategories.map((sub, i) => (
                      <tr key={sub.id}>
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
                        <td>{sub.category?.name}</td>
                        <td>{sub.name}</td>
                        <td>
                          {sub.image_url ? (
                            <img
                              src={sub.image_url}
                              alt={sub.name}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {sub.status === 1 ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEditForm(sub)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger me-2"
                            onClick={() => handleDelete(sub.id)}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => toggleStatus(sub.id)}
                          >
                            Toggle
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No sub-categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ================= PAGINATION ================= */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
