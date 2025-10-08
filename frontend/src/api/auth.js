import axios from "axios";

const API_URL = "https://localhost:5000/api/auth";

// REGISTER user
export const signup = async (username, fullName, idNumber, accountNumber, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
      fullName,
      idNumber,
      accountNumber,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

// LOGIN user
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
