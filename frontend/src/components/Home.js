import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // optional helper: JWT expiry check
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      if (!payload.exp) return false;
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp <= nowSec;
    } catch {
      return true; // invalid token or not JWT
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    // if not logged in
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // if JWT expired
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to the International Payment Portal</h1>
        <p>Secure and seamless international transactions.</p>

        <div className="home-buttons">
          <Link to="/payment">
            <button className="btn login-btn">Make Payment</button>
          </Link>
          <Link to="/logout">
            <button className="btn signup-btn">Logout</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
