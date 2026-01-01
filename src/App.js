import React from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import UserRegistration from "./pages/userRegistration";
import ProfilePage from "./pages/profilePage";
import HeaderNavbar from "./header/HeaderNavbar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HeaderNavbar />} />
      <Route path="/userregistration" element={<UserRegistration />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
