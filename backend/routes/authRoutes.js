import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { validateRegistration, validateLogin } from "../utils/validation.js";
import { encrypt, decrypt, safeEqual } from "../utils/crypto.js";

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

    // Ensure idNumber/accountNumber aren't already used (decrypt-and-compare)
    const allUsers = await User.find({}, { idNumber: 1, accountNumber: 1 }).lean();
    for (const u of allUsers) {
      try {
        if (u.idNumber && safeEqual(decrypt(u.idNumber), idNumber)) {
          return res.status(400).json({ message: "Account already in use" });
        }
        if (u.accountNumber && safeEqual(decrypt(u.accountNumber), accountNumber)) {
          return res.status(400).json({ message: "Account already in use" });
        }
      } catch {
        // skip records that can't decrypt (legacy/invalid)
      }
    }

    // Hash password; encrypt idNumber/accountNumber
    const [hashedPassword, encIdNumber, encAccountNumber] = await Promise.all([
      bcrypt.hash(password, saltRounds),
      encrypt(idNumber),
      encrypt(accountNumber),
    ]);

    // Save user
    const newUser = new User({
      username,
      fullName,
      role: 'customer',
      password: hashedPassword,
      idNumber: encIdNumber,
      accountNumber: encAccountNumber,
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare account number by decrypting stored value
    let storedAccountPlain;
    try {
      storedAccountPlain = decrypt(user.accountNumber);
    } catch {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!safeEqual(accountNumber, storedAccountPlain)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Password still uses bcrypt hash + compare
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, fullName: user.fullName, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
