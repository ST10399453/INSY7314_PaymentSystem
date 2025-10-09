import { useState } from "react"
import { login } from "../api/auth"
import { useNavigate } from "react-router-dom"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"
import "../Login.css"

const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()

  const handleUsernameChange = (e) => {
    const value = e.target.value
    setUsername(value)

    // Clear previous errors
    setFieldErrors((prev) => ({ ...prev, username: [] }))

    // Validate username
    if (value && !USERNAME_REGEX.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        username: ["Username must be 4 to 20 alphanumeric characters."],
      }))
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    // Clear password errors when user types
    setFieldErrors((prev) => ({ ...prev, password: [] }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setGeneralError("")
    setSuccessMessage("")

    // Client-side validation
    const errors = {}
    if (!USERNAME_REGEX.test(username)) {
      errors.username = ["Username must be 4 to 20 alphanumeric characters."]
    }
    if (!password) {
      errors.password = ["Password is required."]
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      const res = await login(username, password)

      if (res.token) {
        localStorage.setItem("token", res.token)
        window.dispatchEvent(new Event("authChange"))
        setSuccessMessage(res.message || "Login successful!")

        // Navigate after a brief delay to show success message
        setTimeout(() => {
          navigate("/home")
        }, 1000)
      }
    } catch (err) {
      // Handle backend validation errors
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
        // General error message
        setGeneralError(err.message || "Login failed. Please try again.")
      }
    }
  }

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
            className={fieldErrors.username?.length > 0 ? "error" : ""}
            required
            placeholder="Enter username"
          />
          <ErrorMessage errors={fieldErrors.username} />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={fieldErrors.password?.length > 0 ? "error" : ""}
            required
            placeholder="Enter password"
          />
          <ErrorMessage errors={fieldErrors.password} />
        </div>

        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>

      {generalError && <div className="general-error">{generalError}</div>}
      <SuccessMessage message={successMessage} />

      <p>
        Don't have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  )
}

export default Login
