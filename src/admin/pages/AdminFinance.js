import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

/* ================= LOADER ================= */
const Loader = ({ text = "Loading..." }) => (
  <div className="d-flex justify-content-center align-items-center py-4">
    <div className="spinner-border text-warning me-2" />
    <strong>{text}</strong>
  </div>
);

/* ================= TABLE COMPONENTS ================= */
const PaymentTable = ({ data }) => (
  <div className="table-responsive">
    <table className="table table-bordered align-middle table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Reference</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Method</th>
          <th>Transactions</th>
        </tr>
      </thead>
      <tbody>
        {data.length ? (
          data.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.reference}</td>
              <td>₹{p.amount}</td>
              <td>
                <span
                  className={`badge ${
                    p.status === "success"
                      ? "bg-success"
                      : p.status === "refunded"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td>{p.method}</td>
              <td>{p.transactions?.length || 0}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="text-center text-muted">
              No payments found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const TransactionTable = ({ data }) => {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>

            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Reference</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((tx) => (
              <React.Fragment key={tx.id}>
                {/* MAIN ROW */}
                <tr>
                  <td>{tx.id}</td>

                  <td>{tx.type}</td>
                  <td>₹{tx.amount}</td>
                  <td>{tx.status}</td>
                  <td>{tx.reference}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => toggleRow(tx.id)}
                    >
                      {openRow === tx.id ? "Hide" : "View More"}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW */}
                {openRow === tx.id && (
                  <tr className="bg-light">
                    <td colSpan={7}>
                      <div className="row g-3">
                        {/* META / ORDER */}
                        <div className="col-md-4">
                          <h6 className="fw-bold">Order / Meta</h6>
                          <pre className="small bg-white p-2 rounded">
                            {JSON.stringify(
                              JSON.parse(tx.meta || "{}"),
                              null,
                              2,
                            )}
                          </pre>
                        </div>

                        {/* PAYMENT DETAILS */}
                        <div className="col-md-4">
                          <h6 className="fw-bold">Payment Details</h6>
                          <p className="mb-1">
                            <strong>Reference:</strong> {tx.payment?.reference}
                          </p>
                          <p className="mb-1">
                            <strong>Amount:</strong> ₹{tx.payment?.amount}
                          </p>
                          <p className="mb-1">
                            <strong>Status:</strong> {tx.payment?.status}
                          </p>
                          <p className="mb-1">
                            <strong>Method:</strong> {tx.payment?.method}
                          </p>
                          <p className="mb-1">
                            <strong>Gateway:</strong> {tx.payment?.gateway}
                          </p>
                          <p className="mb-1">
                            <strong>Created:</strong>{" "}
                            {new Date(tx.payment?.created_at).toLocaleString()}
                          </p>
                        </div>

                        {/* USER DETAILS */}
                        <div className="col-md-4">
                          <h6 className="fw-bold">User Details</h6>
                          <p className="mb-1">
                            <strong>Name:</strong> {tx.payment?.user?.name}
                          </p>
                          <p className="mb-1">
                            <strong>Email:</strong> {tx.payment?.user?.email}
                          </p>
                          <p className="mb-1">
                            <strong>Joined:</strong>{" "}
                            {new Date(
                              tx.payment?.user?.created_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center text-muted">
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ReportTable = ({ reportType, data }) => {
  if (reportType === "orders") {
    return (
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((order, i) => (
                <tr key={order.id}>
                  <td>{i + 1}</td>
                  <td>{order.order_number}</td>
                  <td>{order.user?.name || "-"}</td>
                  <td>{order.address?.phone || "-"}</td>
                  <td>₹{order.total}</td>
                  <td>{order.payment_method}</td>
                  <td>{order.payment_status}</td>
                  <td>{order.order_status}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Other reports (sales, customers, tax)
  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k}>
                      <strong>{k.replace(/_/g, " ")}:</strong>{" "}
                      {v?.name || v?.toString() || "-"}
                    </div>
                  ))}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center text-muted">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function AdminFinance() {
  const token = localStorage.getItem("admin_token");
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const [section, setSection] = useState("payments");
  const [subSection, setSubSection] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [reportType, setReportType] = useState("sales");

  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "";

      if (section === "payments") {
        switch (subSection) {
          case "success":
            url = `${BASE_URL}/admin/payments/success`;
            break;
          case "failed":
            url = `${BASE_URL}/admin/payments/failed`;
            break;
          case "refunds":
            url = `${BASE_URL}/admin/payments/refunds`;
            break;
          default:
            url = `${BASE_URL}/admin/payments`;
        }
      } else if (section === "transactions") {
        url = `${BASE_URL}/admin/transactions`;
      } else if (section === "reports") {
        switch (reportType) {
          case "sales":
            url = `${BASE_URL}/admin/reports/sales`;
            break;
          case "orders":
            url = `${BASE_URL}/admin/reports/orders`;
            break;
          case "customers":
            url = `${BASE_URL}/admin/reports/customers`;
            break;
          case "tax":
            url = `${BASE_URL}/admin/reports/tax`;
            break;
          default:
            url = `${BASE_URL}/admin/reports/sales`;
        }
      }

      /* ===== BUILD QUERY PARAMS ===== */
      const queryParams = new URLSearchParams();
      queryParams.set("page", page);

      if (reportType === "sales" && dateFilter.from && dateFilter.to) {
        queryParams.set("from", dateFilter.from);
        queryParams.set("to", dateFilter.to);
      }

      if (reportType === "orders" && subSection && subSection !== "all") {
        queryParams.set("status", subSection);
      }

      const res = await axios.get(`${url}?${queryParams.toString()}`, {
        headers,
      });

      setData(
        res.data?.data
          ? Array.isArray(res.data.data)
            ? res.data.data
            : [res.data.data]
          : [],
      );
      setLastPage(res.data?.last_page || 1);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, subSection, reportType, page, dateFilter]);

  const refundPayment = async (id) => {
    if (!window.confirm("Refund this payment?")) return;
    try {
      await axios.post(
        `${BASE_URL}/admin/payments/${id}/refund`,
        {},
        { headers },
      );
      fetchData();
    } catch {
      alert("Refund failed");
    }
  };

  const exportReport = (type, format) => {
    window.open(`${BASE_URL}/admin/reports/export/${type}/${format}`, "_blank");
  };

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    if (section === "payments") {
      return (
        item.id.toString().includes(term) ||
        item.reference?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term) ||
        item.amount?.toString().includes(term)
      );
    } else if (section === "transactions") {
      return (
        item.id.toString().includes(term) ||
        item.payment_id.toString().includes(term) ||
        item.reference?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term) ||
        item.payment?.user?.name?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="container jewelry-container">
      <style>{`
        .jewelry-container { font-family: "Georgia", serif; padding-bottom: 40px; }
        h3 { color: #7a5c1e; font-weight: bold; }
        .jewelry-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; overflow-x: auto; }
        .status-filter button { border-radius: 5px; }
        @media (max-width: 768px) {
          .table-responsive { font-size: 12px; }
          .btn { font-size: 12px; padding: 4px 8px; }
        }
      `}</style>

      {/* SECTIONS */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {["payments", "transactions", "reports"].map((s) => (
          <button
            key={s}
            className={`btn ${section === s ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setSection(s);
              setPage(1);
              setSearchTerm("");
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* SUB-FILTERS */}
      {section === "payments" && (
        <select
          className="form-control mb-3"
          value={subSection}
          onChange={(e) => {
            setSubSection(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Payments</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunds">Refunded</option>
        </select>
      )}

      {section === "reports" && (
        <>
          <div className="d-flex mb-2 gap-2 flex-wrap">
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setPage(1);
              }}
            >
              <option value="sales">Sales</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="tax">Tax</option>
            </select>

            {reportType === "sales" && (
              <>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter.from}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, from: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter.to}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, to: e.target.value })
                  }
                />
              </>
            )}

            <button
              className="btn btn-success"
              onClick={() => exportReport(reportType, "csv")}
            >
              Export CSV
            </button>
            <button
              className="btn btn-success"
              onClick={() => exportReport(reportType, "pdf")}
            >
              Export PDF
            </button>
          </div>

          {reportType === "orders" && (
            <div className="status-filter mb-3 d-flex gap-2 flex-wrap">
              {[
                "all",
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
                "returned",
              ].map((status) => (
                <button
                  key={status}
                  className={`btn btn-sm ${subSection === status ? "btn-dark" : "btn-outline-dark"}`}
                  onClick={() => {
                    setSubSection(status);
                    setPage(1);
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* SEARCH */}
      {(section === "payments" || section === "transactions") && (
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder={`Search ${section}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* DATA TABLE */}
      <div className="card jewelry-card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading..." />
          ) : (
            <>
              {section === "payments" && (
                <PaymentTable
                  data={filteredData}
                  refundPayment={refundPayment}
                />
              )}
              {section === "transactions" && (
                <TransactionTable data={filteredData} />
              )}
              {section === "reports" && (
                <ReportTable reportType={reportType} data={data} />
              )}

              {/* PAGINATION */}
              {data.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page <strong>{page}</strong> of <strong>{lastPage}</strong>
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page === lastPage}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
