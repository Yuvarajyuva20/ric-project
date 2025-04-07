import React, { useState } from "react";
import "./RegisterPage.css";
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    initials: "MR",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    designation: "",
    guideApprovalLetter: null,
    department: "",
    institution: "",
  });
const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF and image files (PNG, JPG, JPEG) are allowed.");
        e.target.value = ""; // Clear the file input
        return;
      }
      setFormData({ ...formData, guideApprovalLetter: file });
    }
  };
  
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("approval", file);

    try {
      const response = await fetch("http://localhost:4000/upload/guide_approval", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        return result.pdf_url;
      } else {
        throw new Error(result.message || "File upload failed.");
      }
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError("Name is required.");
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return setError("Invalid email address.");
    if (!formData.phone.match(/^\d{10}$/))
      return setError("Phone number must be 10 digits.");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters long.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");
    if (!formData.designation.trim())
      return setError("Designation is required.");
    if (!formData.department.trim()) return setError("Department is required.");
    if (!formData.institution.trim())
      return setError("Institution/Company is required.");
    if (!formData.guideApprovalLetter)
      return setError("Guide Approval Letter is required.");

    setError("");

    const uploadedFileUrl = await uploadFile(formData.guideApprovalLetter);
    if (!uploadedFileUrl) {
      setError("Failed to upload Guide Approval Letter.");
      return;
    }

    const user = { ...formData, guideApprovalLetter: uploadedFileUrl };
    delete user.confirmPassword;

    try {
      const response = await fetch("http://localhost:4000/adduser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(
          "Registration successful! You will receive the member ID once approved."
        );
        setFormData({
          initials: "MR",
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          designation: "",
          guideApprovalLetter: null,
          department: "",
          institution: "",
        });
      } else {
        throw new Error(result.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to register. Please try again later.");
    }
  };

  return (
    <div className="register-container">
         <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/LoginPage")}
  />
    <h1 className="mml" style={{ paddingLeft: "100px" }}>Member Registration</h1>
    <form className="reg-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="initials">Initials:</label>
        <select
          id="initials"
          name="initials"
          value={formData.initials}
          onChange={handleChange}
        >
          <option value="MR">MR</option>
          <option value="MRS">MRS</option>
          <option value="DR">DR</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email ID:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="designation">Designation:</label>
        <input
          type="text"
          id="designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          required
        />
      </div>
  
{/* Conditionally render the Guide Approval Letter field */}
{formData.initials !== "DR" && (
  <div className="form-group">
    <label htmlFor="guideApprovalLetter">Guide Approval Letter:</label>
    <small className="file-info">(Only PDF or image)</small>
    <input
      type="file"
      id="guideApprovalLetter"
      name="guideApprovalLetter"
      onChange={handleFileChange}
      accept="image/png, image/jpeg, image/jpg, application/pdf"
      required
    />
  </div>
)}

      <div className="form-group">
        <label htmlFor="department">Department/Sector:</label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="institution">Institution/Company:</label>
        <input
          type="text"
          id="institution"
          name="institution"
          value={formData.institution}
          accept="image/*,.pdf" 
          onChange={handleChange}
          required
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <button type="submit" className="register-btn">
        Register
      </button>
    </form>
  </div>
  
  );
};

export default RegisterPage;
