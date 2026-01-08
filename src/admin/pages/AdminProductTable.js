import { useMemo, useState } from "react";

export default function AdminProductTable({
  products = [],
  categories = [],
  subCategories = [],
  onEdit,
  onDelete,
  onClone,
  onDeleteAllImages,
  loading = false,
}) {
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // default items per page

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "-";
  const getSubCategoryName = (id) =>
    subCategories.find((s) => s.id === id)?.name || "-";

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.product_name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const matchCategory = filterCategory
        ? String(p.category_id) === filterCategory
        : true;
      const matchSubCategory = filterSubCategory
        ? String(p.sub_category_id) === filterSubCategory
        : true;
      return matchName && matchCategory && matchSubCategory;
    });
  }, [products, searchName, filterCategory, filterSubCategory]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Reset page when filter/search/itemsPerPage changes
  useMemo(
    () => setCurrentPage(1),
    [searchName, filterCategory, filterSubCategory, itemsPerPage]
  );

  // ================= SMART PAGINATION =================
  const getPagination = () => {
    const delta = 2; // show current ±2 pages
    const range = [];
    const rangeWithDots = [];
    const total = totalPages;
    const current = currentPage;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    let last = 0;
    for (let i of range) {
      if (i - last > 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="mb-3">Product List</h5>

        {/* ================= SEARCH, FILTER & ITEMS PER PAGE ================= */}
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-3">
            <input
              className="form-control"
              placeholder="Search Product Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-control"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubCategory("");
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-control"
              value={filterSubCategory}
              onChange={(e) => setFilterSubCategory(e.target.value)}
            >
              <option value="">All Sub Categories</option>
              {subCategories
                .filter(
                  (s) =>
                    !filterCategory || String(s.category_id) === filterCategory
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-control"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={2}>2 per page</option>
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>
        </div>

        {/* ================= LOADING ================= */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 mb-0">Loading products...</p>
          </div>
        ) : (
          <>
            {/* ================= PRODUCT TABLE ================= */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Sr</th>
                    <th className="text-center">Image</th>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th className="text-end">Price</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No Products Found
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p, i) => (
                      <tr key={p.id}>
                        <td className="text-center">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td className="text-center">
                          {p.images?.length > 0 ? (
                            <img
                              src={p.images[0].image_url}
                              alt={p.product_name}
                              width="60"
                              height="60"
                              style={{ objectFit: "cover", borderRadius: 4 }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 150 }}>
                          {p.product_name}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 100 }}>
                          {p.sku || "-"}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 120 }}>
                          {getCategoryName(p.category_id)}
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 120 }}>
                          {getSubCategoryName(p.sub_category_id)}
                        </td>
                        <td className="text-end">₹{p.base_price}</td>
                        <td className="text-center">{p.stock_quantity}</td>
                        <td className="text-center">
                          <div className="d-flex flex-wrap justify-content-center gap-1">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => onEdit(p)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => onDelete(p.id)}
                            >
                              Delete
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => onClone?.(p.id)}
                            >
                              Clone
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => onDeleteAllImages?.(p.id)}
                            >
                              Delete All Images
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= SMART PAGINATION CONTROLS ================= */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-3 gap-1">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {getPagination().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={idx}
                      className="btn btn-sm btn-outline-secondary disabled"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      className={`btn btn-sm ${
                        currentPage === p
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
