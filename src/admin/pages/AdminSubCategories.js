import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/api";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function AdminSubCategories() {
  const token = localStorage.getItem("admin_token");

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // For file reset
  const [fileKey, setFileKey] = useState(Date.now());

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
    try {
      const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
      setCategories(res.data.data);
    } catch {
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  /* ================= SEARCH ================= */
  const filteredSubCategories = subCategories.filter((sub) => {
    const keyword = search.toLowerCase();
    return (
      sub.name?.toLowerCase().includes(keyword) ||
      sub.category?.name?.toLowerCase().includes(keyword)
    );
  });

  /* ================= IMAGE HANDLER ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image must be less than 2 MB");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryId || (!editId && !image)) {
      alert("All fields are required");
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
    setPreview(sub.image_url || null);
    setFileKey(Date.now());
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
    setPreview(null);
    setEditId(null);
    setFileKey(Date.now());
  };

  return (
    <div className="container jewelry-container">
      <style>{`
        .jewelry-container {
          font-family: "Georgia", serif;
          padding-bottom: 40px;
        }
        h3, h5 {
          color: #7a5c1e;
          font-weight: bold;
        }
        .loader-overlay {
          background: rgba(0, 0, 0, 0.7);
          z-index: 9999;
        }
        .jewelry-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          background: #fffaf2;
        }
        .jewelry-input {
          border-radius: 8px;
          border: 1px solid #d4af37;
        }
        .jewelry-btn {
          background: linear-gradient(135deg, #d4af37, #a8862d);
          border: none;
          color: #000;
          font-weight: bold;
          border-radius: 8px;
          justify-self: center;
        }
        .subcat-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #d4af37;
        }
        /* ================= RESPONSIVE TABLE ================= */

        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        /* MOBILE VIEW */
        @media (max-width: 768px) {
          .responsive-table thead {
            display: none;
          }

          .responsive-table,
          .responsive-table tbody,
          .responsive-table tr,
          .responsive-table td {
            display: block;
            width: 100%;
          }

          .responsive-table tr {
            margin-bottom: 15px;
            background: #fffaf2;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 10px;
          }

          .responsive-table td {
            text-align: right;
            padding-left: 50%;
            position: relative;
            border: none;
            border-bottom: 1px solid #e0d3a3;
          }

          .responsive-table td:last-child {
            border-bottom: none;
          }

          .responsive-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 10px;
            width: 45%;
            padding-left: 10px;
            font-weight: bold;
            color: #7a5c1e;
            text-align: left;
          }

          .subcat-img {
            width: 50px;
            height: 50px;
          }

          .responsive-table td[data-label="Actions"] button {
            margin-top: 5px;
          }
        }

      `}</style>

      <h3 className="mb-4">💎 Sub-Category Management</h3>

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center loader-overlay">
          <div className="spinner-border text-warning"></div>
        </div>
      )}

      {/* FORM */}
      <div
        className="card jewelry-card mb-4"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div className="card-body">
          <h5>{editId ? "Edit Sub-Category" : "Add Sub-Category"}</h5>

          <form onSubmit={handleSubmit}>
            {/* Category Select */}
            <div className="mb-3">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-control jewelry-input"
                value={categoryId}
                required
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

            {/* Sub-Category Name */}
            <div className="mb-3">
              <label className="form-label fw-bold">Sub-Category Name</label>
              <input
                type="text"
                className="form-control jewelry-input"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label fw-bold">Sub-Category Image</label>
              <input
                key={fileKey}
                type="file"
                className="form-control jewelry-input"
                accept="image/*"
                required={!editId}
                onChange={handleImageChange}
              />
            </div>

            {/* Preview */}
            <div className="mb-3 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="subcat-img" />
              ) : (
                <div style={{ fontSize: "13px", color: "#999" }}>
                  No Image Selected
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="d-grid">
              <button className="btn jewelry-btn">
                {editId ? "Update Sub-Category" : "Add Sub-Category"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TABLE */}
      <div className="card jewelry-card">
        <div className="card-body">
          <input
            type="text"
            className="form-control jewelry-input mb-3"
            placeholder="🔍 Search sub-category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="table-responsive-wrapper">
            <table className="table table-bordered table-hover responsive-table">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubCategories.length === 0 ? (
                  <tr>
                    <td colSpan="6">No sub-categories found</td>
                  </tr>
                ) : (
                  filteredSubCategories.map((sub, index) => (
                    <tr key={sub.id}>
                      <td data-label="Sr No">{index + 1}</td>
                      <td data-label="Category">{sub.category?.name}</td>
                      <td data-label="Name">{sub.name}</td>
                      <td data-label="Image">
                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            className="subcat-img"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td data-label="Status">
                        {sub.status === 1 ? "Enabled" : "Disabled"}
                      </td>
                      <td data-label="Actions">
                        <button
                          className="btn btn-warning btn-sm me-1"
                          onClick={() => handleEdit(sub)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm me-1"
                          onClick={() => handleDelete(sub.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(sub.id)}
                        >
                          Toggle
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
    </div>
  );
}
