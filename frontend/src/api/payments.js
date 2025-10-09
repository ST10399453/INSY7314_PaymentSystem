import axios from "axios";

// Use http for local dev unless you have a localhost certificate set up
const PAYMENT_API_URL = "https://localhost:5000/api/payments";

// SEND international payment
export const sendPayment = async (paymentData, token) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await axios.post(`${PAYMENT_API_URL}/submit`, paymentData, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Payment submission failed" };
  }
};
