import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  KeyRound,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserRegistration() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 OTP Timer
  const [timer, setTimer] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
    otp: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const apiMap = {
    login: "https://sevaramjewellers.com/sevaramjwellers/api/login",
    register: "https://sevaramjewellers.com/sevaramjwellers/api/register",
    forgot: "https://sevaramjewellers.com/sevaramjwellers/api/forgot-password",
    reset: "https://sevaramjewellers.com/sevaramjwellers/api/reset-password",
  };

  // 🔹 OTP Countdown Effect
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const getPayload = () => {
    switch (mode) {
      case "login":
        return { email: form.email, password: form.password };
      case "register":
        return {
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        };
      case "forgot":
        return { email: form.email };
      case "reset":
        return {
          email: form.email,
          otp: form.otp,
          password: form.password,
          password_confirmation: form.password_confirmation,
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(apiMap[mode], getPayload(), {
        headers: { Accept: "application/json" },
      });

      const data = res.data;

      if (mode === "login" && data.token) {
        localStorage.setItem("auth_token", data.token.trim());
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        alert("Login successful");
        window.location.href = "/";
        return;
      }

      alert(data.message || "Success");

      // 🔹 Start OTP timer after sending OTP
      if (mode === "forgot") {
        setTimer(75);
        setMode("reset");
      }

      if (mode === "reset") {
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg,#fff,#f6f2f2)" }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ maxWidth: 420, width: "100%" }}
      >
        <h4 className="text-center mb-1 text-danger fw-bold">
          {mode === "login" && "Welcome Back"}
          {mode === "register" && "Create Account"}
          {mode === "forgot" && "Forgot Password"}
          {mode === "reset" && "Reset Password"}
        </h4>

        <p className="text-center text-muted mb-4" style={{ fontSize: 14 }}>
          Sevaram Jewellers
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <Input icon={<User />} name="name" placeholder="Full Name" onChange={handleChange} />
              <Input icon={<Phone />} name="phone" placeholder="Phone Number" onChange={handleChange} />
            </>
          )}

          {mode !== "reset" && (
            <Input
              icon={<Mail />}
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />
          )}

          {(mode === "login" || mode === "register" || mode === "reset") && (
            <PasswordInput
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              onChange={handleChange}
            />
          )}

          {(mode === "register" || mode === "reset") && (
            <Input
              icon={<Lock />}
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          )}

          {mode === "reset" && (
            <>
              <Input
                icon={<KeyRound />}
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
              />

              {timer > 0 && (
                <div className="text-center text-muted mb-2" style={{ fontSize: 13 }}>
                  Resend OTP in{" "}
                  <span className="text-danger fw-bold">{timer}s</span>
                </div>
              )}

              {timer === 0 && (
                <div className="text-center mb-2">
                  <span
                    className="text-danger fw-bold cursor-pointer"
                    onClick={() => setMode("forgot")}
                  >
                    Resend OTP
                  </span>
                </div>
              )}
            </>
          )}

          <button
            className="btn btn-danger w-100 mt-3 rounded-3"
            disabled={loading || (mode === "forgot" && timer > 0)}
          >
            {mode === "login" && (loading ? "Logging in..." : <><LogIn size={16} /> Login</>)}
            {mode === "register" && (loading ? "Registering..." : <><UserPlus size={16} /> Register</>)}
            {mode === "forgot" && (loading ? "Sending..." : "Send OTP")}
            {mode === "reset" && (loading ? "Resetting..." : "Reset Password")}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: 14 }}>
          {mode === "login" && (
            <>
              <span
                className="text-danger cursor-pointer"
                onClick={() => setMode("forgot")}
              >
                Forgot Password?
              </span>
              <br />
              Don’t have an account?
              <span
                className="text-danger fw-bold ms-1 cursor-pointer"
                onClick={() => setMode("register")}
              >
                Register
              </span>
            </>
          )}

          {(mode === "register" || mode === "reset" || mode === "forgot") && (
            <span
              className="text-danger fw-bold cursor-pointer"
              onClick={() => setMode("login")}
            >
              Back to Login
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const Input = ({ icon, ...props }) => (
  <div className="input-group mb-3">
    <span className="input-group-text bg-light text-danger">{icon}</span>
    <input className="form-control" required {...props} />
  </div>
);

const PasswordInput = ({ show, toggle, onChange }) => (
  <div className="input-group mb-3">
    <span className="input-group-text bg-light text-danger">
      <Lock />
    </span>
    <input
      type={show ? "text" : "password"}
      name="password"
      className="form-control"
      placeholder="Password"
      onChange={onChange}
      required
    />
    <span
      className="input-group-text bg-light text-danger cursor-pointer"
      onClick={toggle}
    >
      {show ? <EyeOff /> : <Eye />}
    </span>
  </div>
);
