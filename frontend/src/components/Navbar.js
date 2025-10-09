"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if token exists in localStorage
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      setIsAuthenticated(!!token)
    }

    // Initial check
    checkAuth()

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener("storage", checkAuth)

    // Custom event for same-tab updates
    window.addEventListener("authChange", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("authChange", checkAuth)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          ACE PAY
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {!isAuthenticated && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        )}
        {isAuthenticated && (
          <>
            <li>
              <Link to="/payment">Payment</Link>
            </li>
            <li>
              <Link to="/viewpayments">View Payments</Link>
            </li>
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
