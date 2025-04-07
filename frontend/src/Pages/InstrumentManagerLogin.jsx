import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";

const InstrumentManagerLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUsername = process.env.REACT_APP_USERNAME;
    const storedPasswordHash = "$2a$12$6An5xDlUV"+process.env.REACT_APP_PASSWORD_HASH;

    if (username === storedUsername && bcrypt.compareSync(password, storedPasswordHash)) {
      navigate("/AddProduct"); // Replace with the actual path
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <div className="login-page">
            <img
    src={require("../Components/Assets/back.png")}
    alt="Back"
    className="back-icon"
    onClick={() => navigate("/AdminPage")}
  />
      <h1 className="mml" style={{ paddingLeft: "100px" }}>Instrument Manager Login</h1>
      <form onSubmit={handleLogin}>
        <div className="lform-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="form-input"
          />
        </div>
        <div className="lform-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default InstrumentManagerLogin;
