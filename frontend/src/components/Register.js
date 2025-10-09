"use client"

import { useState } from "react"
import { signup } from "../api/auth"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"
import "../Register.css"

function Register() {
  const [username, setUsername] = useState("")
  const [fullName, setFullname] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [password, setPassword] = useState("")

  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccessMessage("")

    try {
      const res = await signup(username, fullName, idNumber, accountNumber, password)

      if (res.token) {
        localStorage.setItem("token", res.token)
        localStorage.setItem("user", JSON.stringify(res.user))
        window.dispatchEvent(new Event("authChange"))
      }

      setSuccessMessage(res.message || "Registration successful!")

      setTimeout(() => {
        setUsername("")
        setFullname("")
        setIdNumber("")
        setAccountNumber("")
        setPassword("")
      }, 2000)
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {}
        err.errors.forEach((error) => {
          const field = error.path || error.param || "general"
          if (!backendErrors[field]) {
            backendErrors[field] = []
          }
          backendErrors[field].push(error.msg || error.message)
        })
        setFieldErrors(backendErrors)
      } else {
        setFieldErrors({ general: [err.message || "Signup failed"] })
      }
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h2>Create Your Account</h2>
          <p className="register-subtitle">Join us today and start managing your payments securely</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-text">Full Name</span>
                <span className="tooltip" data-tooltip="Enter your legal full name as it appears on your ID">
                  ⓘ
                </span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullname(e.target.value)}
                  className={fieldErrors.fullName ? "error" : ""}
                  placeholder="John Smith"
                  required
                />
              </div>
              <ErrorMessage errors={fieldErrors.fullName} />
            </div>

            <div className="form-group">
              <label>
                <span className="label-text">Username</span>
                <span
                  className="tooltip"
                  data-tooltip="Choose a unique username (4-20 characters, letters and numbers only)"
                >                  ⓘ
                </span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldErrors.username ? "error" : ""}
                  placeholder="john123"
                  required
                />
              </div>
              <ErrorMessage errors={fieldErrors.username} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-text">ID Number</span>
                <span className="tooltip" data-tooltip="Your 13-digit national ID number">
                  ⓘ
                </span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className={fieldErrors.idNumber ? "error" : ""}
                  placeholder="1234567890123"
                  maxLength="13"
                  required
                />
              </div>
              <ErrorMessage errors={fieldErrors.idNumber} />
            </div>

            <div className="form-group">
              <label>
                <span className="label-text">Account Number</span>
                <span className="tooltip" data-tooltip="Your bank account number (10-16 digits)">
                                    ⓘ
                </span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={fieldErrors.accountNumber ? "error" : ""}
                  placeholder="1234567890"
                  maxLength="16"
                  required
                />
              </div>
              <ErrorMessage errors={fieldErrors.accountNumber} />
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-text">Password</span>
              <span className="tooltip" data-tooltip="Minimum 8 characters with uppercase, lowercase, and numbers">
                  ⓘ
              </span>
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? "error" : ""}
                placeholder="Enter a strong password"
                required
              />
            </div>
            <ErrorMessage errors={fieldErrors.password} />
          </div>

          <button type="submit" className="submit-btn">
            <span>Create Account</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <ErrorMessage errors={fieldErrors.general} />
        <SuccessMessage message={successMessage} />

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <a href="/login" className="login-link">
              Sign in here
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
  )
}

export default Register
