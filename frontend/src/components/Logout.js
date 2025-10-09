"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    // Remove authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // Dispatch custom event to update Navbar
    window.dispatchEvent(new Event("authChange"))

    // Redirect to login page
    navigate("/login", { replace: true })
  }, [navigate])

  return null
}
