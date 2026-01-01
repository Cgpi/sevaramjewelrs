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
    "Content-Type": "application/json",
  };

  // 🔹 Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
      setCategories(res.data.data);
    } catch (err) {
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Add / Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      alert("Category name required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }

    try {
      if (editId) {
        await axios.post(`${BASE_URL}/admin/categories/${editId}`, formData, {
          headers: {
            "X-Authorization": token,
          },
        });
      } else {
        await axios.post(`${BASE_URL}/admin/categories`, formData, {
          headers: {
            "X-Authorization": token,
          },
        });
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      alert("Upload failed");
    }
  };

  // 🔹 Edit Category
  const handleEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setImage(cat.image);
  };

  // 🔹 Delete Category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin/categories/${id}`, { headers });
      fetchCategories();
    } catch {
      alert("Delete failed");
    }
  };

  // 🔹 Enable / Disable Status
  const toggleStatus = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/categories/${id}/status`,
        {},
        { headers }
      );
      fetchCategories();
    } catch {
      alert("Status update failed");
    }
  };

  const resetForm = () => {
    setName("");
    setImage("");
    setEditId(null);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Category Management</h3>

      {/* 🔹 Add / Edit Form */}
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
              />
            </div>

            <div className="col-md-5">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
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

      {/* 🔹 Category List */}
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
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
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
