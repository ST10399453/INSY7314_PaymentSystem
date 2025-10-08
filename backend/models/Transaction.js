import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    // Link to the user who made the payment
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Payment details from PaymentForm
    amount:{
        type: Number,
        required: true,
    },
    currency:{
        type: String,
        required: true,
        uppercase: true,
        trim: true 
    },
    recipientAccount:{
        type: String,
        required: true,
    },
    swiftCode:{
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    // Status for employee portal processing
    status:{
        type: String,
        enum: ['Pending', 'Verified', 'Submitted to SWIFT'],
        default: 'Pending'
    },
    transactionDate:{
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;