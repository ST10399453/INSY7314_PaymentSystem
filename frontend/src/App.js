import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import PaymentForm from "./components/PaymentForm";
import Logout from "./components/Logout";
import Navbar from "./components/Navbar";
import ViewPayments from "./components/ViewPayments";
import "./App.css";

const isAuthed = () => Boolean(localStorage.getItem("token"));
const getRole = () => localStorage.getItem("role") || "";

// route guards
function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}
function RequireRole({ role, children }) {
  return getRole() === role ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        {/* Customer */}
        <Route
          path="/payment"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <PaymentForm />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <ViewPayments />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Employee (admin) */}
        <Route
          path="/admin/payments"
          element={
            <RequireAuth>
              <RequireRole role="employee">
                <ViewPayments />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Legacy path -> send to correct place */}
        <Route
          path="/ViewPayments"
          element={
            isAuthed()
              ? (getRole() === "employee"
                  ? <Navigate to="/admin/payments" replace />
                  : <Navigate to="/transactions" replace />)
              : <Navigate to="/login" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
