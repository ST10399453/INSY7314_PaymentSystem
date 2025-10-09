import express from "express";
import {validationResult} from 'express-validator';
import { validatePayment } from "../utils/validation.js";
import Transaction from "../models/Transaction.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Middleware to check if the user is authenticated
// const isAuthenticated = (req, res, next) => {
//     if (req.userId){
//         next();
//     }
//     else{
//         return res.status(401).json({message: 'Authentication required to make payment.'});
//     }
// };

// API function: handle new international payment transaction
router.post("/submit", verifyToken, validatePayment, async(req, res) =>{
    // Check for validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        // Reject requests if whitelisting fails
        return res.status(400).json({errors: errors.array()});
    }

    try{
        // Destructure whitelisted data from the request body
        const {amount, currency, recipientAccount, swiftCode} = req.body;

       // const userId = req.userId || '60c72b2f9f1b4c001f34d19d';
        const userId = req.userId;

        // Create and save the new transaction to the secured database
        const newTransaction = new Transaction({
            userId,
            amount,
            currency,
            recipientAccount,
            swiftCode
        });

        await newTransaction.save();

        // Respond with success
        res.status(201).json({
            message: "Transaction stored successfully. Pending employee verification.",
            transaction: newTransaction
        });
    }
    catch (err){
        // 500 status for server/database errorss
        res.status(500).json({error: err.message});
    }
});

export default router;