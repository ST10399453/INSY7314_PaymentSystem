import React, { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

// RegEx pattern
const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // Client-side whitelisting check
    if(!USERNAME_REGEX.test(value)){
      setUsernameError("Username musr be 4 to 20 alphanumeric characters.");
    }
    else{
      // clear error is input is valid
      setUsernameError("");
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    // final check before sending to API
    if(usernameError || !USERNAME_REGEX.test(username)){
      setMessage("Please correct the username before logging in.");
      return;
    }

    try {
      const res = await login(username, password);
      setMessage(res.message);
      if (res.message === "Login successful") {
        navigate("/home");
      }
    } catch (err) {
      setMessage(err.message || "Login failed");
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
            onChange={handleUsernameChange}
            required
            placeholder="Enter username"
          />
          {usernameError && <p className="error-message">{usernameError}</p>}
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
