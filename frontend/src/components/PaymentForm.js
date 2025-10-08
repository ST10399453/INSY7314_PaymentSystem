import React, {useState} from "react";

// Payment amount: Numeric
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Currency code: Exactly 3 uppercase letters (ZAR)
const CURRENCY_REGEX = /^[A-Z]{3}$/;

// Recipient account number: 6 to 20 digits
const RECIPIENT_ACCOUNT_REGEX = /^\d{6,20}$/;

// SWIFT code (BIC): 8 or 11 alphanumeric characters
const SWIFT_CODE_REGEX = /^[A-Za-z0-9]{8,11}$/;

function PaymentForm(){
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("ZAR");
    const [recipientAccount, setRecipientAccount] = useState("");
    const [swiftCode, setSwiftCode] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    // Centralised validation and state handler
    const handleChange = (e, setter, name, regex, errorMessage) =>{
        const value = e.target.value;
        setter(value);

        // Client-side whitelisting check
        if(!regex.test(value) && value.length > 0){
            // set error if input is non-empty & does not match the whitelist
            setErrors(prevErrors => ({...prevErrors, [name]: errorMessage}));
        }
        else{
            // clear error if input is valid or empty
            setErrors(prevErrors => {
                const {[name]: removed, ...rest} = prevErrors;
                return rest;
            });
        }
    };

    const validateAllInputs = () => {
        let newErrors = {};
        let isValid = true;

        const checks = [
            { name: 'amount', value: amount, regex: AMOUNT_REGEX, message: 'Amount must be a number with up to two decimals.' },
            { name: 'currency', value: currency, regex: CURRENCY_REGEX, message: 'Currency must be a 3-letter code, e.g. ZAR.' },
            { name: 'recipientAccount', value: recipientAccount, regex: RECIPIENT_ACCOUNT_REGEX, message: 'Recipient account must be 6 to 20 digits.' },
            { name: 'swiftCode', value: swiftCode, regex: SWIFT_CODE_REGEX, message: 'SWIFT code must be 8 or 11 alphanumeric characters.' },
        ];

        checks.forEach(({name, value, regex, message}) => {
            if(!regex.test(value)){
                newErrors[name] = message;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handlePayNow = async (e) => {
        e.preventDefault();
        setMessage("");

        // Run final client-side whitelisting check
        if(!validateAllInputs()){
            setMessage("Please correct all payment input errors.");
            return;
        }

        // If validation passes, proceed
        try{
            const paymentData = { amount, currency, recipientAccount, swiftCode};
            const res = await sendPayment(paymentData);
            setMessage(res.message || "Payment initiated successfully!");

            // Clear form on success
            setAmount("");
            setCurrency("ZAR");
            setRecipientAccount("");
            setSwiftCode("");
        }
        catch (err){
            setMessage(err.message || "Payment failed.");
        }

        // Placeholder for submission logic
        setMessage("Client-side validation passed. Reday to send to secure API endpoint!");
        console.log("Payment Data:", {amount, currency, recipientAccount, swiftCode});
    };
    return(
        <div className="form-container">
            <h2>International Payment</h2>
            <form onSubmit={handlePayNow}>
                <div className="form-group">
                    <label htmlFor="amount">Amount to Pay</label>
                    <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => handleChange(e, setAmount, 'amount', AMOUNT_REGEX, 'Amount must be a number (e.g., 100.00).')}
                        required
                        placeholder="Enter amount"/>
                </div>
                <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <input
                        id="currency"
                        type="text"
                        value={currency}
                        onChange={(e) => handleChange(e, setCurrency, 'currency', CURRENCY_REGEX, 'Currency must be a 3-letter code (e.g., ZAR).')}
                        required
                        placeholder="Enter currency"
                        maxLength="3"
                        style={{textTransform: 'uppercase'}}/>
                        {errors.currency && <p className="error-message">{errors.currency}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="recipientAccount">Recipient Account Number</label>
                    <input
                        id="recipientAccount"
                        type="text"
                        value={recipientAccount}
                        onChange={(e) => handleChange(e, setRecipientAccount, 'recipientAccount', RECIPIENT_ACCOUNT_REGEX, 'Account number must be 6 to 20 digits.')}
                        required
                        placeholder="Enter recipient account number"
                        />
                        {errors.recipientAccount && <p className="error-message">{errors.recipientAccount}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="swiftCode">SWIFT Code</label>
                    <input
                        id="swiftCode"
                        type="text"
                        value={swiftCode}
                        onChange={(e) => handleChange(e, setSwiftCode, 'swiftCode', SWIFT_CODE_REGEX, 'SWIFT code must be 8 or 11 alphanumeric characters.')}
                        required
                        placeholder="Enter SWIFT code"
                        maxLength="11"
                        style={{textTransform: 'uppercase'}}/>
                        {errors.swiftCode && <p className="error-message">{errors.swiftCode}</p>}
                </div>
                <button type="submit" className="submit-btn">
                    Pay Now
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default PaymentForm;