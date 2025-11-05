import { body } from "express-validator"

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
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

// Payment amount: Numeric
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Currency code: Exactly 3 uppercase letters (ZAR)
const CURRENCY_REGEX = /^[A-Z]{3}$/;

// Recipient account number: 6 to 20 digits
const RECIPIENT_ACCOUNT_REGEX = /^\d{6,20}$/;

// SWIFT code (BIC): 8 or 11 alphanumeric characters
const SWIFT_CODE_REGEX = /^[A-Za-z0-9]{8,11}$/;


// Middleware function to validate customer registration inputs
export const validateRegistration = [
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

export const validateLogin = [
    // username whitelisting for login
    body('username').matches(USERNAME_REGEX).withMessage('Invalid username format.')
]

// Middleware function to validate payment inputs
export const validatePayment = [

    // amount whitelisting
     body('amount')
    .exists({ checkFalsy: true }).withMessage('Payment amount is required.')
    .trim()
    // remove thousands separators if someone sneaks them in
    .customSanitizer(v => typeof v === 'string' ? v.replace(/,/g, '') : v)
    .whitelist('0123456789.') // STRICT: allow only digits and dot
    .bail()
    .matches(AMOUNT_REGEX).withMessage('Payment amount must be a number with up to 2 decimal places.')
    .bail() //Stop checking once it finds a non-whitelisted character
    .custom(v => Number(v) > 0).withMessage('Payment amount must be greater than 0.'),

    // currency whitelisting
     body('currency')
    .exists({ checkFalsy: true }).withMessage('Currency is required.')
    .trim()
    .toUpperCase()
    .whitelist('ABCDEFGHIJKLMNOPQRSTUVWXYZ') // STRICT: letters only
    .bail()
    .matches(CURRENCY_REGEX).withMessage('Currency must be ZAR.'),

    // recipient account number whitelisting
     body('recipientAccount')
    .exists({ checkFalsy: true }).withMessage('Recipient account number is required.')
    .trim()
    .whitelist('0123456789') // STRICT: digits only
    .bail()
    .matches(RECIPIENT_ACCOUNT_REGEX).withMessage('Recipient account number must be 6 to 20 digits.'),

    // SWIFT code whitelisting
    body('swiftCode')
    .exists({ checkFalsy: true }).withMessage('SWIFT code is required.')
    .trim()
    .toUpperCase()
    .whitelist('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') // STRICT: A–Z, 0–9
    .bail()
    .matches(SWIFT_CODE_REGEX).withMessage('SWIFT code must be 8 or 11 uppercase letters/numbers.')
];

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

Valsorda, Filippo. 2022. “Mkcert”.
<https://github.com/FiloSottile/mkcert> [accessed 8 October 2025].
*/

