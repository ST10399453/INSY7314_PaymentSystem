import express from "express";
import { validationResult } from "express-validator";
import { validatePayment } from "../utils/validation.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";
import requireRole from "../middleware/requireRole.js";
import { encrypt, decrypt } from "../utils/crypto.js";

const router = express.Router();

// ---------- Submit International Payment ----------
router.post("/submit", verifyToken, requireRole("customer"), validatePayment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { amount, currency, recipientAccount, swiftCode } = req.body;
    const userId = req.userId;

    // normalize the plaintext before encrypting
    const recipient = String(recipientAccount).trim();          // clean spacing etc.
    const swift = String(swiftCode).trim().toUpperCase();       // ensure consistent format


    // Encrypt sensitive string fields with AES-256-GCM
    const [encRecipientAccount, encSwiftCode] = await Promise.all([
      encrypt(recipient),
      encrypt(swift),
    ]);

    const newTransaction = new Transaction({
      userId,
      amount: Number(amount),
      currency,
      recipientAccount: encRecipientAccount,
      swiftCode: encSwiftCode,
    });

    await newTransaction.save();

    return res.status(201).json({
      message: "Transaction stored successfully. Pending employee verification.",
      transactionId: newTransaction._id,
    });
  } catch (err) {
    console.error("Payment submission error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- Get All Transaction Details for Logged-in Customer ----------
router.get("/transactions", verifyToken, requireRole("customer"), async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all transactions by the logged-in customer
    const transactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1 })
      .lean();

    // Decrypt sensitive data for each transaction
    const results = transactions.map((tx) => {
      let recipientAccountPlain, swiftCodePlain;
      try {
        recipientAccountPlain = decrypt(tx.recipientAccount);
        swiftCodePlain = decrypt(tx.swiftCode);
      } catch {
        recipientAccountPlain = "Decryption error";
        swiftCodePlain = "Decryption error";
      }

      return {
        id: tx._id,
        transactionDate: tx.transactionDate,
        amount: tx.amount,
        currency: tx.currency,
        recipientAccount: recipientAccountPlain,
        swiftCode: swiftCodePlain,
        status: tx.status,
      };
    });

    return res.status(200).json({
      message: "Full transaction details retrieved successfully.",
      transactions: results,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
