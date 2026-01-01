import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/api";

export default function AdminSubCategories() {
  const token = localStorage.getItem("admin_token");

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);

  const headers = {
    "X-Authorization": token,
  };

  /* ================= FETCH SUB-CATEGORIES ================= */
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/sub-categories`, {
        headers,
      });
      setSubCategories(res.data.data);
    } catch {
      alert("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
      setCategories(res.data.data);
    } catch {
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryId) {
      alert("All fields required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", categoryId);
    if (image instanceof File) {
      formData.append("image", image);
    }

    try {
      if (editId) {
        await axios.post(
          `${BASE_URL}/admin/sub-categories/${editId}`,
          formData,
          { headers }
        );
      } else {
        await axios.post(`${BASE_URL}/admin/sub-categories`, formData, {
          headers,
        });
      }

      resetForm();
      fetchSubCategories();
    } catch {
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (sub) => {
    setEditId(sub.id);
    setName(sub.name);
    setCategoryId(sub.category_id);
    setImage(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/admin/sub-categories/${id}`, { headers });
      fetchSubCategories();
    } catch {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (id) => {
    setLoading(true);
    try {
      await axios.patch(
        `${BASE_URL}/admin/sub-categories/${id}/toggle-status`,
        {},
        { headers }
      );
      fetchSubCategories();
    } catch {
      alert("Status update failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setImage(null);
    setEditId(null);
  };

  return (
    <div className="container mt-4 position-relative">
      <h3 className="mb-3">Sub-Category Management</h3>

      {/* ================= GLOBAL LOADER ================= */}
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>{editId ? "Edit Sub-Category" : "Add Sub-Category"}</h5>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Sub-Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-md-3">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                disabled={loading}
              />
            </div>

            <div className="col-md-3 d-grid">
              <button className="btn btn-primary" disabled={loading}>
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body">
          <h5>Sub-Category List</h5>

          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Name</th>
                <th>Image</th>
                <th>Status</th>
                <th width="260">Actions</th>
              </tr>
            </thead>

            <tbody>
              {subCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No sub-categories found
                  </td>
                </tr>
              ) : (
                subCategories.map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>{sub.category?.name}</td>
                    <td>{sub.name}</td>
                    <td>
                      {sub.image_url ? (
                        <img
                          src={sub.image_url}
                          alt={sub.name}
                          width="60"
                          height="60"
                          className="rounded"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sub.status === 1 ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {sub.status === 1 ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        disabled={loading}
                        onClick={() => handleEdit(sub)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        disabled={loading}
                        onClick={() => handleDelete(sub.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={loading}
                        onClick={() => toggleStatus(sub.id)}
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
