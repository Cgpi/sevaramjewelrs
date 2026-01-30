// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
// const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

// export default function AdminCategories() {
//   const token = localStorage.getItem("admin_token");

//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [name, setName] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const headers = {
//     "X-Authorization": token,
//   };

//   /* ================= FETCH ================= */
//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
//       setCategories(res.data.data);
//     } catch {
//       alert("Failed to load categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   /* ================= SEARCH ================= */
//   const filteredCategories = categories.filter((cat) =>
//     cat.name.toLowerCase().includes(search.toLowerCase())
//   );

//   /* ================= IMAGE CHANGE ================= */
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];

//     if (!file) return;

//     if (file.size > MAX_IMAGE_SIZE) {
//       alert("Image size must be less than 2 MB");
//       e.target.value = "";
//       return;
//     }

//     setImage(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   /* ================= ADD / UPDATE ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || (!editId && !image)) {
//       alert("All fields are required");
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append("name", name);
//     if (image) {
//       formData.append("image", image);
//     }

//     try {
//       if (editId) {
//         await axios.post(`${BASE_URL}/admin/categories/${editId}`, formData, {
//           headers,
//         });
//       } else {
//         await axios.post(`${BASE_URL}/admin/categories`, formData, {
//           headers,
//         });
//       }

//       resetForm();
//       fetchCategories();
//     } catch {
//       alert("Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= EDIT ================= */
//   const handleEdit = (cat) => {
//     setEditId(cat.id);
//     setName(cat.name);
//     setImage(null);
//     setPreview(cat.image_url || null);
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this category?")) return;

//     setLoading(true);
//     try {
//       await axios.delete(`${BASE_URL}/admin/categories/${id}`, { headers });
//       fetchCategories();
//     } catch {
//       alert("Delete failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= STATUS ================= */
//   const toggleStatus = async (id) => {
//     setLoading(true);
//     try {
//       await axios.patch(
//         `${BASE_URL}/admin/categories/${id}/status`,
//         {},
//         { headers }
//       );
//       fetchCategories();
//     } catch {
//       alert("Status update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setImage(null);
//     setPreview(null);
//     setEditId(null);
//   };

//   return (
//     <div className="container jewelry-container">
//       <style>{`
//         .jewelry-container {
//           font-family: "Georgia", serif;
//           padding-bottom: 40px;
//         }
//         h3, h5 {
//           color: #7a5c1e;
//           font-weight: bold;
//         }
//         .loader-overlay {
//           background: rgba(0, 0, 0, 0.7);
//           z-index: 9999;
//         }
//         .jewelry-card {
//           border: none;
//           border-radius: 12px;
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
//           background: #fffaf2;
//         }
//         .jewelry-input {
//           border-radius: 8px;
//           border: 1px solid #d4af37;
//         }
//         .jewelry-btn {
//           background: linear-gradient(135deg, #d4af37, #a8862d);
//           border: none;
//           color: #000;
//           font-weight: bold;
//           border-radius: 8px;
//           max-width: 200px;
//           justify-self: center;
//         }
//         .jewelry-btn:hover {
//           background: linear-gradient(135deg, #a8862d, #7a5c1e);
//           color: #fff;
//         }
//         .cat-img {
//           width: 60px;
//           height: 60px;
//           object-fit: cover;
//           border-radius: 8px;
//           border: 2px solid #d4af37;
//         }
//         .preview-img {
//           width: 80px;
//           height: 80px;
//           object-fit: cover;
//           border-radius: 8px;
//           border: 2px solid #d4af37;
//           margin-top: 5px;
//         }
//         /* ================= RESPONSIVE TABLE ================= */

//         .table-responsive-wrapper {
//           width: 100%;
//           overflow-x: auto;
//         }

//         /* MOBILE VIEW */
//         @media (max-width: 768px) {
//         .responsive-table thead {
//           display: none;
//         }

//         .responsive-table,
//         .responsive-table tbody,
//         .responsive-table tr,
//         .responsive-table td {
//           display: block;
//           width: 100%;
//         }

//         .responsive-table tr {
//           margin-bottom: 15px;
//           background: #fffaf2;
//           border-radius: 10px;
//           box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
//           padding: 10px;
//         }

//         .responsive-table td {
//           text-align: right;
//           padding-left: 50%;
//           position: relative;
//           border: none;
//           border-bottom: 1px solid #e0d3a3;
//         }

//         .responsive-table td:last-child {
//           border-bottom: none;
//         }

//         .responsive-table td::before {
//           content: attr(data-label);
//           position: absolute;
//           left: 10px;
//           width: 45%;
//           padding-left: 10px;
//           font-weight: bold;
//           color: #7a5c1e;
//           text-align: left;
//         } 

//         .cat-img {
//           width: 50px;
//           height: 50px;
//         }

//         .responsive-table td[data-label="Actions"] button {
//           margin-top: 5px;
//         }
//       `}</style>

//       <h3 className="mb-4">Category Management</h3>

//       {loading && (
//         <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center loader-overlay">
//           <div className="spinner-border text-warning"></div>
//         </div>
//       )}

//       {/* ================= FORM ================= */}
//       <div
//         className="card jewelry-card mb-4"
//         style={{
//           maxWidth: "900px",
//           margin: "0 auto",
//           width: "100%",
//         }}
//       >
//         <div className="card-body">
//           <h5>{editId ? "Edit Jewelry Category" : "Add Jewelry Category"}</h5>

//           <form onSubmit={handleSubmit}>
//             {/* Category Name */}
//             <div className="mb-3">
//               <label className="form-label fw-bold">Category Name</label>
//               <input
//                 type="text"
//                 className="form-control jewelry-input"
//                 placeholder="Enter category name"
//                 value={name}
//                 required
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </div>

//             {/* Image Upload */}
//             <div className="mb-3">
//               <label className="form-label fw-bold">Category Image</label>
//               <input
//                 type="file"
//                 className="form-control jewelry-input"
//                 accept="image/*"
//                 required={!editId}
//                 onChange={handleImageChange}
//               />
//             </div>

//             {/* Preview */}
//             <div className="mb-3 text-center">
//               {preview ? (
//                 <img src={preview} alt="Preview" className="preview-img" />
//               ) : (
//                 <div style={{ fontSize: "13px", color: "#999" }}>
//                   No Image Selected
//                 </div>
//               )}
//             </div>

//             {/* Button */}
//             <div className="d-grid">
//               <button className="btn jewelry-btn">
//                 {editId ? "Update Category" : "Add Category"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="card jewelry-card">
//         <div className="card-body">
//           <h5 className="mb-3">Jewelry Categories</h5>

//           <input
//             type="text"
//             className="form-control jewelry-input mb-3"
//             placeholder="🔍 Search category..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <div className="table-responsive-wrapper">
//             <table className="table table-bordered table-hover responsive-table">
//               <thead>
//                 <tr>
//                   <th>Sr No</th>
//                   <th>Name</th>
//                   <th>Image</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredCategories.length === 0 ? (
//                   <tr>
//                     <td colSpan="5">No categories found</td>
//                   </tr>
//                 ) : (
//                   filteredCategories.map((cat, index) => (
//                     <tr key={cat.id}>
//                       <td data-label="Sr No">{index + 1}</td>
//                       <td data-label="Name">{cat.name}</td>
//                       <td data-label="Image">
//                         {cat.image_url ? (
//                           <img
//                             src={cat.image_url}
//                             alt={cat.name}
//                             className="cat-img"
//                           />
//                         ) : (
//                           "No Image"
//                         )}
//                       </td>
//                       <td data-label="Status">
//                         {cat.status === 1 ? "Enabled" : "Disabled"}
//                       </td>
//                       <td data-label="Actions">
//                         <button
//                           className="btn btn-warning btn-sm me-1"
//                           onClick={() => handleEdit(cat)}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           className="btn btn-danger btn-sm me-1"
//                           onClick={() => handleDelete(cat.id)}
//                         >
//                           Delete
//                         </button>
//                         <button
//                           className="btn btn-secondary btn-sm"
//                           onClick={() => toggleStatus(cat.id)}
//                         >
//                           Toggle
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-primary me-2" role="status" />
    <strong>{text}</strong>
  </div>
);

export default function AdminCategories() {
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
    name: "",
    image: null,
    preview: null,
  };

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/categories");
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= FORM ================= */
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (cat) => {
    setEditId(cat.id);
    setForm({
      name: cat.name || "",
      image: null,
      preview: cat.image_url || null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  /* ================= IMAGE ================= */
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

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.name || (!editId && !form.image)) {
      alert("All fields are required");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.image) formData.append("image", form.image);

      if (editId) {
        await api.post(`/admin/categories/${editId}`, formData);
      } else {
        await api.post("/admin/categories", formData);
      }

      await fetchCategories();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete category");
    }
  };

  /* ================= STATUS ================= */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/categories/${id}/status`);
      fetchCategories();
    } catch {
      alert("Status update failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categories</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          + Add Category
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">
              {editId ? "Edit Category" : "Create Category"}
            </h5>

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Category Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  required={!editId}
                  onChange={handleImageChange}
                />
              </div>

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
                    }}
                  />
                </div>
              )}

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

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading categories..." />
          ) : (
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th width="60">#</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th width="200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat, i) => (
                    <tr key={cat.id}>
                      <td>{i + 1}</td>
                      <td>{cat.name}</td>
                      <td>
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {cat.status === 1 ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => openEditForm(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => toggleStatus(cat.id)}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No categories found
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
