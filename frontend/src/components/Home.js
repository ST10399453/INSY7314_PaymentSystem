"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import "../Home.css"

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token) // true if token exists, false if not
  }, [])

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Send Money Globally with <span className="highlight">Confidence</span>
          </h1>
          <p className="hero-subtitle">
            Fast, secure international payments to over 180 countries.
          </p>

          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/payment" className="btn btn-primary">
                Make a Payment
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Bank-level encryption protects every transaction</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Send money in minutes, not days</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global</h3>
            <p>Transfer to 180+ countries worldwide</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
