import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" />
    <strong>{text}</strong>
  </div>
);

export default function AdminCmsPages() {
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
    slug: "",
    content: "",
    is_active: true,
  };

  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewContent, setViewContent] = useState("");

  /* ===== SEARCH & PAGINATION ===== */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  /* ================= FETCH ================= */
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/cms-pages");
      setPages(Array.isArray(res.data) ? res.data : res.data?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  /* ================= FORM ================= */
  const openCreateForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (p) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content,
      is_active: Boolean(p.is_active),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      is_active: form.is_active ? 1 : 0,
    };

    try {
      editId
        ? await api.put(`/admin/cms-pages/${editId}`, payload)
        : await api.post("/admin/cms-pages", payload);

      fetchPages();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this CMS page?")) return;
    await api.delete(`/admin/cms-pages/${id}`);
    fetchPages();
  };

  /* ================= FILTER & PAGINATION ================= */
  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredPages.length / perPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pagesArray = [];
    for (let i = 1; i <= totalPages; i++) pagesArray.push(i);

    return (
      <nav>
        <ul className="pagination justify-content-center mt-3">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
          </li>
          {pagesArray.map((p) => (
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
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
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

  /* ================= UI ================= */
  return (
    <div className="container-fluid mt-3 px-2 px-md-4">
      <style>{`
        .content-col { width: 220px; max-width: 220px; }
        .content-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; line-height: 1.5; color: #555; }
        .table-responsive-custom { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { min-width: 900px; }
      `}</style>

      {/* ===== HEADER + SEARCH + PER PAGE ===== */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search pages..."
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
          <button className="btn btn-primary" onClick={openCreateForm}>
            + Add Page
          </button>
        </div>
      </div>

      {/* ===== FORM ===== */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit CMS Page" : "Create CMS Page"}</h5>

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
                <label>Slug</label>
                <input
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label>Content</label>
                <textarea
                  rows="5"
                  className="form-control"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
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

              <div className="col-12">
                <button className="btn btn-success" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
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
        <div className="card-body table-responsive-custom">
          {loading ? (
            <Loader />
          ) : (
            <>
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th width="60">Sr No</th>
                    <th>Title</th>
                    <th>Slug</th>
                    <th width="90">Status</th>
                    <th className="content-col">Content</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPages.length > 0 ? (
                    paginatedPages.map((p, i) => (
                      <tr key={p.id}>
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
                        <td>{p.title}</td>
                        <td>{p.slug}</td>
                        <td>
                          <span
                            className={`badge ${
                              p.is_active ? "bg-success" : "bg-secondary"
                            }`}
                          >
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="content-col">
                          <div
                            className="content-preview"
                            dangerouslySetInnerHTML={{ __html: p.content }}
                          />
                          <button
                            className="btn btn-link p-0"
                            data-bs-toggle="modal"
                            data-bs-target="#contentModal"
                            onClick={() => setViewContent(p.content)}
                          >
                            View more
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEditForm(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No pages found
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

      {/* ===== VIEW CONTENT MODAL ===== */}
      <div className="modal fade" id="contentModal">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">CMS Content</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div
              className="modal-body"
              dangerouslySetInnerHTML={{ __html: viewContent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
