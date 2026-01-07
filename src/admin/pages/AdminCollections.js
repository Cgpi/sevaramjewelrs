import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/api";
const BASE_ASSET_URL = BASE_URL.replace("/api", "");

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" role="status" />
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

  /* MODAL STATES */
  const [showModal, setShowModal] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchCollections = async () => {
    try {
      setLoadingList(true);
      const res = await api.get("/admin/collections");
      setCollections(Array.isArray(res.data) ? res.data : []);
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
      c.banner_image ? `${BASE_ASSET_URL}/${c.banner_image}` : null
    );
    setThumbPreview(
      c.thumbnail_image ? `${BASE_ASSET_URL}/${c.thumbnail_image}` : null
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

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, typeof v === "boolean" ? (v ? 1 : 0) : v)
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

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete collection?")) return;
    await api.delete(`/admin/collections/${id}`);
    fetchCollections();
  };

  /* ================= MODAL ================= */
  const openProductModal = async (collection) => {
    setShowModal(true);
    setSelectedProducts([]);
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
      await api.delete(
        `/admin/collections/${activeCollection.id}/detach-products`,
        { data: { product_ids: [productId] } }
      );
      await refreshActiveCollection(activeCollection.id);
      await fetchCollections();
    } finally {
      setProductLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container">
      <div className="d-flex justify-content-between mb-3">
        <h3>Collections</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Collection
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editId ? "Edit" : "Create"} Collection</h5>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label>Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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

              <div className="col-md-6">
                <label>Banner Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    setBannerFile(f);
                    setBannerPreview(URL.createObjectURL(f));
                  }}
                />
                {bannerPreview && (
                  <img
                    src={bannerPreview}
                    className="mt-2 rounded"
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                  />
                )}
              </div>

              <div className="col-md-6">
                <label>Thumbnail Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    setThumbFile(f);
                    setThumbPreview(URL.createObjectURL(f));
                  }}
                />
                {thumbPreview && (
                  <img
                    src={thumbPreview}
                    className="mt-2 rounded"
                    style={{ width: 120, height: 120, objectFit: "cover" }}
                  />
                )}
              </div>

              <div className="col-md-3">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.checked })
                  }
                />{" "}
                Active
              </div>

              <div className="col-md-3">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                />{" "}
                Featured
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

      {/* TABLE */}
      <div className="card">
        <div className="card-body">
          {loadingList ? (
            <Loader text="Loading collections..." />
          ) : (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.status ? "Active" : "Inactive"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => openProductModal(c)}
                      >
                        Manage Products
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && activeCollection && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg">
            <div className="modal-content position-relative">
              {productLoading && (
                <div className="position-absolute w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center">
                  <Loader text="Updating products..." />
                </div>
              )}

              <div className="modal-header">
                <h5>Manage Products – {activeCollection.name}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <h6>Attached Products</h6>
                {activeCollection.products?.length ? (
                  activeCollection.products.map((p) => (
                    <div
                      key={p.id}
                      className="d-flex justify-content-between mb-1"
                    >
                      {p.product_name}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => detachProduct(p.id)}
                      >
                        Detach
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No products attached</p>
                )}

                <hr />

                <h6>Attach Products</h6>
                <select
                  multiple
                  className="form-control"
                  value={selectedProducts}
                  onChange={(e) =>
                    setSelectedProducts(
                      Array.from(e.target.selectedOptions, (o) =>
                        Number(o.value)
                      )
                    )
                  }
                >
                  {products
                    .filter(
                      (p) =>
                        !activeCollection.products?.some((ap) => ap.id === p.id)
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name}
                      </option>
                    ))}
                </select>

                <button
                  className="btn btn-success mt-2"
                  disabled={!selectedProducts.length || productLoading}
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
