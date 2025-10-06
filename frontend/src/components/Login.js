import React, { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      setMessage(res.message);
      if (res.message === "Login successful") {
        navigate("/home");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>

        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>

      {message && <p>{message}</p>}
      <p>
        Don’t have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  );
}

export default Login;
