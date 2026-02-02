import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

/* ===== LOADER ===== */
const Loader = ({ text }) => (
  <div className="text-center py-3">
    <div className="spinner-border me-2" />
    <strong>{text}</strong>
  </div>
);

export default function AdminBlogs() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  /* ===== STATES ===== */
  const emptyForm = {
    title: "",
    short_description: "",
    content: "",
    category: "",
    tags: "",
    author: "Admin",
    seo_title: "",
    seo_description: "",
    is_featured: false,
    status: "draft",

    image: null, // 👈 NEW
    preview: null, // 👈 NEW
  };

  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===== SEARCH & PAGINATION ===== */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  /* ===== FETCH BLOGS ===== */
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/blogs");
      setBlogs(res.data?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* ===== FORM HANDLERS ===== */
  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      short_description: b.short_description,
      content: b.content,
      category: b.category,
      tags: b.tags?.join(",") || "",
      author: b.author,
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      is_featured: b.is_featured,
      status: b.status,

      preview: b.featured_image
        ? `https://sevaramjewellers.com/sevaramjwellers/${b.featured_image}`
        : null,
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

  /* ===== SAVE BLOG ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("short_description", form.short_description);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("author", form.author);
      formData.append("seo_title", form.seo_title);
      formData.append("seo_description", form.seo_description);
      formData.append("is_featured", form.is_featured ? 1 : 0);
      formData.append("status", form.status);

      // ✅ TAGS ARRAY
      form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });

      // ✅ IMAGE (only if changed)
      if (form.image) {
        formData.append("featured_image", form.image);
      }

      // ✅ THIS IS THE UPDATE FIX
      if (editId) {
        formData.append("_method", "PUT");
        await api.post(`/admin/blogs/${editId}`, formData);
      } else {
        await api.post("/admin/blogs", formData);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  /* ===== DELETE BLOG ===== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  /* ===== TOGGLE STATUS & FEATURED ===== */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/blogs/${id}/status`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle status");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await api.patch(`/admin/blogs/${id}/featured`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle featured");
    }
  };

  /* ===== FILTERED & PAGINATED DATA ===== */
  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchText.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBlogs.length / perPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

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
            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
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
      {/* ===== SEARCH & PER PAGE ===== */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search blogs..."
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
        <div className="col-md-3 mb-2 text-end">
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Blog
          </button>
        </div>
      </div>

      {/* ===== FORM ===== */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit Blog" : "Create Blog"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Category</label>
                  <input
                    className="form-control"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>Tags (comma separated)</label>
                  <input
                    className="form-control"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    required={!editId}
                    onChange={handleImageChange}
                  />
                  {form.preview && (
                    <div className="col-md-12">
                      <img
                        src={form.preview}
                        alt="Preview"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="col-md-4 d-flex align-items-center mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                  />
                  <label>Featured</label>
                </div>
                <div className="col-md-4">
                  <label>Status</label>
                  <select
                    className="form-control"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="col-12">
                  <label>Short Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    name="short_description"
                    value={form.short_description}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label>Content (HTML)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12 mt-2">
                  <button className="btn btn-success" disabled={saving}>
                    {saving ? "Saving..." : "Save Blog"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading blogs..." />
          ) : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBlogs.length > 0 ? (
                    paginatedBlogs.map((b, i) => (
                      <tr key={b.id}>
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
                        <td>{b.title}</td>
                        <td>{b.category}</td>
                        <td>{b.status}</td>
                        <td>{b.is_featured ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger me-2"
                            onClick={() => handleDelete(b.id)}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => toggleStatus(b.id)}
                          >
                            {b.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => toggleFeatured(b.id)}
                          >
                            {b.is_featured ? "Unfeature" : "Feature"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No blogs found
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
