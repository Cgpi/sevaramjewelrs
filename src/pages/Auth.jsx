import React, { useState } from "react";
import { User, Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url =
      mode === "login"
        ? "https://sevaramjewellers.com/sevaramjwellers/api/login"
        : "https://sevaramjewellers.com/sevaramjwellers/api/register";

    const payload =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation,
          };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      const data = JSON.parse(text);
      console.log(data);
      alert(data.message || "Success");
    } catch (error) {
      console.error(error);
      alert("Server returned invalid response");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="subtitle">
          {mode === "login" ? "Login to continue" : "Register to get started"}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="input-group">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {mode === "register" && (
            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-btn">
            {mode === "login" ? (
              <>
                <LogIn size={18} /> Login
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register
              </>
            )}
          </button>
        </form>

        <div className="switch">
          {mode === "login" ? (
            <>
              Don’t have an account?
              <span onClick={() => setMode("register")}> Register</span>
            </>
          ) : (
            <>
              Already have an account?
              <span onClick={() => setMode("login")}> Login</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
