import express from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { validatePayment } from "../utils/validation.js";
import Transaction from "../models/Transaction.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();
const saltRounds = 12;

// ---------- Submit International Payment ----------
router.post("/submit", verifyToken, validatePayment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { amount, currency, recipientAccount, swiftCode } = req.body;
    const userId = req.userId;

    // Hash only the string fields (not amount)
    const [hashedRecipientAccount, hashedSwiftCode] = await Promise.all([
      bcrypt.hash(recipientAccount, saltRounds),
      bcrypt.hash(swiftCode, saltRounds),
    ]);

    const newTransaction = new Transaction({
      userId,
      amount: Number(amount),
      currency,
      recipientAccount: hashedRecipientAccount,
      swiftCode: hashedSwiftCode,
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


// ---------- Get All Transactions for Logged-in User ----------
router.get("/transactions", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch only date, amount, and currency; newest first
    const transactions = await Transaction.find({ userId })
      .select("transactionDate amount currency")
      .sort({transactionDate: -1 });

    return res.status(200).json({
      message: "Transactions retrieved successfully.",
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
