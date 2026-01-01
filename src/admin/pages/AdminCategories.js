import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/api";

export default function AdminCategories() {
  const token = localStorage.getItem("admin_token");

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = {
    "X-Authorization": token,
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
    fetchCategories();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      alert("Category name required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (image && typeof image === "object") {
      formData.append("image", image);
    }

    try {
      if (editId) {
        await axios.post(`${BASE_URL}/admin/categories/${editId}`, formData, {
          headers,
        });
      } else {
        await axios.post(`${BASE_URL}/admin/categories`, formData, {
          headers,
        });
      }

      resetForm();
      fetchCategories();
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setImage(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/admin/categories/${id}`, { headers });
      fetchCategories();
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
        `${BASE_URL}/admin/categories/${id}/status`,
        {},
        { headers }
      );
      fetchCategories();
    } catch {
      alert("Status update failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setEditId(null);
  };

  return (
    <div className="container mt-4 position-relative">
      <h3 className="mb-3">Category Management</h3>

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
          <h5 className="card-title">
            {editId ? "Edit Category" : "Add Category"}
          </h5>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-md-5">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                disabled={loading}
              />
            </div>

            <div className="col-md-2 d-grid">
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
          <h5 className="card-title">Category List</h5>

          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Image</th>
                <th>Status</th>
                <th width="280">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td>
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
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
                          cat.status === 1 ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {cat.status === 1 ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        disabled={loading}
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger me-2"
                        disabled={loading}
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={loading}
                        onClick={() => toggleStatus(cat.id)}
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
