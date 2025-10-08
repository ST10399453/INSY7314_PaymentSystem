import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // remove anything auth-related you stored
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // optionally clear other app state keys too

    navigate("/login", { replace: true });
  }, [navigate]);

  return null; // nothing to render
}
