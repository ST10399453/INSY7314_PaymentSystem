"use client"

import { useState } from "react"
import { sendPayment } from "../api/payments"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"
import "../PaymentForm.css"

const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/
const RECIPIENT_ACCOUNT_REGEX = /^\d{6,20}$/
const SWIFT_CODE_REGEX = /^[A-Za-z0-9]{8,11}$/

function PaymentForm() {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ZAR")
  const [recipientAccount, setRecipientAccount] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e, setter, name, regex, errorMessage) => {
    const value = e.target.value
    setter(value)

    if (!regex.test(value) && value.length > 0) {
      setFieldErrors((prev) => ({ ...prev, [name]: [errorMessage] }))
    } else {
      setFieldErrors((prev) => {
        const { [name]: _removed, ...rest } = prev
        return rest
      })
    }
  }

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value)
    setFieldErrors((prev) => {
      const { currency: _removed, ...rest } = prev
      return rest
    })
  }

  const validateAllInputs = () => {
    const newErrors = {}
    let isValid = true

    const checks = [
      {
        name: "amount",
        value: amount,
        regex: AMOUNT_REGEX,
        message: "Amount must be a number with up to two decimals.",
      },
      {
        name: "recipientAccount",
        value: recipientAccount,
        regex: RECIPIENT_ACCOUNT_REGEX,
        message: "Recipient account must be 6 to 20 digits.",
      },
      {
        name: "swiftCode",
        value: swiftCode,
        regex: SWIFT_CODE_REGEX,
        message: "SWIFT code must be 8 or 11 alphanumeric characters.",
      },
    ]

    checks.forEach(({ name, value, regex, message }) => {
      if (!regex.test(value)) {
        newErrors[name] = [message]
        isValid = false
      }
    })

    setFieldErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError("")
    setSuccessMessage("")

    if (!validateAllInputs()) {
      setGeneralError("Please correct all payment input errors.")
      return
    }

    try {
      const paymentData = { amount, currency, recipientAccount, swiftCode }
      const token = localStorage.getItem("token")

      const res = await sendPayment(paymentData, token)

      setSuccessMessage(res.message || "Payment initiated successfully!")

      // Clear form on success
      setTimeout(() => {
        setAmount("")
        setCurrency("ZAR")
        setRecipientAccount("")
        setSwiftCode("")
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("[v0] Payment submission error:", err)

      // Handle backend validation errors
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {}
        err.errors.forEach((error) => {
          const field = error.path || error.param || "general"
          if (!backendErrors[field]) {
            backendErrors[field] = []
          }
          backendErrors[field].push(error.msg || error.message)
        })
        setFieldErrors(backendErrors)
      } else {
        setGeneralError(
          err.message ||
            "Network error: Unable to connect to the payment server. Please ensure the backend server is running on https://localhost:5000 and try again.",
        )
      }
    }
  }

   return (
    <div className="payment-form-wrapper">
      <div className="form-container payment-form">
        <div className="payment-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <h2>International Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Amount:
              <span className="tooltip" data-tooltip="Enter the payment amount with up to 2 decimal places">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) =>
                handleChange(e, setAmount, "amount", AMOUNT_REGEX, "Amount must be a number (e.g., 100.00).")
              }
              className={fieldErrors.amount?.length > 0 ? "error" : ""}
              required
              placeholder="Enter amount (e.g., 100.00)"
            />
            <ErrorMessage errors={fieldErrors.amount} />
          </div>

          <div className="form-group">
            <label>
              Currency:
              <span className="tooltip" data-tooltip="Select the currency for your payment">
                ⓘ
              </span>
            </label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className={fieldErrors.currency?.length > 0 ? "error" : ""}
              required
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
            <ErrorMessage errors={fieldErrors.currency} />
          </div>

          <div className="form-group">
            <label>
              Recipient Account Number:
              <span className="tooltip" data-tooltip="6-20 digit account number">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={recipientAccount}
              onChange={(e) =>
                handleChange(
                  e,
                  setRecipientAccount,
                  "recipientAccount",
                  RECIPIENT_ACCOUNT_REGEX,
                  "Account number must be 6 to 20 digits.",
                )
              }
              className={fieldErrors.recipientAccount?.length > 0 ? "error" : ""}
              required
              placeholder="Enter recipient account number"
            />
            <ErrorMessage errors={fieldErrors.recipientAccount} />
          </div>

          <div className="form-group">
            <label>
              SWIFT Code:
              <span className="tooltip" data-tooltip="8 or 11 character bank identifier code">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              value={swiftCode}
              onChange={(e) =>
                handleChange(
                  { target: { value: e.target.value.toUpperCase() } },
                  setSwiftCode,
                  "swiftCode",
                  SWIFT_CODE_REGEX,
                  "SWIFT code must be 8 or 11 alphanumeric characters.",
                )
              }
              className={fieldErrors.swiftCode?.length > 0 ? "error" : ""}
              required
              placeholder="Enter SWIFT code"
              maxLength="11"
              style={{ textTransform: "uppercase" }}
            />
            <ErrorMessage errors={fieldErrors.swiftCode} />
          </div>

          <button type="submit" className="submit-btn">
            Submit Payment
          </button>
        </form>

        {generalError && <div className="general-error">{generalError}</div>}
        <SuccessMessage message={successMessage} />

        <div className="security-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Secured with 256-bit encryption
        </div>
      </div>
    </div>
  )
}

export default PaymentForm
