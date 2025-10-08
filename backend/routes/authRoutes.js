import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import {validationResult} from 'express-validator';
import {validateRegistration} from '../utils/validation.js';
import {validateLogin} from '../utils/validation.js';

const router = express.Router();
const saltRounds = 12;

// ------------- Sign Up --------------
// router.post("/signup", validateRegistration, async (req, res) => {
//   // Whitelisting/validation check
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // reject request if whitelisting fails
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { fullName, idNumber, accountNumber, username, password } = req.body;

//     // Check for existing user by username
//     const existingByName = await User.findOneByName(username);
//     if (existingByName) {
//       return res.status(400).json({ message: "User already exists" });
//     }

// //Check if user already exists
//     const existingById = await getUsersCollection().where("idNumber", "==", idNumber).limit(1).get();
//     if (!existingById.empty) return res.status(400).json({ message: "ID number already in use" });
//     const existingByAcct = await getUsersCollection().where("accountNumber", "==", accountNumber).limit(1).get();
//     if (!existingByAcct.empty) return res.status(400).json({ message: "Account number already in use" });

//     // Hash the ID Number
//     const hashedIdNumber = await bcrypt.hash(idNumber, saltRounds);

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     //
//     const hashedAccountNumber = await bcrypt.hash(accountNumber, saltRounds);

//     // Create user in Firestore
//     const newUser = await User.create({
//       username,
//       password: hashedPassword,
//       fullName,
//       idNumber: hashedIdNumber,
//       accountNumber: hashedAccountNumber,
//     });

//     return res.status(201).json({
//       message: "User created successfully",
//       userId: newUser.id,
//     });
//   } catch (err) {
//     console.error("Signup error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });
//SIGNUP AND LOGIN USING MONGOOSE
router.post("/signup", validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Check for duplicates
    if (await User.findOne({ username })) return res.status(400).json({ message: "Username already exists" });
    if (await User.findOne({ idNumber })) return res.status(400).json({ message: "ID number already in use" });
    if (await User.findOne({ accountNumber })) return res.status(400).json({ message: "Account number already in use" });

    // Hash sensitive fields
    const hashedIdNumber = await bcrypt.hash(idNumber, saltRounds);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedAccountNumber = await bcrypt.hash(accountNumber, saltRounds);

    // Create user
    const newUser = new User({
      username,
      fullName,
      idNumber: hashedIdNumber,
      accountNumber: hashedAccountNumber,
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

// ------------- Login --------------
router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user using Mongoose
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});
export default router;
