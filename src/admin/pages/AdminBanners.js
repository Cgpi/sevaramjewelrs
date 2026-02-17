import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const FALLBACK_IMAGE = "https://via.placeholder.com/160x100?text=No+Image";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

/* ================= LOADER ================= */
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

  /* ================= SEARCH & PAGINATION ================= */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const perPage = 10; // fixed per page

  /* ================= HELPERS ================= */
  const fixImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    return url.replace("/storage/storage/", "/storage/");
  };

  /* ================= FETCH ================= */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/banners?page=${currentPage}&per_page=${perPage}${
          searchText ? `&search=${searchText}` : ""
        }`,
      );
      const data = res.data?.data;
      setBanners(data?.data || []);
      setCurrentPage(data?.current_page || 1);
      setTotalPage(data?.last_page || 1);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, searchText]);

  /* ================= FORM HANDLERS ================= */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, typeof v === "boolean" ? (v ? 1 : 0) : v),
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    await api.delete(`/admin/banners/${id}`);
    fetchBanners();
  };

  /* ================= IMAGE VALIDATION ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image size must not exceed 2 MB");
      e.target.value = null;
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
        .banner-preview { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
      `}</style>

      {/* ===== HEADER + SEARCH ===== */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-9 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search banners..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <div className="col-md-3 mb-2 text-end">
          <button className="btn btn-primary" onClick={openCreateForm}>
            + Add Banner
          </button>
        </div>
      </div>

      {/* ===== FORM ===== */}
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
                <label>Banner Image (Max 2 MB)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img src={imagePreview} className="banner-preview mt-2" />
                )}
              </div>

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

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading banners..." />
          ) : (
            <>
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
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
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

              {/* ===== PAGINATION ===== */}
              {totalPage > 1 && (
                <nav>
                  <ul className="pagination justify-content-center mt-3">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPage }, (_, i) => i + 1).map(
                      (p) => (
                        <li
                          key={p}
                          className={`page-item ${currentPage === p ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      ),
                    )}
                    <li
                      className={`page-item ${
                        currentPage === totalPage ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPage))
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
