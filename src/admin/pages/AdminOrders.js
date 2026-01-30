// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

// const STATUS_TABS = [
//   { label: "All", value: "" },
//   { label: "Pending", value: "pending" },
//   { label: "Confirmed", value: "confirmed" },
//   { label: "Shipped", value: "shipped" },
//   { label: "Delivered", value: "delivered" },
//   { label: "Cancelled", value: "cancelled" },
//   { label: "Returned", value: "returned" },
// ];

// const ORDER_STATUSES = [
//   "pending",
//   "confirmed",
//   "shipped",
//   "delivered",
//   "cancelled",
//   "returned",
// ];

// export default function AdminOrders() {
//   const token = localStorage.getItem("admin_token");

//   const api = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: "application/json",
//     },
//   });

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("");

//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [showCourierModal, setShowCourierModal] = useState(false);
//   const [showRefundModal, setShowRefundModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);

//   const [courierData, setCourierData] = useState({
//     courier_name: "",
//     tracking_number: "",
//   });

//   const [refundData, setRefundData] = useState({
//     amount: "",
//     reason: "",
//   });

//   /* ================= FETCH ORDERS ================= */
//   const fetchOrders = async (status = "") => {
//     try {
//       setLoading(true);
//       const url = status ? `/admin/orders?status=${status}` : `/admin/orders`;

//       const res = await api.get(url);
//       setOrders(res.data?.data || []);
//     } catch (err) {
//       console.error("Failed to fetch orders", err);
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(statusFilter);
//   }, [statusFilter]);

//   /* ================= UPDATE STATUS ================= */
//   const updateStatus = async (orderId, status) => {
//     if (!window.confirm(`Change order status to "${status}"?`)) return;

//     try {
//       await api.patch(`/admin/orders/${orderId}/status`, { status });
//       fetchOrders(statusFilter);
//     } catch (err) {
//       alert("Failed to update order status");
//     }
//   };

//   /* ================= VIEW ORDER ================= */
//   const viewOrder = async (orderId) => {
//     try {
//       const res = await api.get(`/admin/orders/${orderId}`);
//       setSelectedOrder(res.data);
//       setShowViewModal(true);
//     } catch {
//       alert("Failed to load order");
//     }
//   };

//   /* ================= ASSIGN COURIER ================= */
//   const assignCourier = async () => {
//     try {
//       await api.post(
//         `/admin/orders/${selectedOrder.id}/assign-courier`,
//         courierData,
//       );
//       alert("Courier assigned");
//       setShowCourierModal(false);
//       fetchOrders(statusFilter);
//     } catch {
//       alert("Courier assignment failed");
//     }
//   };

//   /* ================= REFUND ================= */
//   const processRefund = async () => {
//     try {
//       await api.post(`/admin/orders/${selectedOrder.id}/refund`, refundData);
//       alert("Refund processed");
//       setShowRefundModal(false);
//       fetchOrders(statusFilter);
//     } catch {
//       alert("Refund failed");
//     }
//   };

//   /* ================= INVOICE ================= */
//   const downloadInvoice = async (orderId) => {
//     try {
//       const res = await api.get(`/admin/orders/${orderId}/invoice`, {
//         responseType: "blob",
//       });

//       const url = window.URL.createObjectURL(
//         new Blob([res.data], { type: "application/pdf" }),
//       );

//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `invoice_${orderId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch {
//       alert("Invoice download failed");
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="container mt-3">
//       <h3 className="mb-3">Orders</h3>

//       {/* STATUS FILTER */}
//       <div className="mb-3 d-flex flex-wrap gap-2">
//         {STATUS_TABS.map((tab) => (
//           <button
//             key={tab.value}
//             className={`btn btn-sm ${
//               statusFilter === tab.value ? "btn-dark" : "btn-outline-dark"
//             }`}
//             onClick={() => setStatusFilter(tab.value)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* TABLE */}
//       <div className="card">
//         <div className="card-body">
//           {loading ? (
//             <div className="text-center py-4">
//               <div className="spinner-border me-2" />
//               Loading orders...
//             </div>
//           ) : (
//             <table className="table table-bordered align-middle">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Order No</th>
//                   <th>User</th>
//                   <th>Total</th>
//                   <th>Payment</th>
//                   <th>Status</th>
//                   <th>Change</th>
//                   <th>Date</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.length ? (
//                   orders.map((order, i) => (
//                     <tr key={order.id}>
//                       <td>{i + 1}</td>
//                       <td>{order.order_number}</td>
//                       <td>
//                         <strong>{order.user?.name}</strong>
//                         <br />
//                         <small>{order.user?.email}</small>
//                       </td>
//                       <td>₹ {order.total}</td>
//                       <td>
//                         <span className="badge bg-info">
//                           {order.payment_method}
//                         </span>
//                         <br />
//                         <small>{order.payment_status}</small>
//                       </td>
//                       <td>
//                         <span className="badge bg-secondary text-uppercase">
//                           {order.order_status}
//                         </span>
//                       </td>
//                       <td>
//                         <select
//                           className="form-select form-select-sm"
//                           value={order.order_status}
//                           onChange={(e) =>
//                             updateStatus(order.id, e.target.value)
//                           }
//                         >
//                           {ORDER_STATUSES.map((st) => (
//                             <option key={st} value={st}>
//                               {st}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td>{new Date(order.created_at).toLocaleDateString()}</td>
//                       <td className="d-flex gap-1 flex-wrap">
//                         <button
//                           className="btn btn-sm btn-primary"
//                           onClick={() => viewOrder(order.id)}
//                         >
//                           View
//                         </button>
//                         <button
//                           className="btn btn-sm btn-warning"
//                           onClick={() => {
//                             setSelectedOrder(order);
//                             setShowCourierModal(true);
//                           }}
//                         >
//                           Courier
//                         </button>
//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() => {
//                             setSelectedOrder(order);
//                             setShowRefundModal(true);
//                           }}
//                         >
//                           Refund
//                         </button>
//                         <button
//                           className="btn btn-sm btn-success"
//                           onClick={() => downloadInvoice(order.id)}
//                         >
//                           Invoice
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="9" className="text-center text-muted">
//                       No orders found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {/* VIEW ORDER MODAL */}
//       {showViewModal && selectedOrder && (
//         <div className="modal d-block bg-dark bg-opacity-50">
//           <div className="modal-dialog modal-xl modal-dialog-scrollable">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   Order Details – {selectedOrder.order_number}
//                 </h5>
//                 <button
//                   className="btn-close"
//                   onClick={() => setShowViewModal(false)}
//                 />
//               </div>

//               <div className="modal-body">
//                 {/* ================= USER INFO ================= */}
//                 <div className="mb-3">
//                   <h6>User Details</h6>
//                   <p className="mb-1">
//                     <strong>Name:</strong> {selectedOrder.user?.name}
//                   </p>
//                   <p className="mb-1">
//                     <strong>Email:</strong> {selectedOrder.user?.email}
//                   </p>
//                   <p className="mb-1">
//                     <strong>Payment:</strong> {selectedOrder.payment_method} (
//                     {selectedOrder.payment_status})
//                   </p>
//                 </div>

//                 <hr />

//                 {/* ================= ADDRESS ================= */}
//                 <div className="mb-3">
//                   <h6>Delivery Address</h6>
//                   <p className="mb-0">
//                     {selectedOrder.address?.name} <br />
//                     {selectedOrder.address?.address} <br />
//                     {selectedOrder.address?.city},{" "}
//                     {selectedOrder.address?.state} –{" "}
//                     {selectedOrder.address?.pincode}
//                   </p>
//                   <small>📞 {selectedOrder.address?.phone}</small>
//                 </div>

//                 <hr />

//                 {/* ================= ORDER ITEMS ================= */}
//                 <div className="mb-3">
//                   <h6>Ordered Items</h6>
//                   <table className="table table-sm table-bordered">
//                     <thead className="table-light">
//                       <tr>
//                         <th>#</th>
//                         <th>Product</th>
//                         <th>SKU</th>
//                         <th>Price</th>
//                         <th>Qty</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.items?.map((item, index) => (
//                         <tr key={item.id}>
//                           <td>{index + 1}</td>
//                           <td>{item.product?.product_name}</td>
//                           <td>{item.product?.sku}</td>
//                           <td>₹ {item.price}</td>
//                           <td>{item.quantity}</td>
//                           <td>₹ {item.total}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <hr />

//                 {/* ================= PRICE SUMMARY ================= */}
//                 <div className="row">
//                   <div className="col-md-6">
//                     <p>
//                       <strong>Subtotal:</strong> ₹ {selectedOrder.subtotal}
//                     </p>
//                     <p>
//                       <strong>GST:</strong> ₹ {selectedOrder.gst}
//                     </p>
//                     <p>
//                       <strong>Discount:</strong> ₹ {selectedOrder.discount}
//                     </p>
//                     <h6>
//                       <strong>Total:</strong> ₹ {selectedOrder.total}
//                     </h6>
//                   </div>

//                   <div className="col-md-6">
//                     <p>
//                       <strong>Order Status:</strong>{" "}
//                       <span className="badge bg-secondary text-uppercase">
//                         {selectedOrder.order_status}
//                       </span>
//                     </p>
//                     <p>
//                       <strong>Courier:</strong>{" "}
//                       {selectedOrder.courier_name || "-"}
//                     </p>
//                     <p>
//                       <strong>Tracking No:</strong>{" "}
//                       {selectedOrder.tracking_number || "-"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* ================= REFUND ================= */}
//                 {selectedOrder.refund && (
//                   <>
//                     <hr />
//                     <div>
//                       <h6>Refund Details</h6>
//                       <p>
//                         <strong>Amount:</strong> ₹ {selectedOrder.refund.amount}
//                       </p>
//                       <p>
//                         <strong>Reason:</strong> {selectedOrder.refund.reason}
//                       </p>
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowViewModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* COURIER MODAL */}
//       {showCourierModal && (
//         <div className="modal d-block bg-dark bg-opacity-50">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5>Assign Courier</h5>
//                 <button
//                   className="btn-close"
//                   onClick={() => setShowCourierModal(false)}
//                 />
//               </div>
//               <div className="modal-body">
//                 <input
//                   className="form-control mb-2"
//                   placeholder="Courier Name"
//                   onChange={(e) =>
//                     setCourierData({
//                       ...courierData,
//                       courier_name: e.target.value,
//                     })
//                   }
//                 />
//                 <input
//                   className="form-control"
//                   placeholder="Tracking Number"
//                   onChange={(e) =>
//                     setCourierData({
//                       ...courierData,
//                       tracking_number: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowCourierModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={assignCourier}>
//                   Assign
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* REFUND MODAL */}
//       {showRefundModal && (
//         <div className="modal d-block bg-dark bg-opacity-50">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5>Process Refund</h5>
//                 <button
//                   className="btn-close"
//                   onClick={() => setShowRefundModal(false)}
//                 />
//               </div>
//               <div className="modal-body">
//                 <input
//                   type="number"
//                   className="form-control mb-2"
//                   placeholder="Amount"
//                   onChange={(e) =>
//                     setRefundData({ ...refundData, amount: e.target.value })
//                   }
//                 />
//                 <textarea
//                   className="form-control"
//                   placeholder="Reason"
//                   onChange={(e) =>
//                     setRefundData({ ...refundData, reason: e.target.value })
//                   }
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowRefundModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="btn btn-danger" onClick={processRefund}>
//                   Refund
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
];

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default function AdminOrders() {
  const token = localStorage.getItem("admin_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [courierData, setCourierData] = useState({
    courier_name: "",
    tracking_number: "",
  });

  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async (status = "") => {
    try {
      setLoading(true);
      const url = status ? `/admin/orders?status=${status}` : `/admin/orders`;
      const res = await api.get(url);
      setOrders(res.data?.data || []);
      setCurrentPage(1); // reset to first page on filter change
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (orderId, status) => {
    if (!window.confirm(`Change order status to "${status}"?`)) return;

    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      fetchOrders(statusFilter);
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  /* ================= VIEW ORDER ================= */
  const viewOrder = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
      setShowViewModal(true);
    } catch {
      alert("Failed to load order");
    }
  };

  /* ================= ASSIGN COURIER ================= */
  const assignCourier = async () => {
    try {
      await api.post(
        `/admin/orders/${selectedOrder.id}/assign-courier`,
        courierData,
      );
      alert("Courier assigned");
      setShowCourierModal(false);
      fetchOrders(statusFilter);
    } catch {
      alert("Courier assignment failed");
    }
  };

  /* ================= REFUND ================= */
  const processRefund = async () => {
    try {
      await api.post(`/admin/orders/${selectedOrder.id}/refund`, refundData);
      alert("Refund processed");
      setShowRefundModal(false);
      fetchOrders(statusFilter);
    } catch {
      alert("Refund failed");
    }
  };

  /* ================= INVOICE ================= */
  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Invoice download failed");
    }
  };

  /* ================= SEARCH & PAGINATION ================= */
  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container mt-3">
      <h3 className="mb-3">Orders</h3>

      {/* STATUS FILTER */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`btn btn-sm ${
              statusFilter === tab.value ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH & PER PAGE */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by Order No / User / Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-select w-auto"
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border me-2" />
              Loading orders...
            </div>
          ) : (
            <>
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order No</th>
                    <th>User</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Change</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.length ? (
                    displayedOrders.map((order, i) => (
                      <tr key={order.id}>
                        <td>{(currentPage - 1) * perPage + i + 1}</td>
                        <td>{order.order_number}</td>
                        <td>
                          <strong>{order.user?.name}</strong>
                          <br />
                          <small>{order.user?.email}</small>
                        </td>
                        <td>₹ {order.total}</td>
                        <td>
                          <span className="badge bg-info">
                            {order.payment_method}
                          </span>
                          <br />
                          <small>{order.payment_status}</small>
                        </td>
                        <td>
                          <span className="badge bg-secondary text-uppercase">
                            {order.order_status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={order.order_status}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="d-flex gap-1 flex-wrap">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => viewOrder(order.id)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCourierModal(true);
                            }}
                          >
                            Courier
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowRefundModal(true);
                            }}
                          >
                            Refund
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => downloadInvoice(order.id)}
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <nav className="mt-2">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => changePage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(currentPage + 1)}
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

      {/* ================= MODALS ================= */}

      {/* VIEW ORDER MODAL */}
      {showViewModal && selectedOrder && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Order Details – {selectedOrder.order_number}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>User Details</h6>
                  <p className="mb-1">
                    <strong>Name:</strong> {selectedOrder.user?.name}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong> {selectedOrder.user?.email}
                  </p>
                  <p className="mb-1">
                    <strong>Payment:</strong> {selectedOrder.payment_method} (
                    {selectedOrder.payment_status})
                  </p>
                </div>
                <hr />
                <div className="mb-3">
                  <h6>Delivery Address</h6>
                  <p className="mb-0">
                    {selectedOrder.address?.name} <br />
                    {selectedOrder.address?.address} <br />
                    {selectedOrder.address?.city},{" "}
                    {selectedOrder.address?.state} –{" "}
                    {selectedOrder.address?.pincode}
                  </p>
                  <small>📞 {selectedOrder.address?.phone}</small>
                </div>
                <hr />
                <div className="mb-3">
                  <h6>Ordered Items</h6>
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.product?.product_name}</td>
                          <td>{item.product?.sku}</td>
                          <td>₹ {item.price}</td>
                          <td>{item.quantity}</td>
                          <td>₹ {item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Subtotal:</strong> ₹ {selectedOrder.subtotal}
                    </p>
                    <p>
                      <strong>GST:</strong> ₹ {selectedOrder.gst}
                    </p>
                    <p>
                      <strong>Discount:</strong> ₹ {selectedOrder.discount}
                    </p>
                    <h6>
                      <strong>Total:</strong> ₹ {selectedOrder.total}
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Order Status:</strong>{" "}
                      <span className="badge bg-secondary text-uppercase">
                        {selectedOrder.order_status}
                      </span>
                    </p>
                    <p>
                      <strong>Courier:</strong>{" "}
                      {selectedOrder.courier_name || "-"}
                    </p>
                    <p>
                      <strong>Tracking No:</strong>{" "}
                      {selectedOrder.tracking_number || "-"}
                    </p>
                  </div>
                </div>
                {selectedOrder.refund && (
                  <>
                    <hr />
                    <div>
                      <h6>Refund Details</h6>
                      <p>
                        <strong>Amount:</strong> ₹ {selectedOrder.refund.amount}
                      </p>
                      <p>
                        <strong>Reason:</strong> {selectedOrder.refund.reason}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURIER MODAL */}
      {showCourierModal && selectedOrder && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Assign Courier</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCourierModal(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Courier Name"
                  value={courierData.courier_name}
                  onChange={(e) =>
                    setCourierData({
                      ...courierData,
                      courier_name: e.target.value,
                    })
                  }
                />
                <input
                  className="form-control"
                  placeholder="Tracking Number"
                  value={courierData.tracking_number}
                  onChange={(e) =>
                    setCourierData({
                      ...courierData,
                      tracking_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCourierModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={assignCourier}>
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {showRefundModal && selectedOrder && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Process Refund</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowRefundModal(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Amount"
                  value={refundData.amount}
                  onChange={(e) =>
                    setRefundData({ ...refundData, amount: e.target.value })
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Reason"
                  value={refundData.reason}
                  onChange={(e) =>
                    setRefundData({ ...refundData, reason: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRefundModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={processRefund}>
                  Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
