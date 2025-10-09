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
          <div className="hero-badge">Trusted by 10,000+ users worldwide</div>
          <h1 className="hero-title">
            Send Money Globally with <span className="highlight">Confidence</span>
          </h1>
          <p className="hero-subtitle">
            Fast, secure international payments to over 180 countries. Experience seamless transfers with competitive
            rates and real-time tracking.
          </p>

          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/payment" className="btn btn-primary">
                Make a Payment →
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>Bank-level security</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>No hidden fees</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">✓</span>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">180+</div>
            <div className="stat-label">Countries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">$2B+</div>
            <div className="stat-label">Transferred</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Happy Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Everything you need for international money transfers</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-Level Security</h3>
            <p>Your money is protected with 256-bit encryption and multi-factor authentication</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Send money in minutes with instant notifications and real-time tracking</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Reach</h3>
            <p>Transfer to 180+ countries with competitive exchange rates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Low Fees</h3>
            <p>Transparent pricing with no hidden charges or surprise costs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy to Use</h3>
            <p>Simple interface designed for everyone, from anywhere</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>24/7 Support</h3>
            <p>Our team is always here to help you with any questions</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Send Money?</h2>
          <p className="cta-subtitle">Join thousands of users who trust us with their international transfers</p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/payment" className="btn btn-primary btn-large">
                Start Transfer Now
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary btn-large">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
