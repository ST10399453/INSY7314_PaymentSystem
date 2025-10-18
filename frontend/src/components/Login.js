// src/components/Login.js
import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import "../Login.css";

const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

function Login() {
  const [username, setUsername] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setFieldErrors((prev) => ({ ...prev, username: [] }));
    if (value && !USERNAME_REGEX.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        username: ["Username must be 4 to 20 alphanumeric characters."],
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setFieldErrors((prev) => ({ ...prev, password: [] }));
  };

  const handleAccountNumberChange = (e) => {
    setAccountNumber(e.target.value);
    setFieldErrors((prev) => ({ ...prev, accountNumber: [] }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    // Client-side validation
    const errors = {};
    if (!USERNAME_REGEX.test(username)) {
      errors.username = ["Username must be 4 to 20 alphanumeric characters."];
    }
    if (!accountNumber) errors.accountNumber = ["Account Number is required."];
    if (!password) errors.password = ["Password is required."];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      // login() already returns response.data
      const res = await login(username, accountNumber, password);
      // Example backend response shape (from your route):
      // { message, token, user: { id, username, fullName, role } }

      const token = res?.token;
      const role = res?.user?.role;

      if (!token || !role) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      // Tell Navbar (and other tabs) to refresh auth state
      window.dispatchEvent(new Event("authChange"));

      setSuccessMessage(res.message || "Login successful!");

      // Redirect by role
      navigate(role === "employee" ? "/admin/payments" : "/payment");
    } catch (err) {
      // Backend may send { message, errors? }
      if (err?.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach((error) => {
          const field = error.path || error.param || "general";
          if (!backendErrors[field]) backendErrors[field] = [];
          backendErrors[field].push(error.msg || error.message);
        });
        setFieldErrors(backendErrors);
      } else {
        setGeneralError(err?.message || err?.error || err?.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={fieldErrors.username?.length > 0 ? "error" : ""}
                placeholder="Enter your username"
                required
              />
            </div>
            <ErrorMessage errors={fieldErrors.username} />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={accountNumber}
                onChange={handleAccountNumberChange}
                className={fieldErrors.accountNumber?.length > 0 ? "error" : ""}
                placeholder="Enter your account number"
                required
              />
            </div>
            <ErrorMessage errors={fieldErrors.accountNumber} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={fieldErrors.password?.length > 0 ? "error" : ""}
                placeholder="Enter your password"
                required
              />
            </div>
            <ErrorMessage errors={fieldErrors.password} />
          </div>

          <button type="submit" className="submit-btn">
            <span>Sign In</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        {generalError && <div className="general-error">{generalError}</div>}
        <SuccessMessage message={successMessage} />

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="signup-link">
              Sign up here
            </a>
          </p>
        </div>

        <div className="security-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Your information is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
