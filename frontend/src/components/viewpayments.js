"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const PAYMENT_API_URL = "https://localhost:5000/api/payments";

export default function ViewPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${PAYMENT_API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data.transactions);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;
  if (transactions.length === 0) return <p>No transactions found.</p>;

  return (
    <div>
      <h2>My Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
              <td>{tx.amount.toFixed(2)}</td>
              <td>{tx.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
