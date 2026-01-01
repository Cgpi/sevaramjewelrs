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

  const headers = {
    "X-Authorization": token,
  };

  // 🔹 Fetch Sub Categories
  const fetchSubCategories = async () => {
    const res = await axios.get(`${BASE_URL}/admin/sub-categories`, {
      headers,
    });
    setSubCategories(res.data.data);
  };

  // 🔹 Fetch Categories (for dropdown)
  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  // 🔹 Add / Update Sub Category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryId) {
      alert("All fields required");
      return;
    }

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
    }
  };

  // 🔹 Edit
  const handleEdit = (sub) => {
    setEditId(sub.id);
    setName(sub.name);
    setCategoryId(sub.category_id);
    setImage(sub.image);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;

    await axios.delete(`${BASE_URL}/admin/sub-categories/${id}`, { headers });
    fetchSubCategories();
  };

  // 🔹 Toggle Status
  const toggleStatus = async (id) => {
    await axios.patch(
      `${BASE_URL}/admin/sub-categories/${id}/toggle-status`,
      {},
      { headers }
    );
    fetchSubCategories();
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setImage(null);
    setEditId(null);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Sub-Category Management</h3>

      {/* 🔹 Add / Edit Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>{editId ? "Edit Sub-Category" : "Add Sub-Category"}</h5>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-3">
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
              />
            </div>

            <div className="col-md-3">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <div className="col-md-3 d-grid">
              <button className="btn btn-primary">
                {editId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Sub Category List */}
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
                        onClick={() => handleEdit(sub)}
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
