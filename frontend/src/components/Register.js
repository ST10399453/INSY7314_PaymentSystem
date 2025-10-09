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
    <div className="form-container">
      <h2>Signup</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>
            Full Name:
            <span className="tooltip" data-tooltip="Enter your legal full name as it appears on your ID">
              ⓘ
            </span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullname(e.target.value)}
            className={fieldErrors.fullName ? "error" : ""}
            placeholder="e.g., John Smith"
            required
          />
          <ErrorMessage errors={fieldErrors.fullName} />
        </div>

        <div className="form-group">
          <label>
            Username:
            <span
              className="tooltip"
              data-tooltip="Choose a unique username (4-20 characters, letters and numbers only)"
            >
              ⓘ
            </span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={fieldErrors.username ? "error" : ""}
            placeholder="e.g., john123"
            required
          />
          <ErrorMessage errors={fieldErrors.username} />
        </div>

        <div className="form-group">
          <label>
            ID Number:
            <span className="tooltip" data-tooltip="Your 13-digit national ID number">
              ⓘ
            </span>
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className={fieldErrors.idNumber ? "error" : ""}
            placeholder="e.g., 1234567890123"
            maxLength="13"
            required
          />
          <ErrorMessage errors={fieldErrors.idNumber} />
        </div>

        <div className="form-group">
          <label>
            Account Number:
            <span className="tooltip" data-tooltip="Your bank account number (10-16 digits)">
              ⓘ
            </span>
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className={fieldErrors.accountNumber ? "error" : ""}
            placeholder="e.g., 1234567890"
            maxLength="16"
            required
          />
          <ErrorMessage errors={fieldErrors.accountNumber} />
        </div>

        <div className="form-group">
          <label>
            Password:
            <span className="tooltip" data-tooltip="Minimum 8 characters with uppercase, lowercase, and numbers">
              ⓘ
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldErrors.password ? "error" : ""}
            placeholder="Enter a strong password"
            required
          />
          <ErrorMessage errors={fieldErrors.password} />
        </div>

        <button type="submit" className="submit-btn">
          Create Account
        </button>
      </form>

      <ErrorMessage errors={fieldErrors.general} />
      <SuccessMessage message={successMessage} />

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}

export default Register
