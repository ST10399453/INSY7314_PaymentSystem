import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// REGISTER user
export const signup = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
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

//const PAYMENT_API_URL = "http";

//export const sendPayment = async (paymentData, token) => {
  //try{
   // const response = await axios.post(`${PAYMENT_API_URL}/submit`, paymentData, {
   //   headers: {
   //     Authorization: `Bearer ${token}`,
   //   },
  //  });
 //   return response.data;
 // }
//  catch (error){
 //   throw error.response?.data || {message: "Payment submission failed"};
 // }
//}
