import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName:{
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    // ID number must be unique
    unique: true
  },
  accountNumber: {
    type: String,
    required: true,
    // account number must be unique
    unique: true
  }
});

const User = mongoose.model("User", userSchema);
export default User;