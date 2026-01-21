import { useState, useRef } from "react";

export default function AdminProductForm({
  form,
  setForm,
  categories,
  subCategories,
  fetchSubCategories,
  handleSubmit,
  loading,
  editId,
  images,
  setImages,
  imagePreviews,
  setImagePreviews,
  onClose,
  onDeleteAllImages,
}) {
  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("attr.")) {
      const key = name.replace("attr.", "");
      setForm((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, category_id: id, sub_category_id: "" });
    fetchSubCategories(id);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    setImagePreviews([
      ...imagePreviews,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    const copyImages = [...imagePreviews];
    const draggedItemContent = copyImages[dragItem.current];
    copyImages.splice(dragItem.current, 1);
    copyImages.splice(dragOverItem.current, 0, draggedItemContent);

    const copyFiles = [...images];
    const draggedFile = copyFiles[dragItem.current];
    copyFiles.splice(dragItem.current, 1);
    copyFiles.splice(dragOverItem.current, 0, draggedFile);

    setImagePreviews(copyImages);
    setImages(copyFiles);

    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5>{editId ? "Edit Product" : "Add Product"}</h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* ================= CATEGORY ================= */}
            <div className="col-md-6">
              <label>Category</label>
              <select
                className="form-control"
                value={form.category_id}
                onChange={handleCategoryChange}
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label>Sub Category</label>
              <select
                className="form-control"
                name="sub_category_id"
                value={form.sub_category_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= BASIC INFO ================= */}
            <div className="col-md-6">
              <label>Product Name</label>
              <input
                className="form-control"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-3">
              <label>SKU</label>
              <input
                className="form-control"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="col-md-3">
              <label>Status</label>
              <select
                className="form-control"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Base Price</label>
              <input
                type="number"
                className="form-control"
                name="base_price"
                value={form.base_price}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="col-md-3">
              <label>Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* ================= ATTRIBUTES ================= */}
            {Object.keys(form.attributes).map((key) => (
              <div className="col-md-3" key={key}>
                <label>{key.replace(/_/g, " ")}</label>
                <input
                  className="form-control"
                  name={`attr.${key}`}
                  value={form.attributes[key]}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            ))}

            {/* ================= IMAGES ================= */}
            <div className="col-md-12">
              <label>Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
                disabled={loading}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="col-12 mt-3">
                {/* Image Preview Grid */}
                <div className="row g-2">
                  {imagePreviews.map((src, i) => (
                    <div
                      key={i}
                      className="col-4 col-sm-3 col-md-2"
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragEnter={() => handleDragEnter(i)}
                      onDragEnd={handleDragEnd}
                      style={{ cursor: "grab" }}
                    >
                      <div className="position-relative">
                        <img
                          src={src}
                          alt="preview"
                          className="img-fluid rounded border"
                          style={{
                            height: 120,
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* Remove Single Image */}
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle"
                          style={{
                            width: 22,
                            height: 22,
                            padding: 0,
                            borderRadius: "50%",
                            fontSize: 14,
                            lineHeight: "14px",
                          }}
                          onClick={() => removeImage(i)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delete All Images Button */}
                {editId && (
                  <div className="mt-3 d-flex justify-content-start">
                    <button
                      type="button"
                      className="btn btn-danger w-20 w-sm-auto"
                      disabled={loading}
                      onClick={() => onDeleteAllImages(editId)}
                    >
                      Delete All Images
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="d-flex gap-2 mt-3">
            <button
              type="submit"
              className="btn btn-warning d-flex align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : editId ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
