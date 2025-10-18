"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyTransactions } from "../api/payments";
import { fetchTransactions, verifyTransaction, submitToSwift } from "../api/admin";
import "../ViewPayments.css"

export default function ViewPayments() {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // employee-only filter
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Keep auth in local state, hydrated from localStorage
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("token") || "",
    role: localStorage.getItem("role") || "customer",
  }));

  const isEmployee = auth.role === "employee";

  // Keep auth in sync across tabs & same-tab events
  useEffect(() => {
    const sync = () => {
      setAuth({
        token: localStorage.getItem("token") || "",
        role: localStorage.getItem("role") || "customer",
      });
    };
    window.addEventListener("storage", sync);
    window.addEventListener("authChange", sync);
    window.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("authChange", sync);
      window.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!auth.token) {
        setTransactions([]);
        setError("Not authenticated.");
        return;
      }

      let data;
      if (isEmployee) {
        const res = await fetchTransactions(auth.token, statusFilter);
        data = res?.transactions || [];
      } else {
        const res = await fetchMyTransactions(auth.token);
        data = res?.transactions || [];
      }
      setTransactions(data);
    } catch (err) {
      console.error(err);
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to fetch transactions";

      setError(msg);

      // Optional: redirect to login if the token is invalid/expired
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Clear and bounce to login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [auth.token, isEmployee, statusFilter, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const onVerify = async (id) => {
    try {
      setBusyId(id);
      await verifyTransaction(id, auth.token);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id || t._id === id ? { ...t, status: "Verified" } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to verify transaction"
      );
    } finally {
      setBusyId(null);
    }
  };

  const onSubmitToSwift = async (id) => {
    try {
      setBusyId(id);
      await submitToSwift(id, auth.token);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id || t._id === id
            ? { ...t, status: "Submitted to SWIFT" }
            : t
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to submit to SWIFT"
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="form-container transactions-container">
      <div
        className="header-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <h2>{isEmployee ? "All Transactions (Employee)" : "My Transactions"}</h2>
        {isEmployee && (
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {(!transactions || transactions.length === 0) ? (
        <p>No transactions found.</p>
      ) : isEmployee ? (
        <AdminTable
          rows={transactions}
          onVerify={onVerify}
          onSubmit={onSubmitToSwift}
          busyId={busyId}
        />
      ) : (
        <CustomerTable rows={transactions} />
      )}
    </div>
  );
}

/** Customer view table — shows full details */
function CustomerTable({ rows }) {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Date</th>
          <th style={{ textAlign: "right" }}>Amount</th>
          <th>Currency</th>
          <th>Recipient Account</th>
          <th>SWIFT Code</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((tx) => (
          <tr key={tx.id || tx._id}>
            <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
            <td style={{ textAlign: "right" }}>{Number(tx.amount).toFixed(2)}</td>
            <td>{tx.currency}</td>
            <td>{tx.recipientAccount ?? "-"}</td>
            <td>{tx.swiftCode ?? "-"}</td>
            <td>{tx.status || "Pending"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Employee view table with decrypted/masked fields + actions */
function AdminTable({ rows, onVerify, onSubmit, busyId }) {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Date</th>
          <th style={{ textAlign: "right" }}>Amount</th>
          <th>Currency</th>
          <th>Customer</th>
          <th>Recipient Account</th>
          <th>SWIFT</th>
          <th>Status</th>
          <th style={{ textAlign: "center" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((tx) => {
          const id = tx.id || tx._id;
          const canVerify = tx.status === "Pending";
          const canSubmit = tx.status === "Verified";
          return (
            <tr key={id}>
              <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
              <td style={{ textAlign: "right" }}>{Number(tx.amount).toFixed(2)}</td>
              <td>{tx.currency}</td>
              <td>
                {tx.customer ? `${tx.customer.name} (${tx.customer.username})` : "-"}
              </td>
              <td>{tx.recipientAccount ?? "-"}</td>
              <td>{tx.swiftCode ?? "-"}</td>
              <td>{tx.status}</td>
              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    disabled={!canVerify || busyId === id}
                    onClick={() => onVerify(id)}
                  >
                    {busyId === id && canVerify ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    disabled={!canSubmit || busyId === id}
                    onClick={() => onSubmit(id)}
                  >
                    {busyId === id && canSubmit ? "Submitting..." : "Submit to SWIFT"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Small status filter (employee only) */
function StatusFilter({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="status">Status:</label>
      <select id="status" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Verified">Verified</option>
        <option value="Submitted to SWIFT">Submitted to SWIFT</option>
      </select>
    </div>
  );
}
