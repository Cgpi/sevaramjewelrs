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

export default function AdminFinance() {
  const token = localStorage.getItem("admin_token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  /* ================= STATES ================= */
  const [section, setSection] = useState("payments"); // payments, transactions, reports
  const [subSection, setSubSection] = useState("all"); // for payments & reports
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [reportType, setReportType] = useState("sales");

  /* ================= FETCH DATA ================= */
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
            if (dateFilter.from && dateFilter.to)
              url += `?from=${dateFilter.from}&to=${dateFilter.to}`;
            break;
          case "orders":
            url = `${BASE_URL}/admin/reports/orders`;
            if (subSection && subSection !== "all")
              url += `?status=${subSection}`;
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

      const res = await axios.get(`${url}?page=${page}`, { headers });
      setData(res.data?.data || []);
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
  }, [section, subSection, reportType, page, dateFilter]);

  /* ================= REFUND ================= */
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

  /* ================= EXPORT ================= */
  const exportReport = (type, format) => {
    window.open(`${BASE_URL}/admin/reports/export/${type}/${format}`, "_blank");
  };

  /* ================= UI ================= */
  return (
    <div className="container jewelry-container">
      <style>{`
        .jewelry-container {
          font-family: "Georgia", serif;
          padding-bottom: 40px;
        }
        h3 {
          color: #7a5c1e;
          font-weight: bold;
        }
        .jewelry-card {
          background: #fffaf2;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
      `}</style>

      {/* ================= SECTIONS ================= */}
      <div className="mb-3">
        <button
          className="btn btn-primary me-2"
          onClick={() => {
            setSection("payments");
            setPage(1);
          }}
        >
          Payments
        </button>
        <button
          className="btn btn-primary me-2"
          onClick={() => {
            setSection("transactions");
            setPage(1);
          }}
        >
          Transactions
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSection("reports");
            setPage(1);
          }}
        >
          Reports
        </button>
      </div>

      {/* ================= SUB-FILTERS ================= */}
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
        <div className="d-flex mb-3 gap-2 flex-wrap">
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

          {/* Orders filter */}
          {reportType === "orders" && (
            <select
              className="form-control"
              value={subSection}
              onChange={(e) => setSubSection(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
            </select>
          )}

          {/* Sales date filter */}
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
      )}

      {/* ================= DATA TABLE ================= */}
      <div className="card jewelry-card">
        <div className="card-body">
          {loading ? (
            <Loader text="Loading..." />
          ) : (
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  {section === "payments" && (
                    <>
                      <th>ID</th>
                      <th>Order ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Action</th>
                    </>
                  )}
                  {section === "transactions" && (
                    <>
                      <th>ID</th>
                      <th>Payment ID</th>
                      <th>Type</th>
                      <th>Status</th>
                    </>
                  )}
                  {section === "reports" && (
                    <>
                      <th>#</th>
                      <th>Data</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.length ? (
                  data.map((item, i) => (
                    <tr key={item.id || i}>
                      {section === "payments" && (
                        <>
                          <td>{item.id}</td>
                          <td>{item.order_id || "-"}</td>
                          <td>₹{item.amount}</td>
                          <td>{item.status}</td>
                          <td>{item.payment_method || "-"}</td>
                          <td>
                            {item.status === "success" && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => refundPayment(item.id)}
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </>
                      )}
                      {section === "transactions" && (
                        <>
                          <td>{item.id}</td>
                          <td>{item.payment_id || "-"}</td>
                          <td>{item.type || "-"}</td>
                          <td>{item.status || "-"}</td>
                        </>
                      )}
                      {section === "reports" && (
                        <>
                          <td>{i + 1}</td>
                          <td>{JSON.stringify(item)}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        section === "payments"
                          ? 6
                          : section === "transactions"
                            ? 4
                            : 2
                      }
                      className="text-center text-muted"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          {data.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
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
        </div>
      </div>
    </div>
  );
}
