import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "https://sevaramjewellers.com/api/admin";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | forgot | reset
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    otp: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= TIMER LOGIC ================= */
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.admin));

      navigate("/admin/dashboard");
    } catch {
      setMessage("❌ Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${BASE_URL}/forgot-password`, {
        email: form.email,
      });

      setMessage("✅ OTP sent to your email");
      setMode("reset");

      setTimer(75);
      setCanResend(false);
    } catch {
      setMessage("❌ Email not found");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleReset = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${BASE_URL}/reset-password`, {
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        otp: form.otp,
      });

      setMessage("✅ Password reset successful. Please login.");
      setMode("login");
    } catch {
      setMessage("❌ Invalid OTP or error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-dark vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg p-4 rounded-4" style={{ width: 380 }}>
        <h4 className="text-center mb-3 fw-bold text-primary">
          {mode === "login" && "Admin Login"}
          {mode === "forgot" && "Forgot Password"}
          {mode === "reset" && "Reset Password"}
        </h4>

        {message && (
          <div className="alert alert-info py-2 text-center">{message}</div>
        )}

        {/* ================= LOGIN ================= */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Admin Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              className="form-control mb-3"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setMode("forgot")}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT ================= */}
        {mode === "forgot" && (
          <form onSubmit={handleForgot}>
            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Registered Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <button className="btn btn-warning w-100" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setMode("login")}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ================= RESET ================= */}
        {mode === "reset" && (
          <form onSubmit={handleReset}>
            <input
              type="text"
              name="otp"
              className="form-control mb-2"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              className="form-control mb-2"
              placeholder="New Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password_confirmation"
              className="form-control mb-2"
              placeholder="Confirm Password"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />

            <div className="text-center mb-2 text-muted">
              {timer > 0 ? (
                <>
                  Resend OTP in <b>{timer}</b> seconds
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-link p-0"
                  disabled={!canResend}
                  onClick={handleForgot}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
