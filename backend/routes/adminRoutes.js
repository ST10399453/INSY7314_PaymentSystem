// routes/adminRoutes.js
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
