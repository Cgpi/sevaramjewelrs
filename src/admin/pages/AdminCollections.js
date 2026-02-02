import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const BASE_ASSET_URL = BASE_URL.replace("/api", "");

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" />
    <strong>{text}</strong>
  </div>
);

export default function AdminCollections() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ================= STATES ================= */
  const emptyForm = {
    name: "",
    slug: "",
    status: true,
    is_featured: false,
  };

  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [bannerFile, setBannerFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  /* MODAL */
  const [showModal, setShowModal] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ===== SEARCH & PAGINATION ===== */
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  /* ================= FETCH ================= */
  const fetchCollections = async () => {
    try {
      setLoadingList(true);
      const res = await api.get("/admin/collections");
      setCollections(res.data || []);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchProducts = async () => {
    const res = await api.get("/admin/products");
    setProducts(res.data?.data || []);
  };

  const refreshActiveCollection = async (id) => {
    const res = await api.get(`/admin/collections/${id}`);
    setActiveCollection(res.data);
  };

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  /* ================= FILTERED & PAGINATED DATA ================= */
  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCollections.length / perPage);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  /* ================= FORM ================= */
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      status: Boolean(c.status),
      is_featured: Boolean(c.is_featured),
    });

    setBannerPreview(
      c.banner_image ? `${BASE_ASSET_URL}/${c.banner_image}` : null,
    );
    setThumbPreview(
      c.thumbnail_image ? `${BASE_ASSET_URL}/${c.thumbnail_image}` : null,
    );

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setBannerFile(null);
    setThumbFile(null);
    setBannerPreview(null);
    setThumbPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, typeof v === "boolean" ? (v ? 1 : 0) : v),
      );

      if (bannerFile) fd.append("banner_image", bannerFile);
      if (thumbFile) fd.append("thumbnail_image", thumbFile);

      if (editId) {
        fd.append("_method", "PUT");
        await api.post(`/admin/collections/${editId}`, fd);
      } else {
        await api.post("/admin/collections", fd);
      }

      await fetchCollections();
      setShowForm(false);
      resetForm();
    } catch {
      alert("Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete collection?")) return;
    await api.delete(`/admin/collections/${id}`);
    fetchCollections();
  };

  /* ================= MODAL ================= */
  const openProductModal = async (collection) => {
    setShowModal(true);
    setSelectedProducts([]);
    setSearchTerm("");
    await refreshActiveCollection(collection.id);
  };

  const attachProducts = async () => {
    if (!selectedProducts.length) return;

    try {
      setProductLoading(true);
      await api.post(`/admin/collections/${activeCollection.id}/products`, {
        product_ids: selectedProducts,
      });
      await refreshActiveCollection(activeCollection.id);
      await fetchCollections();
      setSelectedProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const detachProduct = async (productId) => {
    try {
      setProductLoading(true);
      await api.post(
        `/admin/collections/${activeCollection.id}/detach-products`,
        { product_ids: [productId] },
      );
      await refreshActiveCollection(activeCollection.id);
      await fetchCollections();
    } finally {
      setProductLoading(false);
    }
  };

  const filteredProducts = products
    .filter((p) => !activeCollection?.products?.some((ap) => ap.id === p.id))
    .filter((p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  /* ================= PAGINATION UI ================= */
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

  /* ================= UI ================= */
  return (
    <div className="container">
      {/* ===== SEARCH & PER PAGE ===== */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search collections..."
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
      </div>

      {/* ===== FORM (CREATE / UPDATE) ===== */}
      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>{editId ? "Update Collection" : "Add Collection"}</h5>

            <form onSubmit={handleSubmit}>
              <input
                className="form-control mb-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                required
              />

              <input
                className="form-control mb-2"
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.checked })
                  }
                />
                <label className="form-check-label">Active</label>
              </div>

              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                />
                <label className="form-check-label">Featured</label>
              </div>

              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => {
                  setBannerFile(e.target.files[0]);
                  setBannerPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              {bannerPreview && <img src={bannerPreview} height="60" alt="" />}

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-success" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== LIST ===== */}
      <div className="d-flex justify-content-between mb-2">
        <h3>Collections</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Collection
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loadingList ? (
            <Loader />
          ) : (
            <>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCollections.length > 0 ? (
                    paginatedCollections.map((c, i) => (
                      <tr key={c.id}>
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
                        <td>{c.name}</td>
                        <td>{c.status ? "Active" : "Inactive"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => openProductModal(c)}
                          >
                            Manage
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => openEditForm(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No collections found
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

      {/* ===== MODAL ===== */}
      {showModal && activeCollection && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{activeCollection.name}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {activeCollection.products?.map((p) => (
                  <div key={p.id} className="d-flex justify-content-between">
                    {p.product_name}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => detachProduct(p.id)}
                    >
                      Detach
                    </button>
                  </div>
                ))}

                <hr />

                <input
                  className="form-control mb-2"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  multiple
                  className="form-control"
                  style={{ height: 200 }}
                  onChange={(e) =>
                    setSelectedProducts(
                      Array.from(e.target.selectedOptions, (o) =>
                        Number(o.value),
                      ),
                    )
                  }
                >
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-success mt-2"
                  onClick={attachProducts}
                >
                  Attach Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
