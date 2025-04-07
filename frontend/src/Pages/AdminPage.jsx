// src/pages/AdminPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css"; // Create a CSS file for styling

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/")}
  />
      <h1>Admin Dashboard</h1>
      <div className="admin-buttons">
        <button
          className="a-btn"
          onClick={() => navigate("/membership-manager")}
        >
          Membership Manager
        </button>
        <button
          className="a-btn"
          onClick={() => navigate("/instrument-manager")}
        >
          Instrument Manager
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
