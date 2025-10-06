import React, { useState } from "react";
import { signup } from "../api/auth";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(username, password);
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      <form onSubmit={handleRegister}>
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
          Create Account
        </button>
      </form>

      {message && <p>{message}</p>}
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;
