import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const FALLBACK_IMAGE = "https://via.placeholder.com/160x100?text=No+Image";

/* ================= LOADER (SAME AS COLLECTIONS) ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" role="status" />
    <strong>{text}</strong>
  </div>
);

export default function AdminBanners() {
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
    title: "",
    link: "",
    position: "",
    is_active: true,
  };

  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= HELPERS ================= */
  const fixImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    return url.replace("/storage/storage/", "/storage/");
  };

  /* ================= FETCH ================= */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/banners");
      setBanners(res.data?.data?.data || []);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= FORM ================= */
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      link: b.link,
      position: b.position,
      is_active: Boolean(b.is_active),
    });

    setImagePreview(fixImageUrl(b.image_url));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, typeof v === "boolean" ? (v ? 1 : 0) : v)
      );

      if (imageFile) fd.append("image", imageFile);

      if (editId) {
        fd.append("_method", "PUT");
        await api.post(`/admin/banners/${editId}`, fd);
      } else {
        await api.post("/admin/banners", fd);
      }

      fetchBanners();
      setShowForm(false);
      resetForm();
    } catch (err) {
      alert("Failed to save banner");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    await api.delete(`/admin/banners/${id}`);
    fetchBanners();
  };

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* ================= UI ================= */
  return (
    <div className="container">
      <style>{`
        .banner-preview {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
      `}</style>

      <div className="d-flex justify-content-between mb-3">
        <h3>Banners</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Banner
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit" : "Create"} Banner</h5>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label>Title</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Link</label>
                <input
                  className="form-control"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label>Position</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="col-md-4 d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                <span className="ms-2">Active</span>
              </div>

              <div className="col-md-6">
                <label>Banner Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }}
                />
                {imagePreview && (
                  <img src={imagePreview} className="banner-preview mt-2" />
                )}
              </div>

              <div>
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
            <Loader text="Loading banners..." />
          ) : (
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Image</th>
                  <th width="160">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.length ? (
                  banners.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>{b.title}</td>
                      <td>{b.position}</td>
                      <td>
                        {b.is_active ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td>
                        <img
                          src={fixImageUrl(b.image_url)}
                          onError={(e) =>
                            (e.currentTarget.src = FALLBACK_IMAGE)
                          }
                          style={{
                            width: 80,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => openEditForm(b)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(b.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No banners found
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
