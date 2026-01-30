import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminProductForm from "./AdminProductForm";
import AdminProductTable from "./AdminProductTable";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

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
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/admin/products`, { headers });
      setProducts(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/categories`, { headers });
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchAllSubCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/sub-categories`, {
        headers,
      });
      setAllSubCategories(res.data.data || []);
    } catch {
      setAllSubCategories([]);
    }
  };

  const fetchSubCategories = (categoryId) => {
    const filtered = allSubCategories.filter(
      (s) => s.category_id === Number(categoryId)
    );
    setSubCategories(filtered);
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    fetchCategories();
    fetchAllSubCategories();
  }, []);

  /* ================= FORM ================= */
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
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleClone = async (id) => {
    if (!window.confirm("Duplicate this product?")) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/products/${id}/clone`, null, {
        headers,
      });
      fetchProducts();
    } catch {
      alert("Clone failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllImages = async (productId) => {
    if (!window.confirm("Delete all images?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/products/${productId}/images`, {
        headers,
      });
      fetchProducts();
    } catch {
      alert("Failed to delete images");
    }
  };

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
        await axios.post(
          `${BASE_URL}/admin/products/${editId}?_method=PUT`,
          formData,
          config
        );
      } else {
        await axios.post(`${BASE_URL}/admin/products`, formData, config);
      }

      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK CSV ================= */
  const downloadCsvTemplate = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/admin/products/bulk-upload/template`,
        { headers, responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "product_bulk_upload_template.csv";
      link.click();
    } catch {
      alert("Download failed");
    }
  };

  const uploadBulkCsv = async (file) => {
    if (!file) {
      alert("Please select CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/products/bulk-upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Bulk upload successful");
      fetchProducts();
    } catch {
      alert("Bulk upload failed");
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
          onDeleteAllImages={deleteAllImages}
        />
      )}

      <AdminProductTable
        products={products}
        categories={categories}
        subCategories={allSubCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClone={handleClone}
        loading={loading}
        onDownloadCsv={downloadCsvTemplate}
        onUploadCsv={uploadBulkCsv}
      />
    </div>
  );
}
