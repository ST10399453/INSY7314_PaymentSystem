import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { decrypt } from "../utils/crypto.js";

const router = express.Router();

/**
 * List transactions for employees (optionally filter by status)
 * GET /api/admin/transactions?status=Pending|Verified|Submitted%20to%20SWIFT
 */
router.get("/transactions", verifyToken, requireRole("employee"), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    // Fetch newest first; include fields staff needs to check
    const txs = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .lean();

    // Decorate with decrypted account + swift (for on-screen verification),
    // and include minimal customer info
    const userIds = [...new Set(txs.map(t => String(t.userId)))];
    const users = await User.find({ _id: { $in: userIds } })
      .select("fullName username")
      .lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const results = txs.map(t => {
      let recipientAccount = null, swiftCode = null;
      try { recipientAccount = decrypt(t.recipientAccount); } catch {}
      try { swiftCode = decrypt(t.swiftCode); } catch {}
      return {
        _id: t._id,
        transactionDate: t.transactionDate,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        customer: userMap.get(String(t.userId)) || null,
        recipientAccount,
        swiftCode,
      };
    });

    return res.status(200).json({ message: "OK", transactions: results });
  } catch (err) {
    console.error("Admin list error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Verify a transaction (employee marks as Verified)
 * PATCH /api/admin/transactions/:id/verify
 */
router.patch("/transactions/:id/verify", verifyToken, requireRole("employee"), async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (tx.status !== "Pending") {
      return res.status(400).json({ message: `Cannot verify from status '${tx.status}'` });
    }

    tx.status = "Verified";
    await tx.save();
    return res.status(200).json({ message: "Transaction verified", id: tx._id });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Submit to SWIFT (after Verified)
 * POST /api/admin/transactions/:id/submit
 */
router.post("/transactions/:id/submit", verifyToken, requireRole("employee"), async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (tx.status !== "Verified") {
      return res.status(400).json({ message: `Only 'Verified' transactions can be submitted` });
    }

    tx.status = "Submitted to SWIFT";
    await tx.save();

    // Your job ends here (no external SWIFT call implemented)
    return res.status(200).json({ message: "Submitted to SWIFT", id: tx._id });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

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
December 31, 2022 <https://codino.medium.com/secure-your-node-js-app-with-hpp-js-a-step-by-step-guide-6926a9464f62> 
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

Tony. 2023. “Guide to Node’s Crypto Module for Encryption/Decryption”.  
May 5, 2023 <https://medium.com/@tony.infisical/guide-to-nodes-crypto-module-for-encryption-decryption-65c077176980>  
[accessed 5 October 2025].

Valsorda, Filippo. 2022. “Mkcert”.
<https://github.com/FiloSottile/mkcert> [accessed 8 October 2025].
*/