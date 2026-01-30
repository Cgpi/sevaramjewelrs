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

export default function AdminBlogs() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ===== STATES ===== */
  const emptyForm = {
    title: "",
    short_description: "",
    content: "",
    featured_image: "", // string only
    category: "",
    tags: "",
    author: "Admin",
    seo_title: "",
    seo_description: "",
    is_featured: false,
    status: "draft",
  };

  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      featured_image: b.featured_image || "", // string only
      category: b.category,
      tags: b.tags?.join(",") || "",
      author: b.author,
      seo_title: b.seo_title,
      seo_description: b.seo_description,
      is_featured: b.is_featured,
      status: b.status,
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

  /* ===== SAVE BLOG ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Ensure featured_image is always string
      const payload = {
        ...form,
        featured_image: form.featured_image || "",
        tags: form.tags.split(",").map((t) => t.trim()),
      };

      if (editId) {
        await api.put(`/admin/blogs/${editId}`, payload);
      } else {
        await api.post("/admin/blogs", payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to save blog");
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

  /* ===== UI ===== */
  return (
    <div className="container">
      <div className="d-flex justify-content-between mb-3">
        <h3>Blogs</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Blog
        </button>
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
                  <label>Featured Image (string URL or filename)</label>
                  <input
                    className="form-control"
                    name="featured_image"
                    value={form.featured_image}
                    onChange={handleChange}
                  />
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
                {blogs.length > 0 ? (
                  blogs.map((b, i) => (
                    <tr key={b.id}>
                      <td data-label="#">{i + 1}</td>
                      <td data-label="Title">{b.title}</td>
                      <td data-label="Category">{b.category}</td>
                      <td data-label="Status">{b.status}</td>
                      <td data-label="Featured">
                        {b.is_featured ? "Yes" : "No"}
                      </td>
                      <td data-label="Actions">
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
          )}
        </div>
      </div>
    </div>
  );
}
 