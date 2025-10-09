import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Home from "./components/Home"
import PaymentForm from "./components/PaymentForm"
import Logout from "./components/Logout"
import Navbar from "./components/Navbar"
import "./App.css"

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  )
}

export default App
