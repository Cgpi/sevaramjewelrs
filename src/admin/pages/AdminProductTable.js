import { useMemo, useState } from "react";

export default function AdminProductTable({
  products = [],
  categories = [],
  subCategories = [],
  onEdit,
  onDelete,
  onClone,
  onUpdateStock, // ✅ ADD
  onViewStockHistory,
  onDownloadCsv,
  onUploadCsv,
  loading = false,
}) {
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [csvFile, setCsvFile] = useState(null);
  const [stockModal, setStockModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState("");
  const [history, setHistory] = useState([]);

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "-";
  const getSubCategoryName = (id) =>
    subCategories.find((s) => s.id === id)?.name || "-";

  /* ================= FILTER ================= */
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

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useMemo(() => {
    setCurrentPage(1);
  }, [searchName, filterCategory, filterSubCategory, itemsPerPage]);

  /* ================= SMART PAGINATION ================= */
  const getPagination = () => {
    const delta = 2;
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
      if (i - last > 1) rangeWithDots.push("...");
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockChange("");
    setStockModal(true);
  };

  const openHistoryModal = async (product) => {
    setSelectedProduct(product); // the clicked product
    setHistoryModal(true);

    try {
      const res = await onViewStockHistory(); // fetch all history from backend
      const allHistory = res.data.data || [];

      // ✅ Filter on frontend if a specific product is selected
      const filteredHistory = product
        ? allHistory.filter((h) => h.product_id === product.id)
        : allHistory; // show all if product is null

      setHistory(filteredHistory);
    } catch {
      alert("Failed to load history");
    }
  };

  return (
    <div className="card position-relative">
      <div className="card-body">
        <h5 className="mb-3">Product List</h5>

        {/* ================= BULK CSV ================= */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className="btn btn-success btn-sm"
            onClick={onDownloadCsv}
            disabled={loading}
          >
            Download CSV
          </button>

          <input
            type="file"
            accept=".csv"
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            onChange={(e) => setCsvFile(e.target.files[0])}
            disabled={loading}
          />

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onUploadCsv(csvFile)}
            disabled={loading || !csvFile}
          >
            Upload CSV
          </button>
        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-3">
            <input
              className="form-control"
              placeholder="Search Product Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            >
              <option value="">All Sub Categories</option>
              {subCategories
                .filter(
                  (s) =>
                    !filterCategory || String(s.category_id) === filterCategory,
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
              disabled={loading}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* ================= LOADER ================= */}
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              background: "rgba(255,255,255,0.7)",
              zIndex: 10,
            }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* ================= TABLE ================= */}
        <div
          className="table-responsive"
          style={{ opacity: loading ? 0.5 : 1 }}
        >
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

                <th className="text-center">Stock </th>
                <th className="text-center">Actions </th>
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
                    <td>{p.product_name}</td>
                    <td>{p.sku || "-"}</td>
                    <td>{getCategoryName(p.category_id)}</td>
                    <td>{getSubCategoryName(p.sub_category_id)}</td>
                    <td className="text-end">₹{p.base_price}</td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onUpdateStock(p.id, -1)}
                          disabled={loading || p.stock_quantity <= 0}
                        >
                          -
                        </button>

                        {/* Stock Input */}
                        <input
                          type="number"
                          value={
                            stockChange[p.id] !== undefined
                              ? stockChange[p.id]
                              : p.stock_quantity
                          }
                          onChange={(e) =>
                            setStockChange((prev) => ({
                              ...prev,
                              [p.id]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            // Reset input to current stock if empty
                            if (
                              stockChange[p.id] === "" ||
                              stockChange[p.id] === null ||
                              isNaN(Number(stockChange[p.id]))
                            ) {
                              setStockChange((prev) => ({
                                ...prev,
                                [p.id]: p.stock_quantity,
                              }));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const change =
                                Number(stockChange[p.id]) - p.stock_quantity;
                              if (!isNaN(change) && change !== 0) {
                                onUpdateStock(p.id, change);
                              }
                              // Reset input to latest stock after update
                              setStockChange((prev) => ({
                                ...prev,
                                [p.id]: p.stock_quantity,
                              }));
                            }
                          }}
                          placeholder="Stock"
                          style={{ width: 70, textAlign: "center" }}
                          disabled={loading}
                          className="form-control form-control-sm"
                        />

                        {/* + Button */}
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => onUpdateStock(p.id, 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                    </td>
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
                          onClick={() => onClone(p.id)}
                        >
                          Clone
                        </button>

                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => openHistoryModal(p)}
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION UI ================= */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-3 gap-1">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
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
                    currentPage === p ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => handlePageChange(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ),
            )}

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>
        )}

        {stockModal && (
          <div
            className="modal show d-block"
            style={{ background: "#00000088" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    Stock History –{" "}
                    {selectedProduct?.product_name || "All Products"}
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() => setStockModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="+ Add / - Reduce stock"
                    value={stockChange}
                    onChange={(e) => setStockChange(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStockModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onUpdateStock(selectedProduct.id, stockChange);
                      setStockModal(false);
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {historyModal && (
          <div
            className="modal show d-block"
            style={{ background: "#00000088" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    Stock History –{" "}
                    {selectedProduct?.product_name || "All Products"}
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() => setHistoryModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th> {/* optional */}
                        <th>Change</th>
                        <th>Stock After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No History
                          </td>
                        </tr>
                      ) : (
                        history.map((h, i) => (
                          <tr key={i}>
                            <td>{h.created_at}</td>
                            <td>{h.product_name || `#${h.product_id}`}</td>{" "}
                            {/* optional */}
                            <td>{h.change}</td>
                            <td>{h.stock_after}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
