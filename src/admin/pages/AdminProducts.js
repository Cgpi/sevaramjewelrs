// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const BASE_URL = "https://sevaramjewellers.com/api";

// export default function AdminProducts() {
//   const token = localStorage.getItem("admin_token");

//   const headers = {
//     Authorization: `Bearer ${token}`,
//   };

//   const emptyForm = {
//     category_id: "",
//     sub_category_id: "",
//     product_name: "",
//     sku: "",
//     base_price: "",
//     stock_quantity: "",
//     status: "active",
//     attributes: {
//       metal_type: "",
//       purity: "",
//       gross_weight: "",
//       net_weight: "",
//       making_charges_type: "percentage",
//       making_charges: "",
//       stone_charges: "",
//       gst: "",
//       gender: "",
//       occasion: "",
//       design_style: "",
//       certification: "",
//     },
//   };

//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);

//   // images
//   const [images, setImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/admin/products`, { headers });

//       // ✅ ENSURE ARRAY
//       setProducts(Array.isArray(res.data.data) ? res.data.data : []);
//     } catch (error) {
//       console.error("Fetch products failed", error);
//       setProducts([]); // fallback safety
//     }
//   };

//   const fetchCategories = async () => {
//     const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
//     setCategories(res.data.data || []);
//   };

//   const fetchSubCategories = async (categoryId) => {
//     const res = await axios.get(`${BASE_URL}/admin/sub-categories`, {
//       headers,
//     });
//     const filtered = res.data.data.filter(
//       (s) => s.category_id === Number(categoryId)
//     );
//     setSubCategories(filtered);
//   };

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, []);

//   /* ================= FORM ================= */
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name.startsWith("attr.")) {
//       const key = name.replace("attr.", "");
//       setForm((prev) => ({
//         ...prev,
//         attributes: { ...prev.attributes, [key]: value },
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCategoryChange = (e) => {
//     const categoryId = e.target.value;
//     setForm({ ...form, category_id: categoryId, sub_category_id: "" });
//     fetchSubCategories(categoryId);
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImages(files);
//     setImagePreviews(files.map((f) => URL.createObjectURL(f)));
//   };

//   /* ================= ADD / UPDATE ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData();

//       Object.keys(form).forEach((key) => {
//         if (key !== "attributes") {
//           formData.append(key, form[key]);
//         }
//       });

//       Object.keys(form.attributes).forEach((key) => {
//         formData.append(`attributes[${key}]`, form.attributes[key]);
//       });

//       images.forEach((img) => {
//         formData.append("images[]", img);
//       });

//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       };

//       if (editId) {
//         await axios.post(
//           `${BASE_URL}/admin/products/${editId}?_method=PUT`,
//           formData,
//           config
//         );
//       } else {
//         await axios.post(`${BASE_URL}/admin/products`, formData, config);
//       }

//       resetForm();
//       fetchProducts();
//       setShowForm(false); // hide form after save
//     } catch (err) {
//       console.error(err);
//       alert("Save failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= EDIT ================= */
//   const handleEdit = (product) => {
//     setEditId(product.id);
//     setForm({
//       ...product,
//       attributes: product.attributes || emptyForm.attributes,
//     });

//     fetchSubCategories(product.category_id);

//     setImagePreviews(product.images?.map((img) => img.image_url) || []);
//     setImages([]);

//     setShowForm(true); // show form when editing
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this product?")) return;
//     await axios.delete(`${BASE_URL}/admin/products/${id}`, { headers });
//     fetchProducts();
//   };

//   const resetForm = () => {
//     setEditId(null);
//     setForm(emptyForm);
//     setImages([]);
//     setImagePreviews([]);
//   };

//   return (
//     <div className="container">
//       <h3 className="mb-4">Product Management</h3>

//       {/* ================= ADD PRODUCT BUTTON ================= */}
//       <div className="mb-3">
//         <button
//           className="btn btn-primary"
//           onClick={() => {
//             resetForm();
//             setShowForm(true);
//           }}
//         >
//           Add Product
//         </button>
//       </div>

//       {/* ================= FORM ================= */}
//       {showForm && (
//         <div className="card mb-4">
//           <div className="card-body">
//             <h5>{editId ? "Edit Product" : "Add Product"}</h5>

//             <form onSubmit={handleSubmit}>
//               <div className="row g-3">
//                 <div className="col-md-6">
//                   <label>Category</label>
//                   <select
//                     className="form-control"
//                     value={form.category_id}
//                     onChange={handleCategoryChange}
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="col-md-6">
//                   <label>Sub Category</label>
//                   <select
//                     className="form-control"
//                     name="sub_category_id"
//                     value={form.sub_category_id}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Sub Category</option>
//                     {subCategories.map((s) => (
//                       <option key={s.id} value={s.id}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="col-md-6">
//                   <label>Product Name</label>
//                   <input
//                     className="form-control"
//                     name="product_name"
//                     value={form.product_name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="col-md-3">
//                   <label>SKU</label>
//                   <input
//                     className="form-control"
//                     name="sku"
//                     value={form.sku}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="col-md-3">
//                   <label>Status</label>
//                   <select
//                     className="form-control"
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>

//                 <div className="col-md-3">
//                   <label>Base Price</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="base_price"
//                     value={form.base_price}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 <div className="col-md-3">
//                   <label>Stock Quantity</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="stock_quantity"
//                     value={form.stock_quantity}
//                     onChange={handleChange}
//                   />
//                 </div>

//                 {Object.keys(form.attributes).map((key) => (
//                   <div className="col-md-3" key={key}>
//                     <label>{key.replace("_", " ")}</label>
//                     <input
//                       className="form-control"
//                       name={`attr.${key}`}
//                       value={form.attributes[key]}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 ))}

//                 <div className="col-md-12">
//                   <label>Product Images</label>
//                   <input
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     className="form-control"
//                     onChange={handleImageChange}
//                   />
//                 </div>

//                 {imagePreviews.length > 0 && (
//                   <div className="col-md-12 d-flex flex-wrap gap-2">
//                     {imagePreviews.map((src, i) => (
//                       <img
//                         key={i}
//                         src={src}
//                         alt="preview"
//                         style={{
//                           width: 100,
//                           height: 100,
//                           objectFit: "cover",
//                           border: "1px solid #ccc",
//                         }}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="d-flex gap-2 mt-3">
//                 <button type="submit" className="btn btn-warning">
//                   {loading
//                     ? "Saving..."
//                     : editId
//                     ? "Update Product"
//                     : "Add Product"}
//                 </button>

//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => {
//                     resetForm();
//                     setShowForm(false);
//                   }}
//                 >
//                   Close
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= LIST ================= */}
//       <div className="card">
//         <div className="card-body">
//           <h5>Product List</h5>

//           <table className="table table-bordered">
//             <thead>
//               <tr>
//                 <th>Sr</th>
//                 <th>Name</th>
//                 <th>SKU</th>
//                 <th>Price</th>
//                 <th>Stock</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {products.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="text-center">
//                     Product not found
//                   </td>
//                 </tr>
//               ) : (
//                 products.map((p, i) => (
//                   <tr key={p.id}>
//                     <td>{i + 1}</td>
//                     <td>{p.product_name}</td>
//                     <td>{p.sku}</td>
//                     <td>₹{p.base_price}</td>
//                     <td>{p.stock_quantity}</td>
//                     <td>{p.status}</td>
//                     <td>
//                       <button
//                         className="btn btn-sm btn-warning me-2"
//                         onClick={() => handleEdit(p)}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="btn btn-sm btn-danger"
//                         onClick={() => handleDelete(p.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminProductForm from "./AdminProductForm";
import AdminProductTable from "./AdminProductTable";

const BASE_URL = "https://sevaramjewellers.com/api";

export default function AdminProducts() {
  const token = localStorage.getItem("admin_token");

  const headers = { Authorization: `Bearer ${token}` };

  const emptyForm = {
    category_id: "",
    sub_category_id: "",
    product_name: "",
    sku: "",
    base_price: "",
    stock_quantity: "",
    status: "active",
    attributes: {
      metal_type: "",
      purity: "",
      gross_weight: "",
      net_weight: "",
      making_charges_type: "percentage",
      making_charges: "",
      stone_charges: "",
      gst: "",
      gender: "",
      occasion: "",
      design_style: "",
      certification: "",
    },
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/products`, { headers });
      setProducts(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
    setCategories(res.data.data || []);
  };

  const fetchSubCategories = async (categoryId) => {
    const res = await axios.get(`${BASE_URL}/admin/sub-categories`, { headers });
    setSubCategories(
      res.data.data.filter((s) => s.category_id === Number(categoryId))
    );
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ================= HANDLERS ================= */
  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      ...product,
      attributes: product.attributes || emptyForm.attributes,
    });
    fetchSubCategories(product.category_id);
    setImagePreviews(product.images?.map((i) => i.image_url) || []);
    setImages([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/products/${id}`, { headers });
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  /* ================= CLONE ================= */
  const handleClone = async (id) => {
    if (!window.confirm("Duplicate this product?")) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/products/${id}/clone`, null, { headers });
      alert("Product duplicated successfully!");
      fetchProducts();
    } catch {
      alert("Failed to duplicate product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ALL IMAGES ================= */
  const deleteAllImages = async (productId) => {
    if (!window.confirm("Delete all images of this product?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/products/${productId}/images`, { headers });
      alert("All images deleted successfully!");
      fetchProducts();
    } catch {
      alert("Failed to delete images");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((k) => {
        if (k !== "attributes") formData.append(k, form[k]);
      });

      Object.keys(form.attributes).forEach((k) => {
        formData.append(`attributes[${k}]`, form.attributes[k]);
      });

      images.forEach((img) => formData.append("images[]", img));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editId) {
        await axios.post(`${BASE_URL}/admin/products/${editId}?_method=PUT`, formData, config);
      } else {
        await axios.post(`${BASE_URL}/admin/products`, formData, config);
      }

      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3 className="mb-4">Product Management</h3>

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      >
        Add Product
      </button>

      {showForm && (
        <AdminProductForm
          form={form}
          setForm={setForm}
          categories={categories}
          subCategories={subCategories}
          fetchSubCategories={fetchSubCategories}
          handleSubmit={handleSubmit}
          loading={loading}
          editId={editId}
          images={images}
          setImages={setImages}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          onClose={() => setShowForm(false)}
        />
      )}

      <AdminProductTable
        products={products}
        categories={categories}
        subCategories={subCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClone={handleClone}
        onDeleteAllImages={deleteAllImages}
        loading={loading}
      />
    </div>
  );
}
