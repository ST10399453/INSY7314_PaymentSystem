// src/components/Navbar.js
"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
      setRole(localStorage.getItem("role") || "");
    };

    // Initial read
    checkAuth();

    // Re-sync across tabs and on same-tab updates
    const events = ["storage", "authChange", "visibilitychange", "focus"];
    events.forEach((ev) => window.addEventListener(ev, checkAuth));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, checkAuth));
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // notify listeners in this tab + other tabs
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

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
              <Link to="/signup">Register</Link>
            </li>
          </>
        )}

        {isAuthenticated && role === "customer" && (
          <>
            <li>
              <Link to="/payment">Payment</Link>
            </li>
            <li>
              <Link to="/transactions">My Transactions</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="link-button">
                Logout
              </button>
            </li>
          </>
        )}

        {isAuthenticated && role === "employee" && (
          <>
            <li>
              <Link to="/admin/payments">View Payments</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="link-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
