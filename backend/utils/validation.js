const {body} = require('express-validator');

// RegEx Whitelisting patterns
// Full name: Letters, spaces, hyphens & apostrophe's only (2 - 50 chars)
const FULL_NAME_REGEX = /^[A-Za-z\s'-]{2,50}$/;

// ID number: exactly 13 digits (numeric)
const ID_NUMBER_REGEX = /^\d{13}$/;

// Account number: 6 to 12 digits (numeric)
const ACCOUNT_NUMBER_REGEX = /^\d{6,12}$/;

// Username: Alphanumeric characters only (4 - 20 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

// Password: At least 8 characters, with uppercase, lowercase, number, and symbol
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Payment amount: Numeric
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Currency code: Exactly 3 uppercase letters (ZAR)
const CURRENCY_REGEX = /^[A-Z]{3}$/;

// Recipient account number: 6 to 20 digits
const RECIPIENT_ACCOUNT_REGEX = /^\d{6,20}$/;

// SWIFT code (BIC): 8 or 11 alphanumeric characters
const SWIFT_CODE_REGEX = /^[A-Za-z0-9]{8,11}$/;


// Middleware function to validate customer registration inputs
const validateRegistration = [
    // full name whitelisting
    body('fullName').matches(FULL_NAME_REGEX).withMessage('Full Name must be 2 to 50 characters and may only contain letters, spaces, hyphens or apostrophes.'),

    // ID number whitelisting
    body('idNumber').matches(ID_NUMBER_REGEX).withMessage('ID number must be exactly 13 digits.'),

    // account number whitelisting
    body('accountNumber').matches(ACCOUNT_NUMBER_REGEX).withMessage('Account number must be 6 to 12 digits.'),

    // username whitelisting
    body('username').matches(USERNAME_REGEX).withMessage('Username must be 4 to 20 alphanumeric characters.'),

    // password whitelisting for security and hashing
    body('password').matches(PASSWORD_REGEX).withMessage('Password must be at least 8 characters, with an uppercase, lowercase, number and symbol.')
];

const validateLogin = [
    // username whitelisting for login
    body('username').matches(USERNAME_REGEX).withMessage('Invalid username format.')
]

// Middleware function to validate payment inputs
const validatePayment = [

    // amount whitelisting
    body('amount').matches(AMOUNT_REGEX).withMessage('Payment amount must be a number with up to 2 decimal places.'),

    // currency whitelisting
    body('currency').matches(CURRENCY_REGEX).withMessage('Currency must be a 3-letter code, e.g. ZAR'),

    // recipient account number whitelisting
    body('recipientAccount').matches(RECIPIENT_ACCOUNT_REGEX).withMessage('Recipient account number must be 6 to 20 digits.'),

    // SWIFT code whitelisting
    body('swiftCode').matches(SWIFT_CODE_REGEX).withMessage('SWIFT code must be 8 or 11 alphanumeric characters.')
];

module.exports = {
    validateRegistration,
    validateLogin,
    validatePayment
};