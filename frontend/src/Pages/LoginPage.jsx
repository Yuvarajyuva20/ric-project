import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (memberId && password) {
      try {
        const response = await axios.post("http://localhost:4000/login", {
          memberId,
          password,
        });

        if (response.data.success) {
          // Store both memberId and token in localStorage
          localStorage.setItem("memberId", memberId);
          localStorage.setItem("token", response.data.token);

          console.log("Login successful:", response.data);
          navigate("/Memberclub"); // Redirect to Memberclub page
        } else {
          alert(response.data.message); // Show error message from backend
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials.");
      }
    } else {
      alert("Please enter both Member ID and Password");
    }
  };

  return (
    <main className="content">
            <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/")}
  />
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="lform-group">
          <label htmlFor="memberId">Member ID:</label>
          <input
            type="text"
            id="memberId"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          />
        </div>

        <div className="lform-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>   
      <div className="forgot-password-container">
          <a href="/forgot-password" className="forgot-password-link">Forgot password?</a>
        </div> 

        <button type="submit" className="login-btn">Login</button>
      </form>

      {/* Register link for new members */}
      <div className="register-link">
        <p>New member? <a href="/RegisterPage">Register here</a></p>
      </div>
    </main>
  );
};

export default LoginPage;