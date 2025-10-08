// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { validateRegistration, validateLogin } from "../utils/validation.js";

const router = express.Router();
const saltRounds = 12;

// ---------- Sign Up (Mongoose) ----------
router.post("/signup", validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // username duplicate
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash for duplicate checks + storage
    const [idNumberHash, accountNumberHash] = await Promise.all([
      bcrypt.hash(idNumber, saltRounds),
      bcrypt.hash(accountNumber, saltRounds),
    ]);

    // duplicates by hash
    if (await User.findOne({ idNumberHash })) {
      return res.status(400).json({ message: "ID number already in use" });
    }
    if (await User.findOne({ accountNumberHash })) {
      return res.status(400).json({ message: "Account number already in use" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      fullName,
      idNumberHash,
      accountNumberHash,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ---------- Login: returns JWT ----------
router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, fullName: user.fullName },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
