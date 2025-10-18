// seeds/seedEmployees.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connect from "../db/db.js";
import User from "../models/User.js";
import { encrypt } from "../utils/crypto.js";

const saltRounds = 12;

const EMPLOYEES = [
  // Add/modify as needed. accountNumber/idNumber are encrypted at rest.
  {
    username: "alice.emp28",
    fullName: "Alice Employee",
    idNumber: "8001015009087",
    accountNumber: "1000000001",
    password: "ChangeMe!Alice2025",
  },
  {
    username: "bobemp27",
    fullName: "Bob Employee",
    idNumber: "8002025009088",
    accountNumber: "1000000002",
    password: "ChangeMe!Bob2025",
  },
];

async function run() {
  await connect();

  for (const e of EMPLOYEES) {
    const exists = await User.findOne({ username: e.username });
    if (exists) {
      console.log(`Skipping existing employee: ${e.username}`);
      continue;
    }

    const [hashedPassword, encId, encAcc] = await Promise.all([
      bcrypt.hash(e.password, saltRounds),
      encrypt(e.idNumber),
      encrypt(e.accountNumber),
    ]);

    await User.create({
      username: e.username,
      fullName: e.fullName,
      role: "employee",
      password: hashedPassword,
      idNumber: encId,
      accountNumber: encAcc,
    });

    console.log(`Seeded employee: ${e.username}`);
  }

  await mongoose.connection.close();
  console.log("Done seeding employees.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
