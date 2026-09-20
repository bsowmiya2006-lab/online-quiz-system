import React, { useState } from "react";
import axios from "axios";

export default function Register({ onRegisterSuccess, navigateToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  // பாஸ்வேர்ட் விதிகளைச் சரிபார்க்கும் வசதி
  const hasLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*?&#]/.test(password);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!hasLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      alert("Please ensure your password meets all the security requirements! ❌");
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await axios.post(`${BACKEND_URL}/register`, {
        username: username,
        email: email,
        password: password,
        college_name: collegeName,
      });

      if (res.data.status === "success") {
        alert("Registration Successful! 🎉");
        onRegisterSuccess({ username: username, college_name: collegeName });
      } else {
        alert(res.data.message || "Registration failed ❌");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Server error during registration process!");
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      
      {/* கார்டுக்கு வெளியே இடது பக்கத்தில் மிதக்கும் கண்ணாடி கிளாஸ் பெட்டி */}
      {showPasswordTooltip && (
        <div className="password-tooltip-outside-left">
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#fff", fontSize: "14px" }}>Password Requirements:</p>
          <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none", fontSize: "13px", textAlign: "left" }}>
            <li style={{ color: hasLength ? "#34d399" : "#f87171", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{hasLength ? "✅" : "❌"}</span> At least 8 characters
            </li>
            <li style={{ color: hasUpperCase ? "#34d399" : "#f87171", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{hasUpperCase ? "✅" : "❌"}</span> One uppercase letter (A-Z)
            </li>
            <li style={{ color: hasLowerCase ? "#34d399" : "#f87171", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{hasLowerCase ? "✅" : "❌"}</span> One lowercase letter (a-z)
            </li>
            <li style={{ color: hasNumber ? "#34d399" : "#f87171", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{hasNumber ? "✅" : "❌"}</span> One number (0-9)
            </li>
            <li style={{ color: hasSpecialChar ? "#34d399" : "#f87171", marginBottom: "0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{hasSpecialChar ? "✅" : "❌"}</span> One special char (@$!%*?&#)
            </li>
          </ul>
        </div>
      )}

      {/* மெயின் ரிஜிஸ்டர் கார்டு */}
      <div className="quiz-box">
        <h2 style={{ color: "#c084fc", margin: "0 0 25px 0", fontSize: "24px", fontWeight: "700" }}>
          Create Account
        </h2>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="text" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="College Name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />

          <div className="password-field-container">
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordTooltip(true)}
              onBlur={() => setShowPasswordTooltip(false)} 
              required
            />
          </div>

          <button 
            type="submit" 
            className="next-btn" 
            style={{ margin: "15px 0 0 0", opacity: (!hasLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) ? 0.5 : 1, cursor: (!hasLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) ? "not-allowed" : "pointer" }}
            disabled={!hasLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar}
          >
            Register
          </button>
        </form>
        
        <p style={{ fontSize: "14px", color: "#b3c0c8", marginTop: "25px" }}>
          Already have an account?{" "}
          <span onClick={navigateToLogin} style={{ color: "#60a5fa", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>Login</span>
        </p>
      </div>
    </div>
  );
}