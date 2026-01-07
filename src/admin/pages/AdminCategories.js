import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/api";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

export default function AdminCategories() {
  const token = localStorage.getItem("admin_token");

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = {
    "X-Authorization": token,
  };

  /* ================= FETCH ================= */
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

  /* ================= SEARCH ================= */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image size must be less than 2 MB");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || (!editId && !image)) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (image) {
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
    setPreview(cat.image_url || null);
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

  /* ================= STATUS ================= */
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
    setPreview(null);
    setEditId(null);
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
          max-width: 200px;
          justify-self: center;
        }
        .jewelry-btn:hover {
          background: linear-gradient(135deg, #a8862d, #7a5c1e);
          color: #fff;
        }
        .cat-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #d4af37;
        }
        .preview-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #d4af37;
          margin-top: 5px;
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

        .cat-img {
          width: 50px;
          height: 50px;
        }

        .responsive-table td[data-label="Actions"] button {
          margin-top: 5px;
        }
      `}</style>

      <h3 className="mb-4">Category Management</h3>

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center loader-overlay">
          <div className="spinner-border text-warning"></div>
        </div>
      )}

      {/* ================= FORM ================= */}
      <div
        className="card jewelry-card mb-4"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div className="card-body">
          <h5>{editId ? "Edit Jewelry Category" : "Add Jewelry Category"}</h5>

          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <div className="mb-3">
              <label className="form-label fw-bold">Category Name</label>
              <input
                type="text"
                className="form-control jewelry-input"
                placeholder="Enter category name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label fw-bold">Category Image</label>
              <input
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
                <img src={preview} alt="Preview" className="preview-img" />
              ) : (
                <div style={{ fontSize: "13px", color: "#999" }}>
                  No Image Selected
                </div>
              )}
            </div>

            {/* Button */}
            <div className="d-grid">
              <button className="btn jewelry-btn">
                {editId ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card jewelry-card">
        <div className="card-body">
          <h5 className="mb-3">Jewelry Categories</h5>

          <input
            type="text"
            className="form-control jewelry-input mb-3"
            placeholder="🔍 Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="table-responsive-wrapper">
            <table className="table table-bordered table-hover responsive-table">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5">No categories found</td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td data-label="Sr No">{index + 1}</td>
                      <td data-label="Name">{cat.name}</td>
                      <td data-label="Image">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="cat-img"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td data-label="Status">
                        {cat.status === 1 ? "Enabled" : "Disabled"}
                      </td>
                      <td data-label="Actions">
                        <button
                          className="btn btn-warning btn-sm me-1"
                          onClick={() => handleEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm me-1"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleStatus(cat.id)}
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
