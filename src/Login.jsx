import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLoginSuccess, navigateToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await axios.post(`${BACKEND_URL}/login`, {
        username: username,
        password: password,
      });

      if (res.data.status === "success") {
        onLoginSuccess(res.data.user);
      } else {
        alert(res.data.message || "Invalid login credentials ❌");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Server connection failed! Make sure your backend server is running on port 3001.");
      }
    }
  };

  return (
    <div className="quiz-box">
      <h2 style={{ color: "#c084fc", margin: "0 0 25px 0", fontSize: "24px", fontWeight: "700", textShadow: "0 0 10px rgba(168, 85, 247, 0.2)" }}>
        Sign In to Quiz
      </h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          required
        />

        <input 
          type="password" 
          placeholder="Password" 
          value= {password}
          onChange={(e) => setPassword(e.target.value)} 
          required
        />

        <button type="submit" className="next-btn" style={{ margin: "15px 0 0 0" }}>
          Login
        </button>
      </form>
      
      <p style={{ fontSize: "14px", color: "#b3c0c8", marginTop: "25px", marginBottom: 0 }}>
        Don't have an account?{" "}
        <span onClick={navigateToRegister} style={{ color: "#60a5fa", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>
          Register here
        </span>
      </p>
    </div>
  );
}