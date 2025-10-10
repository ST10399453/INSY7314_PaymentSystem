import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { validateRegistration, validateLogin } from "../utils/validation.js";

const router = express.Router();
const saltRounds = 12;

// ---------- Sign Up ----------
router.post("/signup", validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Username must be unique
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Account already in use" });
    }

    // Compare against existing hashed idNumber/accountNumber using bcrypt
    const allUsers = await User.find({}, { idNumber: 1, accountNumber: 1 }).lean();

    for (const u of allUsers) {
      if (u.idNumber) {
        const idMatch = await bcrypt.compare(idNumber, u.idNumber);
        if (idMatch) {
          return res.status(400).json({ message: "Account already in use" });
        }
      }
      if (u.accountNumber) {
        const accMatch = await bcrypt.compare(accountNumber, u.accountNumber);
        if (accMatch) {
          return res.status(400).json({ message: "Account already in use" });
        }
      }
    }

    // Hash sensitive values
    const [hashedPassword, hashedIdNumber, hashedAccountNumber] = await Promise.all([
      bcrypt.hash(password, saltRounds),
      bcrypt.hash(idNumber, saltRounds),
      bcrypt.hash(accountNumber, saltRounds),
    ]);

    // Save user
    const newUser = new User({
      username,
      fullName,
      password: hashedPassword,
      idNumber: hashedIdNumber,
      accountNumber: hashedAccountNumber,
    });

    await newUser.save();

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- Login  ----------
router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, accountNumber, password } = req.body;
    if (!username || !password || !accountNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      // Generic message
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatchAccount = await bcrypt.compare(accountNumber, user.accountNumber);
    if (!isMatchAccount) {
      // generic message for wrong password
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      // generic message for wrong password
      return res.status(401).json({ message: "Invalid username or password" });
    }

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
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
