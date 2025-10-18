import axios from "axios";

// Use http for local dev unless you have a localhost certificate set up
const ADMIN_API_URL = "https://localhost:5000/api/admin";

const authHeaders = (token) => {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

/**
 * List transactions for the employee portal (optional status filter).
 * status can be: "Pending", "Verified", "Submitted to SWIFT"
 */
export const fetchTransactions = async (token, status) => {
  try {
    const response = await axios.get(`${ADMIN_API_URL}/transactions`, {
      headers: authHeaders(token),
      params: status ? { status } : {},
    });
    return response.data; // { message, transactions }
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch transactions" };
  }
};

/**
 * Mark a transaction as Verified.
 * Only allowed for users with role=employee.
 */
export const verifyTransaction = async (transactionId, token) => {
  try {
    const response = await axios.patch(
      `${ADMIN_API_URL}/transactions/${encodeURIComponent(transactionId)}/verify`,
      {},
      { headers: authHeaders(token) }
    );
    return response.data; // { message, id }
  } catch (error) {
    throw error.response?.data || { message: "Failed to verify transaction" };
  }
};

/**
 * Submit a Verified transaction to SWIFT (state -> "Submitted to SWIFT").
 * Only allowed for users with role=employee.
 */
export const submitToSwift = async (transactionId, token) => {
  try {
    const response = await axios.post(
      `${ADMIN_API_URL}/transactions/${encodeURIComponent(transactionId)}/submit`,
      {},
      { headers: authHeaders(token) }
    );
    return response.data; // { message, id }
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit to SWIFT" };
  }
};


/*
REFERENCES

Axios. 2023. “Getting Started | Axios Docs”. 
<https://axios-http.com/docs/intro> [accessed 29 September 2025].

Balaji, Dev. 2023. “JWT Authentication in Node.js: A Practical Guide”. 
September 7, 2023 <https://dvmhn07.medium.com/jwt-authentication-in-node-js-a-practical-guide-c8ab1b432a49> 
[accessed 9 October 2025].

BetterStack. 2022. “A Complete Guide to Timeouts in Node.js | Better Stack Community”.
<https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/> [accessed 1 October 2025].

Codino. 2022. “Secure Your Node.js App with HPP.js: A Step-By-Step Guide”. 
December 31, 2022 <https://codino.medium.com/secure-your-node-js-a-step-by-step-guide-6926a9464f62> 
[accessed 4 October 2025].

Das, Arunangshu. 2025. “7 Best Practices for Sanitizing Input in Node.js”.
May 26, 2025 <https://medium.com/devmap/7-best-practices-for-sanitizing-input-in-node-js-e61638440096> 
[accessed 6 October 2025].

express-validator. 2019. “Getting Started · Express-Validator”.
<https://express-validator.github.io/docs/> [accessed 9 October 2025].

GeeksforGeeks. 2022a. “Use of CORS in Node.js”.
<https://www.geeksforgeeks.org/node-js/use-of-cors-in-node-js/> [accessed 9 October 2025].

GeeksforGeeks. 2022b. “What Is Expressratelimit in Node.js ?”
<https://www.geeksforgeeks.org/node-js/what-is-express-rate-limit-in-node-js/> [accessed 3 October 2025].

GeeksforGeeks. 2024. “NPM Dotenv”.
<https://www.geeksforgeeks.org/node-js/npm-dotenv/>
[accessed 9 October 2025].

Manico, Jim and August Detlefsen. 2015. Iron-Clad Java: Building Secure Web Applications. 
New York: McGraw-Hill Education.

MDN. 2024. “Express Tutorial Part 3: Using a Database (with Mongoose) - Learn Web Development | MDN”. 
<https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/mongoose> 
[accessed 6 September 2025].

NextJS. 2025. “Documentation | NestJS - a Progressive Node.js Framework”. 
<https://docs.nestjs.com/security/helmet>
[accessed 1 October 2025].

Node.js. 2025. “HTTPS | Node.js V20.0.0 Documentation”.
<https://nodejs.org/api/https.html> [accessed 9 October 2025].

Patel, Ravi. 2024. “A Beginner’s Guide to the Node.js”.
<https://medium.com/@ravipatel.it/a-beginners-guide-to-the-node-js-469f7458bbb2> [accessed 9 October 2025].

React Native. 2025. “React Fundamentals · React Native”.
<https://reactnative.dev/docs/intro-react> [accessed 7 September 2025].

Samson Omojola. 2024. “Password Hashing in Node.js with Bcrypt”.  
January 30, 2024 <https://www.honeybadger.io/blog/node-password-hashing/> [accessed 30 September 2025].

Valsorda, Filippo. 2022. “Mkcert”.
<https://github.com/FiloSottile/mkcert> [accessed 8 October 2025].
*/
