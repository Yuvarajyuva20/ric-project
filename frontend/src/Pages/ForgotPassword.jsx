import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/forgot-password", { email });
      setMessage(response.data.message);
      setIsError(!response.data.success);
      if (response.data.success) {
        setStep(2);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
      setIsError(true);
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { // Trim any extra spaces
      setMessage("Please enter the OTP");
      setIsError(true);
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:4000/verify-otp", { 
        email: email.trim(), // Ensure email consistency
        otp: otp.trim() // Trim OTP before sending
      });
  
      setMessage(response.data.message);
      setIsError(!response.data.success);
      if (response.data.success) {
        setStep(3);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to verify OTP");
      setIsError(true);
    }
  };
  

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage("Please enter and confirm your new password");
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/reset-password", {
        email,
        otp,
        newPassword,
      });
      
      setMessage(response.data.message);
      setIsError(!response.data.success);
      
      if (response.data.success) {
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
      setIsError(true);
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
      <h1>Forgot Password</h1>
      
      {message && (
        <div className={`message ${isError ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div className="lform-group">
            <label htmlFor="email">Registered Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div className="lform-group">
            <label htmlFor="otp">Enter OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <small>Check your email for the 6-digit OTP</small>
          </div>
          <button type="submit" className="login-btn">Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <div className="lform-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="lform-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">Reset Password</button>
        </form>
      )}

      <div className="login-link">
        <p>Remember your password? <a href="/">Login here</a></p>
      </div>
    </main>
  );
};

export default ForgotPassword;