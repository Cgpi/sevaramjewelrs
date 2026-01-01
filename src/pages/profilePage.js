import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, LogOut, Save } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const token = localStorage.getItem("auth_token")?.trim(); // ✅ trim token
  const storedUser = localStorage.getItem("auth_user");

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    axios
      .get("https://sevaramjewellers.com/api/profile", {
        headers: {
          "X-Authorization": token,
          Accept: "application/json",
        },
      })

      .then((res) => {
        const profile = res.data.user ?? res.data;
        setUser(profile);
        localStorage.setItem("auth_user", JSON.stringify(profile));
      })
      .catch((err) => {
        console.warn("Using cached profile", err);
        alert("Could not fetch profile. Please login again.");
      });
  }, [token]);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        "https://sevaramjewellers.com/api/profile",
        { name: user.name },
        {
          headers: {
            "X-Authorization": token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = res.data.user ?? res.data;
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      setEditing(false);
      alert("Name updated successfully");
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg p-4 rounded-4 w-100"
        style={{ maxWidth: 420 }}
      >
        <h4 className="text-center text-danger fw-bold mb-3">My Profile</h4>

        <div className="text-center mb-4">
          <User size={60} className="text-danger" />
        </div>

        <label className="form-label fw-bold">Name</label>
        <input
          className="form-control mb-3"
          value={user.name}
          disabled={!editing}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <label className="form-label fw-bold">Email</label>
        <input className="form-control mb-3" value={user.email} disabled />

        {!editing ? (
          <button
            className="btn btn-danger w-100 mb-2"
            onClick={() => setEditing(true)}
          >
            Edit Name
          </button>
        ) : (
          <button
            className="btn btn-success w-100 mb-2"
            onClick={updateProfile}
            disabled={loading}
          >
            <Save size={16} /> {loading ? "Saving..." : "Save Name"}
          </button>
        )}

        <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
