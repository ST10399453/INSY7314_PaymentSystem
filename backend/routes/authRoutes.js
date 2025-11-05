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