import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sevaramjewellers.com/sevaramjwellers/api";

/* ===== Loader Component ===== */
const Loader = ({ text = "Loading..." }) => (
  <div className="text-center py-4">
    <div className="spinner-border text-warning me-2" />
    <strong>{text}</strong>
  </div>
);

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("payments"); // payments, transactions, orders, sales, customers, tax
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ status: "", from: "", to: "" });

  /* ===== Fetch Data Based on Tab ===== */
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "";
      switch (activeTab) {
        case "payments":
          url = `${BASE_URL}/admin/payments`;
          if (filters.status)
            url = `${BASE_URL}/admin/payments/${filters.status}`;
          break;
        case "transactions":
          url = `${BASE_URL}/admin/transactions`;
          break;
        case "orders":
          url = `${BASE_URL}/admin/reports/orders`;
          if (filters.status)
            url = `${BASE_URL}/admin/reports/orders?status=${filters.status}`;
          break;
        case "sales":
          url = `${BASE_URL}/admin/reports/sales`;
          if (filters.from && filters.to)
            url = `${BASE_URL}/admin/reports/sales?from=${filters.from}&to=${filters.to}`;
          break;
        case "customers":
          url = `${BASE_URL}/admin/reports/customers`;
          break;
        case "tax":
          url = `${BASE_URL}/admin/reports/tax`;
          break;
        default:
          url = `${BASE_URL}/admin/reports/orders`;
      }
      const res = await axios.get(url);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  /* ===== Export Report ===== */
  const exportReport = (type, format) => {
    window.open(`${BASE_URL}/admin/reports/export/${type}/${format}`, "_blank");
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Reports</h2>

      {/* ===== Tabs ===== */}
      <div className="mb-3">
        {[
          "payments",
          "transactions",
          "orders",
          "sales",
          "customers",
          "tax",
        ].map((tab) => (
          <button
            key={tab}
            className={`btn me-2 ${activeTab === tab ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== Filters ===== */}
      <div className="mb-3">
        {(activeTab === "payments" || activeTab === "orders") && (
          <select
            className="form-select w-auto d-inline me-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
          </select>
        )}
        {activeTab === "sales" && (
          <>
            <input
              type="date"
              className="form-control w-auto d-inline me-2"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
            <input
              type="date"
              className="form-control w-auto d-inline me-2"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </>
        )}
        <button className="btn btn-primary" onClick={fetchData}>
          Apply
        </button>
        <button
          className="btn btn-success ms-2"
          onClick={() => exportReport(activeTab, "csv")}
        >
          Export CSV
        </button>
      </div>

      {/* ===== Table ===== */}
      {loading ? (
        <Loader />
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                {data[0] &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, " ").toUpperCase()}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  {Object.keys(item).map((key) => (
                    <td key={key}>
                      {typeof item[key] === "object" && item[key] !== null
                        ? JSON.stringify(item[key])
                        : item[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
