import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {validationResult} from 'express-validator';
import {validateRegistration} from '../utils/validation.js';
import {validateLogin} from '../utils/validation.js';

const router = express.Router();

// Signup with server-side RegEx whitelisting
router.post("/signup", validateRegistration, async (req, res) => {
  
  // whitelisting check
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    // reject request if whitelisting fails
    return res.status(400).json({errors: errors.array()});
  }

  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;
    // check for existing user by username
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create new user with all required fields
    const newUser = new User({ fullName, idNumber, accountNumber, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", validateLogin, async (req, res) => {

  // whitelisting check
  const errors = validateResult(req);
  if(!errors.isEmpty()){
    // reject request if whitelisting fails
    return res.status(404).json({errors: errors.array()});
  }

  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
